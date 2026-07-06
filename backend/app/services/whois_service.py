import whois

from app.services.rdap_service import lookup_rdap


def extract_rdap(rdap):
    registrar = None
    country = None

    # Registrar
    for entity in rdap.get("entities", []):
        if "registrar" in entity.get("roles", []):
            try:
                registrar = entity["vcardArray"][1][1][3]
            except Exception:
                pass

    creation_date = None
    expiration_date = None
    updated_date = None

    for event in rdap.get("events", []):

        if event["eventAction"] == "registration":
            creation_date = event["eventDate"]

        elif event["eventAction"] == "expiration":
            expiration_date = event["eventDate"]

        elif event["eventAction"] == "last changed":
            updated_date = event["eventDate"]

    nameservers = []

    for ns in rdap.get("nameservers", []):
        nameservers.append(ns.get("ldhName"))

    return {
        "source": "RDAP",
        "registrar": registrar,
        "country": country,
        "creation_date": creation_date,
        "expiration_date": expiration_date,
        "updated_date": updated_date,
        "nameservers": nameservers,
        "status": rdap.get("status", []),
        "raw": rdap
    }


def get_whois(domain: str):

    rdap = lookup_rdap(domain)

    if rdap:
        return extract_rdap(rdap)

    try:

        w = whois.whois(domain)

        return {
            "source": "python-whois",
            "registrar": w.registrar,
            "country": getattr(w, "country", None),
            "creation_date": str(w.creation_date),
            "expiration_date": str(w.expiration_date),
            "updated_date": str(w.updated_date),
            "nameservers": list(w.name_servers) if w.name_servers else [],
            "status": w.status,
            "raw": dict(w),
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }