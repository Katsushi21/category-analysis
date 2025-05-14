from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, AnyHttpUrl, AnyUrl, Field
from datetime import datetime


class AnalysisRequest(BaseModel):
    url: AnyUrl


class BatchAnalysisRequest(BaseModel):
    urls: List[AnyUrl]


class SubCategory(BaseModel):
    name: str
    confidence: float


class CategoryAnalysis(BaseModel):
    main_category: str
    sub_categories: List[SubCategory]
    confidence: float
    description: Optional[str] = None
    target_audience: Optional[str] = None
    value_proposition: Optional[str] = None


class AnalysisResponse(BaseModel):
    url: str
    status: str
    analysis: Optional[CategoryAnalysis] = None
    error: Optional[str] = None
    from_cache: Optional[bool] = None


class BatchAnalysisResponse(BaseModel):
    results: List[AnalysisResponse]
    total: int
    success: int
    failed: int


class HistoryItem(BaseModel):
    id: str
    url: str
    timestamp: datetime
    status: str
    main_category: Optional[str] = None
    confidence: Optional[float] = None
    is_batch: bool = False
    batch_id: Optional[str] = None
    error: Optional[str] = None


class HistoryListResponse(BaseModel):
    items: List[HistoryItem]
    total: int
    page: int
    limit: int
    pages: int


class HistoryDetailResponse(HistoryItem):
    analysis: Optional[CategoryAnalysis] = None
