from typing import Dict, Any, List, Optional, Tuple
import asyncio
import json
import uuid
import logging
from datetime import datetime, timedelta

from ..models.schema import (
    CategoryAnalysis,
    SubCategory,
    AnalysisResponse,
    BatchAnalysisResponse,
)
from ..models.database import AnalysisHistory, SessionLocal
from ..utils.url_normalizer import normalize_url
from .crawler import WebCrawler
from .ai_client_factory import AIClientFactory

logger = logging.getLogger(__name__)


class WebsiteAnalyzer:
    def __init__(self):
        self.crawler = WebCrawler()
        self.ai_client = AIClientFactory.get_client()
        # キャッシュの有効期限（日数）
        self.cache_expiry_days = 7  # 設定ファイルから読み込むようにも可能

    async def analyze_url(
        self, url: str, force_refresh: bool = False
    ) -> AnalysisResponse:
        """
        単一のURLを解析して結果を返す

        Args:
            url: 解析対象のURL
            force_refresh: キャッシュを無視して強制的に再解析するかどうか

        Returns:
            解析結果
        """
        try:
            # URLを正規化
            normalized_url = normalize_url(url)

            # キャッシュチェック（force_refreshがFalseの場合のみ）
            if not force_refresh:
                cached_result = await self._check_cache(normalized_url)
                if cached_result:
                    logger.info(f"キャッシュから結果を返却: {url}")
                    return cached_result

            # キャッシュミスまたは強制更新の場合は通常通り解析
            # Webページの内容を取得
            content = await self.crawler.fetch_url_content(url)

            # AIモデルを使ってカテゴリを判定
            result = await self.ai_client.analyze_website(url, content)

            # 成功レスポンスの作成
            response = AnalysisResponse(url=url, status="success", analysis=result)

            # 解析結果をデータベースに保存
            await self._save_analysis_result(normalized_url, "success", result=result)

            return response

        except Exception as e:
            logger.error(f"URL解析中にエラーが発生しました: {str(e)}")

            # エラーレスポンスの作成
            error_response = AnalysisResponse(
                url=url,
                status="failed",
                error=f"解析中にエラーが発生しました: {str(e)}",
            )

            # エラー情報をデータベースに保存
            await self._save_analysis_result(normalize_url(url), "failed", error=str(e))

            return error_response

    async def analyze_urls_batch(
        self, urls: List[str], force_refresh: bool = False
    ) -> BatchAnalysisResponse:
        """
        複数のURLを一括で解析して結果を返す

        Args:
            urls: 解析対象のURLリスト
            force_refresh: キャッシュを無視して強制的に再解析するかどうか

        Returns:
            一括解析結果
        """
        # バッチ処理の最適化: 事前にキャッシュ状態を一括チェック
        normalized_urls = [normalize_url(url) for url in urls]
        cached_results = {}

        if not force_refresh:
            cached_results = await self._batch_check_cache(normalized_urls)

        # キャッシュされていないURLのみを抽出
        urls_to_analyze = []
        for i, url in enumerate(urls):
            if normalized_urls[i] not in cached_results:
                urls_to_analyze.append(url)

        # キャッシュされていないURLのみ解析を実行
        tasks = [self.analyze_url(url, force_refresh=True) for url in urls_to_analyze]
        fresh_results = await asyncio.gather(*tasks, return_exceptions=True)

        # 結果を統合
        all_results = []

        # キャッシュ結果を追加
        for orig_url, norm_url in zip(urls, normalized_urls):
            if norm_url in cached_results:
                result = cached_results[norm_url]
                # オリジナルURLに置き換え
                result.url = orig_url
                all_results.append(result)

        # 新規解析の結果を追加
        for result in fresh_results:
            if isinstance(result, Exception):
                # 例外を適切なレスポンスに変換
                all_results.append(
                    AnalysisResponse(
                        url="Unknown URL",
                        status="failed",
                        error=f"予期せぬエラー: {str(result)}",
                    )
                )
            else:
                all_results.append(result)

        # URLの順序を元に戻す
        result_dict = {r.url: r for r in all_results}
        ordered_results = [
            result_dict.get(
                url,
                AnalysisResponse(url=url, status="failed", error="解析に失敗しました"),
            )
            for url in urls
        ]

        # 一括解析の結果をデータベースに保存
        batch_id = f"batch_{uuid.uuid4().hex}"
        await self._save_batch_analysis(batch_id, ordered_results)

        # 成功数と失敗数をカウント
        success_count = sum(1 for r in ordered_results if r.status == "success")
        failed_count = len(ordered_results) - success_count

        return BatchAnalysisResponse(
            results=ordered_results,
            total=len(ordered_results),
            success=success_count,
            failed=failed_count,
        )

    async def _check_cache(self, normalized_url: str) -> Optional[AnalysisResponse]:
        """
        指定URLのキャッシュをチェックする

        Args:
            normalized_url: 正規化されたURL

        Returns:
            キャッシュがヒットした場合はAnalysisResponse、そうでなければNone
        """
        db = SessionLocal()
        try:
            # キャッシュ有効期限の計算
            cache_date = datetime.now() - timedelta(days=self.cache_expiry_days)

            # 最新の成功した解析結果を取得
            history = (
                db.query(AnalysisHistory)
                .filter(
                    AnalysisHistory.url == normalized_url,
                    AnalysisHistory.status == "success",
                    AnalysisHistory.timestamp >= cache_date,
                )
                .order_by(AnalysisHistory.timestamp.desc())
                .first()
            )

            if history:
                # キャッシュヒット
                logger.info(
                    f"キャッシュヒット: {normalized_url}, 解析日時: {history.timestamp}"
                )

                # レスポンスを構築
                # analysis辞書をCategoryAnalysisモデルに変換
                category_analysis = self._convert_to_category_analysis(history.analysis)

                response = AnalysisResponse(
                    url=normalized_url,
                    status="success",
                    analysis=category_analysis,
                    from_cache=True,  # キャッシュから取得したことを示す
                )
                return response

            # キャッシュミス
            return None

        finally:
            db.close()

    async def _batch_check_cache(
        self, normalized_urls: List[str]
    ) -> Dict[str, AnalysisResponse]:
        """
        複数URLのキャッシュを一括でチェックする

        Args:
            normalized_urls: 正規化されたURLのリスト

        Returns:
            キャッシュヒットしたURLとそのレスポンスの辞書
        """
        result = {}
        db = SessionLocal()
        try:
            # キャッシュ有効期限の計算
            cache_date = datetime.now() - timedelta(days=self.cache_expiry_days)

            # 複数URLに一致する最新の成功した解析結果を取得
            histories = (
                db.query(AnalysisHistory)
                .filter(
                    AnalysisHistory.url.in_(normalized_urls),
                    AnalysisHistory.status == "success",
                    AnalysisHistory.timestamp >= cache_date,
                )
                .all()
            )

            # URL別に最新の結果だけを残す
            latest_by_url = {}
            for history in histories:
                if (
                    history.url not in latest_by_url
                    or history.timestamp > latest_by_url[history.url].timestamp
                ):
                    latest_by_url[history.url] = history

            # レスポンスを構築
            for url, history in latest_by_url.items():
                # analysis辞書をCategoryAnalysisモデルに変換
                category_analysis = self._convert_to_category_analysis(history.analysis)

                result[url] = AnalysisResponse(
                    url=url,
                    status="success",
                    analysis=category_analysis,
                    from_cache=True,  # キャッシュから取得したことを示す
                )

            return result

        finally:
            db.close()

    async def _save_analysis_result(
        self,
        url: str,
        status: str,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
        is_batch: bool = False,
        batch_id: Optional[str] = None,
    ) -> str:
        """
        解析結果をデータベースに保存する
        """
        try:
            # セッションの作成
            db = SessionLocal()

            # 解析履歴の作成
            history = AnalysisHistory(
                id=AnalysisHistory.generate_id(),
                url=url,
                status=status,
                is_batch=is_batch,
                batch_id=batch_id,
            )

            # 成功時の情報を設定
            if status == "success" and result:
                history.main_category = result.get("main_category")
                history.confidence = result.get("confidence")
                history.analysis = result

            # 失敗時のエラー情報を設定
            if status == "failed" and error:
                history.error = error

            # データベースに保存
            db.add(history)
            db.commit()
            db.refresh(history)

            history_id = history.id

            # セッションを閉じる
            db.close()

            return history_id

        except Exception as e:
            logger.error(f"解析結果の保存中にエラーが発生しました: {str(e)}")
            # エラーが発生しても処理を続行
            return ""

    async def _save_batch_analysis(
        self, batch_id: str, results: List[AnalysisResponse]
    ) -> None:
        """
        一括解析の結果をデータベースに保存する
        """
        for result in results:
            if result.status == "success":
                await self._save_analysis_result(
                    url=result.url,
                    status="success",
                    result=result.analysis.dict() if result.analysis else None,
                    is_batch=True,
                    batch_id=batch_id,
                )
            else:
                await self._save_analysis_result(
                    url=result.url,
                    status="failed",
                    error=result.error,
                    is_batch=True,
                    batch_id=batch_id,
                )

    def _convert_to_category_analysis(
        self, analysis_result: Dict[str, Any]
    ) -> CategoryAnalysis:
        """
        AI APIからの解析結果をCategoryAnalysisモデルに変換する

        Args:
            analysis_result: AI APIからの解析結果

        Returns:
            CategoryAnalysis: 変換された解析結果
        """
        # サブカテゴリを変換
        sub_categories = []
        if "sub_categories" in analysis_result:
            for sub_cat in analysis_result["sub_categories"]:
                sub_categories.append(
                    SubCategory(name=sub_cat["name"], confidence=sub_cat["confidence"])
                )

        return CategoryAnalysis(
            main_category=analysis_result.get("main_category", "不明"),
            sub_categories=sub_categories,
            confidence=analysis_result.get("confidence", 0.0),
            description=analysis_result.get("description"),
            target_audience=analysis_result.get("target_audience"),
            value_proposition=analysis_result.get("value_proposition"),
        )
