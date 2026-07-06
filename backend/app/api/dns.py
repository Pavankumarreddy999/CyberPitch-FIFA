from fastapi import APIRouter

from app.schemas.dns import DNSRequest
from app.services.dns_service import dns_lookup
from app.utils.validators import (
    normalize_domain,
    is_valid_domain,
)

router = APIRouter(
    prefix="/api",
    tags=["DNS"],
)


@router.post("/dns")
def dns(request: DNSRequest):

    domain = normalize_domain(request.domain)

    if not is_valid_domain(domain):
        return {
            "success": False,
            "message": "Invalid Domain",
        }

    data = dns_lookup(domain)

    return {
        "success": True,
        "data": data,
    }