import json
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.config import CACHE_TTL_DAYS
from app.models.whois_cache import WhoisCache
from app.models.dns_cache import DNSCache
from app.models.ssl_cache import SSLCache


def get_cached_whois(db: Session, domain: str):
    row = (
        db.query(WhoisCache)
        .filter(WhoisCache.domain == domain)
        .first()
    )

    if row is None:
        return None

    age = datetime.utcnow() - row.created_at

    if age > timedelta(days=CACHE_TTL_DAYS):
        db.delete(row)
        db.commit()
        return None

    return row


def save_cached_whois(db: Session, data: dict):
    row = WhoisCache(
        domain=data["domain"],
        registrar=data.get("registrar"),
        creation_date=data.get("creation_date"),
        expiration_date=data.get("expiration_date"),
        updated_date=data.get("updated_date"),
        country=data.get("country"),
        raw_data=str(data),
    )

    db.add(row)
    db.commit()
    db.refresh(row)

    return row


def get_cached_dns(db: Session, domain: str):
    row = (
        db.query(DNSCache)
        .filter(DNSCache.domain == domain)
        .first()
    )

    if row is None:
        return None

    age = datetime.utcnow() - row.created_at

    if age > timedelta(days=CACHE_TTL_DAYS):
        db.delete(row)
        db.commit()
        return None

    try:
        return {
            "a_records": json.loads(row.a_records) if row.a_records else [],
            "aaaa_records": json.loads(row.aaaa_records) if row.aaaa_records else [],
            "mx_records": json.loads(row.mx_records) if row.mx_records else [],
            "ns_records": json.loads(row.ns_records) if row.ns_records else [],
            "txt_records": json.loads(row.txt_records) if row.txt_records else [],
            "cname": json.loads(row.cname) if row.cname else [],
            "soa": json.loads(row.soa) if row.soa else [],
            "spf_enabled": row.spf == "True",
            "dmarc_enabled": row.dmarc == "True",
            "dnssec_enabled": row.dnssec == "True",
            "ttl": int(row.ttl) if row.ttl else None,
        }
    except Exception:
        return None


def save_cached_dns(db: Session, domain: str, data: dict):
    # Remove old cached entry if exists
    existing = db.query(DNSCache).filter(DNSCache.domain == domain).first()
    if existing:
        db.delete(existing)
        db.commit()

    row = DNSCache(
        domain=domain,
        a_records=json.dumps(data.get("a_records", [])),
        aaaa_records=json.dumps(data.get("aaaa_records", [])),
        mx_records=json.dumps(data.get("mx_records", [])),
        ns_records=json.dumps(data.get("ns_records", [])),
        txt_records=json.dumps(data.get("txt_records", [])),
        cname=json.dumps(data.get("cname", [])),
        soa=json.dumps(data.get("soa", [])),
        spf=str(data.get("spf_enabled", False)),
        dmarc=str(data.get("dmarc_enabled", False)),
        dnssec=str(data.get("dnssec_enabled", False)),
        ttl=str(data.get("ttl")) if data.get("ttl") is not None else None,
    )

    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def get_cached_ssl(db: Session, domain: str):
    row = (
        db.query(SSLCache)
        .filter(SSLCache.domain == domain)
        .first()
    )

    if row is None:
        return None

    age = datetime.utcnow() - row.created_at

    if age > timedelta(days=CACHE_TTL_DAYS):
        db.delete(row)
        db.commit()
        return None

    try:
        return {
            "domain": row.domain,
            "issuer": json.loads(row.issuer) if row.issuer else {},
            "subject": json.loads(row.subject) if row.subject else {},
            "valid_from": row.valid_from,
            "valid_until": row.valid_until,
            "serial_number": row.serial_number,
            "tls_version": row.tls_version,
            "self_signed": row.self_signed == "True",
            "expired": row.expired == "True",
        }
    except Exception:
        return None


def save_cached_ssl(db: Session, domain: str, data: dict):
    # Remove old cached entry if exists
    existing = db.query(SSLCache).filter(SSLCache.domain == domain).first()
    if existing:
        db.delete(existing)
        db.commit()

    row = SSLCache(
        domain=domain,
        issuer=json.dumps(data.get("issuer", {})),
        subject=json.dumps(data.get("subject", {})),
        valid_from=data.get("valid_from"),
        valid_until=data.get("valid_until"),
        serial_number=data.get("serial_number"),
        signature_algorithm=data.get("signature_algorithm", ""),
        tls_version=data.get("tls_version"),
        self_signed=str(data.get("self_signed", False)),
        expired=str(data.get("expired", False)),
    )

    db.add(row)
    db.commit()
    db.refresh(row)
    return row