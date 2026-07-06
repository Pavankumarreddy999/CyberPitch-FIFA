from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database.database import Base


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)

    domain = Column(String, nullable=False, unique=True)

    prediction = Column(String)

    risk_score = Column(Integer)

    created_at = Column(DateTime, default=datetime.utcnow)