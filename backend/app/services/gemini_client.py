import json
import logging
import google.generativeai as genai
from typing import Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)

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


class GeminiClient:
    def __init__(self):
        self._initialize_client()

    def _initialize_client(self):
        """Gemini APIクライアントを初期化する"""
        if not settings.GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEYが設定されていません。環境変数を確認してください。"
            )

        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL_NAME)

    async def analyze_website(self, url: str, content: str) -> Dict[str, Any]:
        """
        ウェブサイトの内容を解析してカテゴリを判定する

        Args:
            url: 解析対象のURL
            content: ウェブサイトのHTMLコンテンツ

        Returns:
            解析結果の辞書
        """
        prompt = self._create_analysis_prompt(url, content)

        try:
            response = self.model.generate_content(prompt)

            # レスポンスからトークン使用量を取得
            usage_metadata = response.usage_metadata

            # 入力と出力のトークン数を表示
            input_tokens = usage_metadata.prompt_token_count
            output_tokens = usage_metadata.candidates_token_count
            total_tokens = input_tokens + output_tokens

            print(f"入力トークン数: {input_tokens}")
            print(f"出力トークン数: {output_tokens}")
            print(f"合計トークン数: {total_tokens}")

            # レスポンスからJSON形式の文字列を抽出
            result_text = response.text

            # JSON文字列をパースして返す
            parsed_result = self._parse_response(result_text)
            return parsed_result

        except Exception as e:
            raise Exception(f"Gemini APIの呼び出し中にエラーが発生しました: {str(e)}")

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

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Gemini APIからのレスポンスをパースする

        Args:
            response_text: Gemini APIからのレスポンステキスト

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
