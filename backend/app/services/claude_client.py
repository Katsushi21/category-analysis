import os
import json
import logging
import asyncio
import base64
from typing import Dict, Any, Optional, List, Union
from anthropic import AsyncAnthropic

from app.core.config import settings

logger = logging.getLogger(__name__)

# gemini_client.pyと同じメインカテゴリリスト
MAIN_CATEGORY = [
    '金融・保険',
    '不動産',
    '教育',
    '美容・化粧品',
    '健康・医薬品',
    '病院・クリニック',
    'ビジネス',
    'アプリ・システム',
    '求人・転職',
    '生活サービス',
    '家電・デジタル',
    '食品',
    '外食サービス',
    '旅行・レジャー',
    'ファッション',
    'エンターテイメント',
    '生活・日用品',
    'スポーツ・アウトドア',
    '自動車関連',
    '住宅・インテリア',
    'ペット',
    '公営ギャンブル',
    '官公庁・地方自治体・公共サービス',
]


class ClaudeClient:
    def __init__(self):
        self._initialize_client()

    def _initialize_client(self):
        """Claude APIクライアントを初期化する"""
        if not settings.CLAUDE_API_KEY:
            raise ValueError(
                "CLAUDE_API_KEYが設定されていません。環境変数を確認してください。"
            )

        self.client = AsyncAnthropic(api_key=settings.CLAUDE_API_KEY)
        self.model = "claude-3-5-haiku-20241022"

    async def analyze_website_with_content(
        self, url: str, content: str
    ) -> Dict[str, Any]:
        """
        ウェブサイトの内容を解析してカテゴリを判定する

        Args:
            url: 解析対象のURL
            content: ウェブサイトのコンテンツ

        Returns:
            解析結果の辞書
        """
        prompt = self._create_analysis_with_content_prompt(url, content)

        try:

            # Claude APIを使用してコンテンツを分析
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                system="あなたはウェブサイト分析の専門家です。JSONフォーマットで正確に回答してください。",
                messages=[{"role": "user", "content": prompt}],
            )

            # レスポンスからJSON形式の文字列を抽出
            result_text = response.content[0].text

            # JSON文字列をパースして返す
            parsed_result = self._parse_response(result_text)
            return parsed_result

        except Exception as e:
            logger.error(f"Claude APIの呼び出し中にエラーが発生しました: {str(e)}")
            raise Exception(f"Claude APIの呼び出し中にエラーが発生しました: {str(e)}")

    async def analyze_website_with_url(self, url: str) -> Dict[str, Any]:
        """
        ウェブサイトの内容を解析してカテゴリを判定する

        Args:
            url: 解析対象のURL

        Returns:
            解析結果の辞書
        """
        prompt = self._create_analysis_with_url_prompt(url)

        try:
            # Claude APIを使用してコンテンツを分析
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                system="あなたはウェブサイト分析の専門家です。JSONフォーマットで正確に回答してください。",
                messages=[{"role": "user", "content": prompt}],
            )

            # レスポンスからJSON形式の文字列を抽出
            result_text = response.content[0].text

            # JSON文字列をパースして返す
            parsed_result = self._parse_response(result_text)
            return parsed_result

        except Exception as e:
            logger.error(f"Claude APIの呼び出し中にエラーが発生しました: {str(e)}")
            raise Exception(f"Claude APIの呼び出し中にエラーが発生しました: {str(e)}")

    async def analyze_website_with_screenshot(
        self, url: str, screenshot_data: Optional[bytes] = None
    ) -> Dict[str, Any]:
        """
        ウェブサイトのスクリーンショットを使って解析を行う

        Args:
            url: 解析対象のURL
            screenshot_data: スクリーンショットのバイナリデータ（指定しない場合は自動取得）

        Returns:
            解析結果の辞書
        """
        # スクリーンショットがない場合は自動取得
        if screenshot_data is None:
            from app.services.web_screenshotter import WebScreenshotter

            async with WebScreenshotter(headless=True) as screenshotter:
                screenshot_data = await screenshotter.take_screenshot(
                    url, format="jpeg", compress=True, quality=80, max_size=(1200, 8000)
                )
                logger.info(f"URLからスクリーンショットを自動取得しました: {url}")

        # Base64エンコードに変換
        base64_image = base64.b64encode(screenshot_data).decode('utf-8')

        # プロンプトテキストを作成
        prompt_text = self._create_screenshot_analysis_prompt(url)

        # Claude APIに送信するメッセージを構築
        message_content = [
            {"type": "text", "text": prompt_text},
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": base64_image,
                },
            },
        ]

        try:
            # raise Exception("test")
            # Claude APIを使用してコンテンツを分析
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                system="あなたはウェブサイト分析の専門家です。JSONフォーマットで正確に回答してください。",
                messages=[{"role": "user", "content": message_content}],
            )

            # レスポンスからJSON形式の文字列を抽出
            result_text = response.content[0].text

            # JSON文字列をパースして返す
            parsed_result = self._parse_response(result_text)
            return parsed_result

        except Exception as e:
            logger.error(f"Claude APIの呼び出し中にエラーが発生しました: {str(e)}")
            raise Exception(f"Claude APIの呼び出し中にエラーが発生しました: {str(e)}")

    async def analyze_website(
        self,
        url: str,
        content: str,
        screenshot_data: Optional[bytes] = None,
    ) -> Dict[str, Any]:
        """
        ウェブサイトのテキストコンテンツとスクリーンショットの両方を使って解析を行う

        Args:
            url: 解析対象のURL
            content: ウェブサイトのテキストコンテンツ
            screenshot_data: スクリーンショットのバイナリデータ（指定しない場合は自動取得）

        Returns:
            解析結果の辞書
        """
        # スクリーンショットがない場合は自動取得
        if screenshot_data is None:
            from app.services.web_screenshotter import WebScreenshotter

            async with WebScreenshotter(headless=True) as screenshotter:
                screenshot_data = await screenshotter.take_screenshot(
                    url, format="jpeg", compress=True, quality=80, max_size=(1200, 800)
                )
                logger.info(f"URLからスクリーンショットを自動取得しました: {url}")

        # Base64エンコードに変換
        base64_image = base64.b64encode(screenshot_data).decode('utf-8')

        # プロンプトテキストを作成
        prompt_text = self._create_combined_analysis_prompt(url, content)

        # Claude APIに送信するメッセージを構築
        message_content = [
            {"type": "text", "text": prompt_text},
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": base64_image,
                },
            },
        ]

        try:
            logger.info(f"Claude APIに送信するメッセージ: {message_content}")
            # Claude APIを使用してコンテンツを分析
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                system="あなたはウェブサイト分析の専門家です。テキストコンテンツと視覚情報を総合的に分析し、JSONフォーマットで正確に回答してください。",
                messages=[{"role": "user", "content": message_content}],
            )

            # レスポンスからJSON形式の文字列を抽出
            result_text = response.content[0].text

            # JSON文字列をパースして返す
            parsed_result = self._parse_response(result_text)
            return parsed_result

        except Exception as e:
            logger.error(f"Claude APIの呼び出し中にエラーが発生しました: {str(e)}")
            raise Exception(f"Claude APIの呼び出し中にエラーが発生しました: {str(e)}")

    def _create_analysis_with_content_prompt(self, url: str, content: str) -> str:
        """解析用のプロンプトを作成する"""
        prompt = f"""
あなたはウェブサイト分析の専門家です。以下のウェブサイトのコンテンツを分析し、そのビジネスまたはサービスが属するカテゴリを特定してください。

ウェブサイトURL: {url}
ウェブサイトのコンテンツ: {content[:10000]}
メインカテゴリ候補: {MAIN_CATEGORY}

以下の形式でJSON形式で回答してください：
```json
{{
  "main_category": "メインカテゴリ候補の中から最も適切な1つ",
  "sub_categories": [
    {{"name": "サブカテゴリ1", "confidence": 確信度(0.0〜1.0)}},
    {{"name": "サブカテゴリ2", "confidence": 確信度(0.0〜1.0)}}
    // 最大5つのサブカテゴリ
  ],
  "confidence": 確信度(0.0〜1.0),
  "description": "このウェブサイトが提供する商品やサービスの簡潔な説明（100字以内）",
  "target_audience": "想定されるターゲットユーザーや顧客層（100字以内）",
  "value_proposition": "ウェブサイトが提示している主な価値提案（100字以内）"
}}
```

考慮すべき点：
1. ウェブサイトの主要な目的とターゲットオーディエンス
2. 提供されている商品やサービスの性質
3. ウェブサイトで使用されている専門用語や業界特有の表現
4. 競合他社や類似サービスへの言及

JSONフォーマットのみで回答してください。その他の説明は不要です。
"""
        return prompt

    def _create_analysis_with_url_prompt(self, url: str) -> str:
        """解析用のプロンプトを作成する"""
        prompt = f"""
あなたはウェブサイト分析の専門家です。以下のウェブサイトのコンテンツを分析し、そのビジネスまたはサービスが属するカテゴリを特定してください。

ウェブサイトURL: {url}
メインカテゴリ候補: {MAIN_CATEGORY}

以下の形式でJSON形式で回答してください：
```json
{{
  "main_category": "メインカテゴリ候補の中から最も適切な1つ",
  "sub_categories": [
    {{"name": "サブカテゴリ1", "confidence": 確信度(0.0〜1.0)}},
    {{"name": "サブカテゴリ2", "confidence": 確信度(0.0〜1.0)}}
    // 最大5つのサブカテゴリ
  ],
  "confidence": 確信度(0.0〜1.0),
  "description": "このウェブサイトが提供する商品やサービスの簡潔な説明（100字以内）",
  "target_audience": "想定されるターゲットユーザーや顧客層（100字以内）",
  "value_proposition": "ウェブサイトが提示している主な価値提案（100字以内）"
}}
```

考慮すべき点：
1. ウェブサイトの主要な目的とターゲットオーディエンス
2. 提供されている商品やサービスの性質
3. ウェブサイトで使用されている専門用語や業界特有の表現
4. 競合他社や類似サービスへの言及

JSONフォーマットのみで回答してください。その他の説明は不要です。
"""
        return prompt

    def _create_screenshot_analysis_prompt(self, url: str) -> str:
        """スクリーンショット解析用のプロンプトを作成する"""
        prompt = f"""
あなたはウェブサイト分析の専門家です。以下のウェブサイトのスクリーンショットとURLを分析し、そのビジネスまたはサービスが属するカテゴリを特定してください。

ウェブサイトURL: {url}

画像にはウェブサイトのスクリーンショットが含まれています。以下の視覚的要素に注目して分析してください：
1. サイトのデザインとブランディング
2. 画像、アイコン、ロゴ
3. ページ構造とレイアウト
4. 色使いと全体的な印象
5. コンテンツの視覚的階層

メインカテゴリ候補: {MAIN_CATEGORY}

以下の形式でJSON形式で回答してください：
```json
{{
  "main_category": "メインカテゴリ候補の中から最も適切な1つ",
  "sub_categories": [
    {{"name": "サブカテゴリ1", "confidence": 確信度(0.0〜1.0)}},
    {{"name": "サブカテゴリ2", "confidence": 確信度(0.0〜1.0)}}
    // 最大5つのサブカテゴリ
  ],
  "confidence": 確信度(0.0〜1.0),
  "description": "このウェブサイトが提供する商品やサービスの簡潔な説明（100字以内）",
  "target_audience": "想定されるターゲットユーザーや顧客層（100字以内）",
  "value_proposition": "ウェブサイトが提示している主な価値提案（100字以内）"
}}
```

視覚的要素とテキスト内容の両方を考慮し、総合的に判断してください。

JSONフォーマットのみで回答してください。その他の説明は不要です。
"""
        return prompt

    def _create_combined_analysis_prompt(self, url: str, content: str) -> str:
        """テキストとスクリーンショット両方を使用した解析用のプロンプトを作成する"""
        prompt = f"""
あなたはウェブサイト分析の専門家です。以下のウェブサイトのテキストコンテンツとスクリーンショットの両方を分析し、そのビジネスまたはサービスが属するカテゴリを特定してください。

ウェブサイトURL: {url}

【テキスト情報】
以下はウェブサイトから抽出したテキストコンテンツです：
{content[:10000]}

【視覚情報】
添付されているスクリーンショットには、ウェブサイトの視覚的表現が含まれています。以下の視覚的要素に注目して分析してください：
1. サイトのデザインとブランディング要素
2. 画像、アイコン、ロゴなどのビジュアル
3. ページ構造とレイアウト
4. 色使いとスタイル
5. コンテンツの視覚的階層と強調されている部分

【総合分析の指示】
テキストと視覚情報の両方を組み合わせて、以下の観点から総合的に分析してください：
1. テキストと視覚要素の一貫性
2. 視覚的に強調されている内容と実際のテキスト内容の関係
3. サイト全体のトーンと印象がカテゴリ判定にどう影響するか
4. ブランディング要素から読み取れる業種や専門性

メインカテゴリ候補: {MAIN_CATEGORY}

以下の形式でJSON形式で回答してください：
```json
{{
  "main_category": "メインカテゴリ候補の中から最も適切な1つ",
  "sub_categories": [
    {{"name": "サブカテゴリ1", "confidence": 確信度(0.0〜1.0)}},
    {{"name": "サブカテゴリ2", "confidence": 確信度(0.0〜1.0)}}
    // 最大5つのサブカテゴリ
  ],
  "confidence": 確信度(0.0〜1.0),
  "description": "このウェブサイトが提供する商品やサービスの簡潔な説明（100字以内）",
  "target_audience": "想定されるターゲットユーザーや顧客層（100字以内）",
  "value_proposition": "ウェブサイトが提示している主な価値提案（100字以内）"
}}
```

視覚的要素とテキスト内容の両方を考慮し、総合的に判断してください。特に、両方の情報源から読み取れる業種やサービスの専門性に注目してください。

JSONフォーマットのみで回答してください。その他の説明は不要です。
"""
        return prompt

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Claude APIからのレスポンスをパースする

        Args:
            response_text: Claude APIからのレスポンステキスト

        Returns:
            解析結果の辞書
        """
        # JSON部分を抽出
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1

        if json_start == -1 or json_end == 0:
            raise ValueError("レスポンスからJSONデータを抽出できませんでした")

        json_str = response_text[json_start:json_end]

        try:
            result = json.loads(json_str)
            return result
        except json.JSONDecodeError:
            raise ValueError("JSONデータの解析に失敗しました")
