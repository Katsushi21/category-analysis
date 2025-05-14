from fastapi import (
    APIRouter,
    HTTPException,
    UploadFile,
    File,
    Form,
    Query,
    BackgroundTasks,
)
from typing import List, Optional
import csv
import io
import asyncio

from ...models.schema import (
    AnalysisRequest,
    AnalysisResponse,
    BatchAnalysisRequest,
    BatchAnalysisResponse,
)
from ...services.analyzer import WebsiteAnalyzer

router = APIRouter()
analyzer = WebsiteAnalyzer()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_url(
    request: AnalysisRequest,
    force_refresh: bool = Query(
        False, description="キャッシュを無視して強制的に再解析する"
    ),
):
    """
    単一のURLを解析する
    """
    url = str(request.url)
    return await analyzer.analyze_url(url, force_refresh=force_refresh)


@router.post("/analyze-batch", response_model=BatchAnalysisResponse)
async def analyze_batch(
    request: BatchAnalysisRequest,
    force_refresh: bool = Query(
        False, description="キャッシュを無視して強制的に再解析する"
    ),
):
    """
    複数のURLを一括で解析する
    """
    urls = [str(url) for url in request.urls]
    return await analyzer.analyze_urls_batch(urls, force_refresh=force_refresh)


@router.post("/analyze-csv", response_model=BatchAnalysisResponse)
async def analyze_csv(
    file: UploadFile = File(...),
    column_name: Optional[str] = Form("url"),
    force_refresh: bool = Form(
        False, description="キャッシュを無視して強制的に再解析する"
    ),
):
    """
    CSVファイルからURLを読み込んで一括解析する
    """
    try:
        # CSVファイルを読み込む
        content = await file.read()
        csv_data = io.StringIO(content.decode('utf-8'))
        reader = csv.DictReader(csv_data)

        # URL列が存在するか確認
        if column_name not in reader.fieldnames:
            raise HTTPException(
                status_code=400,
                detail=f"CSV内に'{column_name}'列が見つかりません。列名を確認してください。",
            )

        # URLのリストを抽出
        urls = [row[column_name] for row in reader if row[column_name]]

        if not urls:
            raise HTTPException(
                status_code=400, detail="解析対象のURLが見つかりませんでした。"
            )

        # URLを一括解析
        return await analyzer.analyze_urls_batch(urls, force_refresh=force_refresh)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"CSVファイルの処理中にエラーが発生しました: {str(e)}",
        )
