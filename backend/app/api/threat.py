from fastapi import APIRouter

from app.schemas.whois import DomainRequest
from app.services.threat_service import check_urlhaus
from app.utils.validators import (
    normalize_domain,
    is_valid_domain,
)

router = APIRouter(
    prefix="/api",
    tags=["Threat Intelligence"]
)


@router.post("/threat")
def threat_api(request: DomainRequest):

    domain = normalize_domain(request.domain)

    if not is_valid_domain(domain):

        return {
            "success": False,
            "message": "Invalid Domain"
        }

    return {

        "success": True,

        "data": {

            "urlhaus": check_urlhaus(domain)

        }

    }