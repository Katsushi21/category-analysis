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

    async def analyze_website(self, url: str, content: str) -> Dict[str, Any]:
        """
        ウェブサイトの内容を解析してカテゴリを判定する

        Args:
            url: 解析対象のURL
            content: ウェブサイトのコンテンツ

        Returns:
            解析結果の辞書
        """
        prompt = self._create_analysis_prompt(url, content)

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
        ウェブサイトのURLを解析してカテゴリを判定する

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

    def _create_analysis_prompt(self, url: str, content: str) -> str:
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
        """URLのみの解析用プロンプトを作成する"""
        prompt = f"""
あなたはウェブサイト分析の専門家です。以下のウェブサイトのURLを分析し、そのビジネスまたはサービスが属するカテゴリを特定してください。

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
1. ウェブサイトのURLから読み取れるドメイン名や構造
2. ウェブサイトの主要な目的とターゲットオーディエンス
3. 提供されている可能性のある商品やサービスの性質

URLだけからの判断なので、確信度は低く設定してください。
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
