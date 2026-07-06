from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.database.database import Base


class WhoisCache(Base):

    __tablename__ = "whois_cache"

    id = Column(Integer, primary_key=True)

    domain = Column(String, unique=True, index=True)

    registrar = Column(String)

    creation_date = Column(String)

    expiration_date = Column(String)

    updated_date = Column(String)

    country = Column(String)

    raw_data = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)