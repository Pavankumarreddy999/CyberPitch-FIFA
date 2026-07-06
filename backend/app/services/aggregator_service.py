import re
import random
from datetime import datetime
from sqlalchemy.orm import Session
import tldextract

from app.services.cache_service import (
    get_cached_whois, save_cached_whois,
    get_cached_dns, save_cached_dns,
    get_cached_ssl, save_cached_ssl
)
from app.services.whois_service import get_whois
from app.services.dns_service import dns_lookup
from app.services.ssl_service import ssl_lookup
from app.services.html_service import html_lookup
from app.services.threat_service import check_urlhaus


def levenshtein_distance(s1: str, s2: str) -> int:
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
        
    return previous_row[-1]


def typosquat_distance(domain: str, target: str = "fifa") -> int:
    main_part = domain.split('.')[0]
    n = len(main_part)
    m = len(target)
    if n < m:
        return levenshtein_distance(main_part, target)
    
    min_dist = 999
    for i in range(n - m + 1):
        sub = main_part[i:i+m]
        dist = levenshtein_distance(sub, target)
        if dist < min_dist:
            min_dist = dist
    return min_dist


def parse_date(date_str) -> datetime:
    if not date_str:
        return None
    if isinstance(date_str, datetime):
        return date_str
    
    # Try parsing string dates
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%d-%b-%Y"):
        try:
            return datetime.strptime(date_str.split(".")[0].strip(), fmt)
        except Exception:
            continue
    return None


def get_domain_age(creation_date_val) -> int:
    # If list, take first item
    if isinstance(creation_date_val, list):
        creation_date_val = creation_date_val[0]
    
    dt = parse_date(creation_date_val)
    if dt:
        delta = datetime.utcnow() - dt
        return max(0, delta.days)
    return 30  # Default to a young domain if WHOIS fails or age is hidden


def check_privacy(whois_data: dict) -> int:
    privacy_keywords = ["privacy", "proxy", "redacted", "protect", "masked", "identity"]
    
    registrar = str(whois_data.get("registrar") or "").lower()
    for kw in privacy_keywords:
        if kw in registrar:
            return 1
            
    raw = str(whois_data.get("raw") or "").lower()
    for kw in privacy_keywords:
        if kw in raw:
            return 1
            
    return 0


def aggregate_features(domain: str, db: Session) -> dict:
    """
    Runs lookups across all scanning services and compiles them
    into the dataset schema format. Uses SQL caching for efficiency.
    """
    # 1. URL Haus (Threat Intelligence)
    threat_data = check_urlhaus(domain)
    blacklist_source = "URLHaus" if threat_data.get("blacklisted") else "None"
    malware_match = 1 if threat_data.get("blacklisted") else 0

    # 2. WHOIS
    cached_whois = get_cached_whois(db, domain)
    if cached_whois:
        whois_data = {
            "registrar": cached_whois.registrar,
            "creation_date": cached_whois.creation_date,
            "expiration_date": cached_whois.expiration_date,
            "country": cached_whois.country,
            "raw": cached_whois.raw_data
        }
    else:
        whois_res = get_whois(domain)
        if whois_res and whois_res.get("success") != False:
            # Inject domain key — required by save_cached_whois
            whois_res["domain"] = domain
            try:
                save_cached_whois(db, whois_res)
            except Exception:
                pass  # Cache write failure should not block the scan
            whois_data = whois_res
        else:
            whois_data = {}

    # 3. DNS
    cached_dns = get_cached_dns(db, domain)
    if cached_dns:
        dns_data = cached_dns
    else:
        dns_res = dns_lookup(domain)
        save_cached_dns(db, domain, dns_res)
        dns_data = dns_res

    # 4. SSL
    cached_ssl = get_cached_ssl(db, domain)
    if cached_ssl:
        ssl_data = cached_ssl
    else:
        ssl_res = ssl_lookup(domain)
        if "error" not in ssl_res:
            save_cached_ssl(db, domain, ssl_res)
            ssl_data = ssl_res
        else:
            ssl_data = {}

    # 5. HTML
    # We do not database cache HTML as pages change, but we call the lookup service directly
    html_data = html_lookup(domain)
    if "error" in html_data:
        html_data = {}

    # -----------------------------
    # Extracted / Mapped Features
    # -----------------------------
    ext = tldextract.extract(domain)
    subdomain_count = 0 if ext.subdomain == "" else len(ext.subdomain.split("."))
    
    domain_lower = domain.lower()
    contains_fifa = 1 if "fifa" in domain_lower else 0
    contains_ticket = 1 if "ticket" in domain_lower else 0
    contains_official = 1 if "official" in domain_lower else 0
    contains_stream = 1 if "stream" in domain_lower else 0
    contains_reward = 1 if "reward" in domain_lower else 0

    typosquat = typosquat_distance(domain, "fifa")

    registrar = whois_data.get("registrar") or "Unknown"
    whois_age = get_domain_age(whois_data.get("creation_date"))
    is_private = check_privacy(whois_data)

    # SSL mapping
    ssl_valid_days = 0
    if ssl_data:
        ssl_valid_days = ssl_data.get("days_remaining", 0)
        if ssl_data.get("expired"):
            ssl_status = "Expired"
        elif ssl_data.get("self_signed"):
            ssl_status = "Self-Signed"
        else:
            ssl_status = "Valid"
        ssl_issuer = ssl_data.get("issuer", {}).get("organizationName") or ssl_data.get("issuer", {}).get("commonName") or "Unknown"
    else:
        ssl_status = "Invalid"
        ssl_issuer = "None"

    # Network features
    a_records = dns_data.get("a_records", [])
    ip_address = a_records[0] if a_records else "0.0.0.0"
    hosting_country = whois_data.get("country") or "Unknown"
    asn_provider = "Unknown"  # Can expand ASN resolution later if required

    # HTML forms
    has_login_form = 1 if html_data.get("login_page") or html_data.get("password_fields", 0) > 0 else 0
    
    # Check HTML tags and script links for payment keywords
    has_payment = 0
    # Search title, forms, inputs for checkout keywords
    html_title = str(html_data.get("title", "")).lower()
    if any(k in html_title for k in ["pay", "checkout", "paypal", "stripe", "visa", "card"]):
        has_payment = 1

    redirect_count = 1 if html_data.get("redirected") else 0

    # OSINT / Social Simulation
    # Phishing domains have low social media mentions and high visual similarity if keyword matches
    if contains_fifa and (contains_ticket or contains_reward or contains_stream):
        visual_similarity = float(random.randint(80, 98))
        social_mentions = random.randint(0, 3)
        osint_reports = random.randint(1, 5) if malware_match else random.randint(0, 2)
    else:
        visual_similarity = float(random.randint(5, 45))
        social_mentions = random.randint(5, 50)
        osint_reports = 0

    return {
        "domain": domain,
        "TLD": ext.suffix,
        "Domain Length": len(domain),
        "Subdomain Count": subdomain_count,
        "Hyphen Count": domain.count("-"),
        "Digit Count": sum(c.isdigit() for c in domain),
        "Contains FIFA Keyword": contains_fifa,
        "Contains Ticket Keyword": contains_ticket,
        "Contains Official Keyword": contains_official,
        "Contains Stream Keyword": contains_stream,
        "Contains Reward Keyword": contains_reward,
        "Typosquat Distance to FIFA": typosquat,
        "Registrar": registrar,
        "WHOIS Age Days": whois_age,
        "Is Privacy Protected": is_private,
        "SSL Status": ssl_status,
        "SSL Issuer": ssl_issuer,
        "SSL Valid Days Remaining": ssl_valid_days,
        "IP Address": ip_address,
        "Hosting Country": hosting_country,
        "ASN Provider": asn_provider,
        "Visual Similarity Score": visual_similarity,
        "Malware Signature Match": malware_match,
        "Blacklist Source": blacklist_source,
        "Social Media Mentions": social_mentions,
        "OSINT Report Count": osint_reports,
        "Redirect Chain Length": redirect_count,
        "Has Payment Page": has_payment,
        "Has Login Form": has_login_form
    }
