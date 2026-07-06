from fastapi import APIRouter

from app.schemas.whois import DomainRequest

from app.services.html_service import html_lookup

from app.utils.validators import (
    normalize_domain,
    is_valid_domain
)

router = APIRouter(
    prefix="/api",
    tags=["HTML Analysis"]
)


@router.post("/html")
def html_api(request: DomainRequest):

    domain = normalize_domain(request.domain)

    if not is_valid_domain(domain):

        return {
            "success": False,
            "message": "Invalid domain"
        }

    result = html_lookup(domain)

    if "error" in result:

        return {
            "success": False,
            "message": result["error"]
        }

    return {
        "success": True,
        "data": result
    }