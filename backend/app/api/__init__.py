from fastapi import APIRouter
from .endpoints import analysis, categories, history

# APIルーター
api_router = APIRouter()

# エンドポイントのルーターをメインルーターに追加
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(categories.router, prefix="/reference", tags=["reference"])
api_router.include_router(history.router, prefix="/analysis/history", tags=["history"])
