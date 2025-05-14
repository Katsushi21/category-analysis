import logging
from typing import Any

from app.core.config import settings
from app.services.gemini_client import GeminiClient
from app.services.claude_client import ClaudeClient

logger = logging.getLogger(__name__)


class AIClientFactory:
    """環境変数に基づいて適切なAIクライアントを提供するファクトリークラス"""

    @staticmethod
    def get_client() -> Any:
        """
        環境変数 AI_MODEL_PROVIDER に基づいて適切なAIクライアントを返す

        Returns:
            GeminiClient または ClaudeClient のインスタンス
        """
        provider = settings.AI_MODEL_PROVIDER.lower()

        logger.info(f"AIクライアント作成: プロバイダー「{provider}」を使用します")

        if provider == "claude":
            logger.info("Claude APIクライアントを初期化します")
            return ClaudeClient()
        else:
            # デフォルトはGemini
            logger.info("Gemini APIクライアントを初期化します")
            return GeminiClient()
