from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.database.database import Base


class AsnCache(Base):
    __tablename__ = "asn_cache"

    id = Column(Integer, primary_key=True, index=True)

    ip = Column(String, unique=True, index=True)

    asn = Column(String)

    asn_description = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)
