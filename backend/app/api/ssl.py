from fastapi import APIRouter

from app.schemas.ssl import SSLRequest
from app.services.ssl_service import ssl_lookup
from app.utils.validators import (
    normalize_domain,
    is_valid_domain,
)

router = APIRouter(
    prefix="/api",
    tags=["SSL"],
)


@router.post("/ssl")
def ssl_api(request: SSLRequest):

    domain = normalize_domain(request.domain)

    if not is_valid_domain(domain):

        return {

            "success": False,

            "message": "Invalid Domain",

        }

    return {

        "success": True,

        "data": ssl_lookup(domain),

    }