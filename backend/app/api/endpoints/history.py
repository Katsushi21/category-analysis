from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from sqlalchemy.orm import Session

from ...models.schema import HistoryListResponse, HistoryDetailResponse
from ...models.database import get_db
from ...services.history_service import HistoryService

router = APIRouter()


@router.get("/", response_model=HistoryListResponse)
async def get_history(
    page: int = Query(1, ge=1, description="ページ番号"),
    limit: int = Query(10, ge=1, le=50, description="1ページあたりの表示件数"),
    sort: str = Query(
        "timestamp_desc", description="ソート順 (timestamp_desc, timestamp_asc)"
    ),
    status: Optional[str] = Query(
        None, description="ステータスフィルタ (success, failed, all)"
    ),
    main_category: Optional[str] = Query(None, description="メインカテゴリでフィルタ"),
    url_contains: Optional[str] = Query(None, description="URL部分一致検索"),
    db: Session = Depends(get_db),
):
    """
    解析履歴の一覧を取得する
    """
    # クエリパラメータのバリデーション
    if sort not in ["timestamp_desc", "timestamp_asc"]:
        sort = "timestamp_desc"

    if status and status not in ["success", "failed", "all"]:
        status = None

    # 履歴一覧を取得
    return await HistoryService.get_history_list(
        db, page, limit, sort, status, main_category, url_contains
    )


@router.get("/categories", response_model=List[str])
async def get_categories(db: Session = Depends(get_db)):
    """
    解析履歴に存在するメインカテゴリの一覧を取得する
    """
    return await HistoryService.get_unique_categories(db)


@router.get("/{history_id}", response_model=HistoryDetailResponse)
async def get_history_detail(
    history_id: str,
    db: Session = Depends(get_db),
):
    """
    特定の解析履歴の詳細を取得する
    """
    history_item = await HistoryService.get_history_by_id(db, history_id)

    if not history_item:
        raise HTTPException(
            status_code=404, detail=f"履歴ID '{history_id}' が見つかりません"
        )

    return history_item
