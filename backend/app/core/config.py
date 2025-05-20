import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()


class Settings(BaseSettings):
    # API設定
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8001"))
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")

    # 環境設定
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")

    # Gemini API設定
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL_NAME: str = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")

    # Claude API設定
    CLAUDE_API_KEY: str = os.getenv("CLAUDE_API_KEY", "")

    # AI モデル設定 (gemini または claude)
    AI_MODEL_PROVIDER: str = os.getenv("AI_MODEL_PROVIDER", "gemini")

    # PostgreSQL接続設定
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/categorydb"
    )

    # セキュリティ設定
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")

    # CORS設定
    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3001,http://frontend:3001"
    )

    # APIのベースパス
    API_BASE_PATH: str = os.getenv("API_BASE_PATH", "/api")

    @property
    def CORS_ORIGINS(self) -> list:
        return self.ALLOWED_ORIGINS.split(",")

    # ログ設定
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = 'ignore'


settings = Settings()

# カテゴリ分析の設定
MAX_SUBCATEGORIES = 5  # 表示する最大サブカテゴリ数
