from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.whois import DomainRequest
from app.services.cache_service import (
    get_cached_whois,
    save_cached_whois,
)
from app.services.whois_service import get_whois
from app.utils.validators import (
    normalize_domain,
    is_valid_domain,
)
from app.utils.logger import logger

router = APIRouter(
    prefix="/api",
    tags=["WHOIS"],
)


@router.post("/whois")
def whois_lookup(
    request: DomainRequest,
    db: Session = Depends(get_db),
):
    """
    WHOIS Lookup API

    Flow:
    1. Normalize the domain
    2. Validate the domain
    3. Check SQLite cache
    4. Perform WHOIS lookup
    5. Save fresh result into cache
    6. Return response
    """

    # ----------------------------
    # Normalize Domain
    # ----------------------------
    domain = normalize_domain(request.domain)

    # ----------------------------
    # Validate Domain
    # ----------------------------
    if not is_valid_domain(domain):
        logger.warning(f"Invalid domain received: {request.domain}")

        return {
            "success": False,
            "message": "Invalid domain name.",
            "cached": False,
            "data": None,
        }

    logger.info(f"WHOIS lookup started for {domain}")

    # ----------------------------
    # Check SQLite Cache
    # ----------------------------
    cached = get_cached_whois(db, domain)

    if cached:

        logger.info(f"Cache hit for {domain}")

        return {
            "success": True,
            "message": "WHOIS data retrieved from cache.",
            "cached": True,
            "data": {
                "domain": cached.domain,
                "registrar": cached.registrar,
                "creation_date": cached.creation_date,
                "expiration_date": cached.expiration_date,
                "updated_date": cached.updated_date,
                "country": cached.country,
            },
        }

    logger.info(f"No cache found for {domain}. Fetching fresh WHOIS data.")

    # ----------------------------
    # Perform WHOIS Lookup
    # ----------------------------
    result = get_whois(domain)

    # ----------------------------
    # Lookup Failed
    # ----------------------------
    if "error" in result:

        logger.error(f"WHOIS lookup failed for {domain}: {result['error']}")

        return {
            "success": False,
            "message": "WHOIS lookup failed.",
            "cached": False,
            "error": result["error"],
            "data": None,
        }

    # ----------------------------
    # Save Domain Name
    # ----------------------------
    result["domain"] = domain

    # ----------------------------
    # Save Into SQLite Cache
    # ----------------------------
    try:

        save_cached_whois(db, result)

        logger.info(f"WHOIS data cached successfully for {domain}")

    except Exception as e:

        logger.exception(f"Failed to cache WHOIS data for {domain}: {str(e)}")

    # ----------------------------
    # Return Fresh Response
    # ----------------------------
    return {
        "success": True,
        "message": "WHOIS lookup successful.",
        "cached": False,
        "data": result,
    }