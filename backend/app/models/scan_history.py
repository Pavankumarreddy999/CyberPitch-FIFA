from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.database.database import Base


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)

    domain = Column(String, nullable=False)

    prediction = Column(String)

    risk_score = Column(Integer)

    created_at = Column(DateTime, default=datetime.utcnow)