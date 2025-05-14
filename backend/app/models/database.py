from sqlalchemy import (
    Column,
    String,
    Float,
    DateTime,
    Boolean,
    JSON,
    create_engine,
    func,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json
import uuid

from ..core.config import settings

# データベース接続
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# データベースセッションの取得
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 解析履歴テーブルのORM定義
class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(String, primary_key=True, index=True)
    url = Column(String, nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    status = Column(String, nullable=False, index=True)
    main_category = Column(String, nullable=True, index=True)
    confidence = Column(Float, nullable=True)
    error = Column(String, nullable=True)
    analysis = Column(JSON, nullable=True)
    is_batch = Column(Boolean, default=False)
    batch_id = Column(String, nullable=True, index=True)

    def to_dict(self):
        """モデルを辞書に変換"""
        result = {
            "id": self.id,
            "url": self.url,
            "timestamp": self.timestamp,
            "status": self.status,
            "main_category": self.main_category,
            "confidence": self.confidence,
            "is_batch": self.is_batch,
            "batch_id": self.batch_id,
        }

        if self.status == "failed":
            result["error"] = self.error

        return result

    def to_detail_dict(self):
        """詳細な辞書に変換（分析結果含む）"""
        result = self.to_dict()

        if self.status == "success" and self.analysis:
            result["analysis"] = self.analysis

        return result

    @staticmethod
    def generate_id():
        """ユニークなIDを生成"""
        return f"hist_{uuid.uuid4().hex}"

    def __repr__(self):
        return f"<AnalysisHistory(id={self.id}, url={self.url}, status={self.status})>"
