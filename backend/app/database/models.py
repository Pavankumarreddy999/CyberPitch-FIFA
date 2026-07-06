from sqlalchemy import Column, Integer, String
from app.database.database import Base


class DiscoveredDomain(Base):
    __tablename__ = "discovered_domains"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String, unique=True, nullable=False, index=True)