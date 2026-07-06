from fastapi import FastAPI

from app.database.database import engine, run_migrations
from app.models import ScanHistory
from app.database.database import Base
from app.api.whois import router as whois_router
from app.api.dns import router as dns_router
from app.api.ssl import router as ssl_router
from app.api import html
from app.api import url_features
from app.api.threat import router as threat_router
from app.api.scan import router as scan_router
Base.metadata.create_all(bind=engine)
run_migrations()


app = FastAPI(
    title="CyberPitch FIFA API",
    version="1.0.0",
    description="Backend APIs for phishing website detection"
)

app.include_router(whois_router)
app.include_router(dns_router)
app.include_router(ssl_router)
app.include_router(html.router)
app.include_router(url_features.router)
app.include_router(threat_router)
app.include_router(scan_router)

@app.get("/")
def home():
    return {
        "message": "CyberPitch FIFA Backend Running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "OK"
    }