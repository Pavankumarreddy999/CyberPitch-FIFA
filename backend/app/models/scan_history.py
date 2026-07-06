from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String

from app.database.database import Base


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)

    domain = Column(String, nullable=False)

    prediction = Column(String)

    risk_score = Column(Integer)

    confidence_score = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)