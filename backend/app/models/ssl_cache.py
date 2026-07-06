from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from app.database.database import Base


class SSLCache(Base):
    __tablename__ = "ssl_cache"

    id = Column(Integer, primary_key=True, index=True)

    domain = Column(String, unique=True, index=True)

    issuer = Column(String)

    subject = Column(String)

    valid_from = Column(String)

    valid_until = Column(String)

    serial_number = Column(String)

    signature_algorithm = Column(String)

    tls_version = Column(String)

    self_signed = Column(String)

    expired = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)