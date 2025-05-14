import math
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func

from ..models.database import AnalysisHistory
from ..models.schema import HistoryItem, HistoryListResponse, HistoryDetailResponse


class HistoryService:
    @staticmethod
    async def get_history_list(
        db: Session,
        page: int = 1,
        limit: int = 10,
        sort: str = "timestamp_desc",
        status: Optional[str] = None,
        main_category: Optional[str] = None,
        url_contains: Optional[str] = None,
    ) -> HistoryListResponse:
        """
        解析履歴の一覧を取得する
        """
        # クエリの作成
        query = db.query(AnalysisHistory)

        # フィルタの適用
        if status and status != "all":
            query = query.filter(AnalysisHistory.status == status)
        if main_category:
            query = query.filter(AnalysisHistory.main_category == main_category)
        if url_contains:
            query = query.filter(AnalysisHistory.url.contains(url_contains))

        # 総数を取得
        total_count = query.count()

        # ソートの適用
        if sort == "timestamp_desc":
            query = query.order_by(desc(AnalysisHistory.timestamp))
        elif sort == "timestamp_asc":
            query = query.order_by(asc(AnalysisHistory.timestamp))

        # ページネーションの適用
        query = query.offset((page - 1) * limit).limit(limit)

        # 結果の取得
        history_items = query.all()

        # ページ数の計算
        total_pages = math.ceil(total_count / limit) if total_count > 0 else 1

        # レスポンスの作成
        items = [HistoryItem(**item.to_dict()) for item in history_items]

        return HistoryListResponse(
            items=items, total=total_count, page=page, limit=limit, pages=total_pages
        )

    @staticmethod
    async def get_unique_categories(db: Session) -> List[str]:
        """
        解析履歴に存在するユニークなメインカテゴリの一覧を取得する
        """
        result = (
            db.query(AnalysisHistory.main_category)
            .filter(AnalysisHistory.main_category.isnot(None))
            .distinct()
            .all()
        )

        # 結果を1次元リストに変換
        categories = [r[0] for r in result if r[0]]
        return sorted(categories)

    @staticmethod
    async def get_history_by_id(
        db: Session, history_id: str
    ) -> Optional[HistoryDetailResponse]:
        """
        指定されたIDの履歴詳細を取得する
        """
        history_item = (
            db.query(AnalysisHistory).filter(AnalysisHistory.id == history_id).first()
        )

        if not history_item:
            return None

        # 詳細データを辞書に変換
        history_dict = history_item.to_detail_dict()

        return HistoryDetailResponse(**history_dict)
