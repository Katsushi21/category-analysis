import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.api import api_router
from app.core.config import settings

# FastAPIアプリケーションの作成
app = FastAPI(
    title="カテゴリ解析API",
    description="AIを使用してウェブサイトのコンテンツを解析し、カテゴリを判定するAPIです。",
    version="1.0.0",
)


# セキュリティヘッダーミドルウェア
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Referrer-Policy"] = "no-referrer-when-downgrade"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["X-Frame-Options"] = "DENY"
        return response


# ミドルウェアの追加
app.add_middleware(SecurityHeadersMiddleware)

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "Content-Length", "Content-Disposition"],
    max_age=600,  # プリフライトリクエストの結果をキャッシュする時間（秒）
)

# 信頼できるホストの設定
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],  # プロダクション環境ではより制限的に設定することを推奨
)

# APIルーターを追加
app.include_router(api_router, prefix=settings.API_BASE_PATH)


# ヘルスチェックエンドポイント
@app.get("/health")
async def health_check():
    return {"status": "ok"}


# アプリケーションが直接実行された場合
if __name__ == "__main__":
    uvicorn.run("run:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)
