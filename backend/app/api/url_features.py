from fastapi import APIRouter

from app.schemas.whois import DomainRequest
from app.services.url_feature_service import url_features
from app.utils.validators import normalize_domain, is_valid_domain

router = APIRouter(
    prefix="/api",
    tags=["URL Features"],
)


@router.post("/url-features")
def url_feature_api(request: DomainRequest):

    domain = normalize_domain(request.domain)

    if not is_valid_domain(domain):

        return {
            "success": False,
            "message": "Invalid domain"
        }

    return {

        "success": True,

        "data": url_features(domain)

    }