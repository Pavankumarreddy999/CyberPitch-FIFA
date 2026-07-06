from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from app.database.database import Base


class DNSCache(Base):
    __tablename__ = "dns_cache"

    id = Column(Integer, primary_key=True, index=True)

    domain = Column(String, unique=True, index=True)

    a_records = Column(String)

    aaaa_records = Column(String)

    mx_records = Column(String)

    ns_records = Column(String)

    txt_records = Column(String)

    cname = Column(String)

    soa = Column(String)

    spf = Column(String)

    dmarc = Column(String)

    dnssec = Column(String)

    ttl = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)