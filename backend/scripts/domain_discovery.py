import string
import time
import json
import concurrent.futures
from datetime import datetime

import requests
import dns.resolver

from app.database.database import SessionLocal
from app.database.models import DiscoveredDomain


BRAND_KEYWORDS = ["fifa", "fifaworldcup", "fifaplus", "worldcup2026", "fifatickets"]

OFFICIAL_DOMAINS = {
    "fifa.com", "fifaplus.com", "fifa.gg", "fifa.org", "fifa.tv",
    "inside.fifa.com", "tickets.fifa.com", "hospitality.fifa.com",
    "store.fifa.com", "fifatrainingcentre.com", "fifamuseum.com",
    "footballconnect.fifa.com",
}

SCAM_KEYWORDS = [
    "tickets", "ticket", "live", "stream", "free", "buy", "sale",
    "cheap", "discount", "official", "verify", "login", "account",
    "worldcup", "2026",
]

RISKY_TLDS = ["xyz", "top", "click", "info", "online", "site", "shop",
              "live", "vip", "buzz", "icu", "cc", "win"]
COMMON_TLDS = ["com", "net", "org", "co", "io"]

MAX_DNS_WORKERS = 100
DNS_TIMEOUT = 1.5
REQUEST_TIMEOUT = 10

# Hard cap: only ever resolve this many domains in a single run_once() call.
MAX_DOMAINS_TO_RESOLVE = 700


def is_official(domain: str) -> bool:
    """Exact match OR subdomain of an official FIFA domain -> skip it."""
    domain = domain.lower().rstrip(".")
    return any(domain == o or domain.endswith("." + o) for o in OFFICIAL_DOMAINS)


# ---- candidate generation ----

def _typo_variants(word):
    variants = set()
    letters = string.ascii_lowercase
    for i in range(len(word)):
        variants.add(word[:i] + word[i + 1:])
    for i in range(len(word) + 1):
        for ch in letters:
            variants.add(word[:i] + ch + word[i:])
    for i in range(len(word)):
        for ch in letters:
            if ch != word[i]:
                variants.add(word[:i] + ch + word[i + 1:])
    for i in range(len(word) - 1):
        lst = list(word)
        lst[i], lst[i + 1] = lst[i + 1], lst[i]
        variants.add("".join(lst))
    variants.discard(word)
    return variants


def _combosquat_variants(word):
    combos = set()
    for kw in SCAM_KEYWORDS:
        combos.add(f"{word}{kw}")
        combos.add(f"{kw}{word}")
        combos.add(f"{word}-{kw}")
    return combos


def generate_candidate_domains():
    names = set()
    for brand in BRAND_KEYWORDS:
        names.add(brand)
        names |= _typo_variants(brand)
        names |= _combosquat_variants(brand)

    candidates = {f"{name}.{tld}" for name in names for tld in COMMON_TLDS + RISKY_TLDS}
    candidates = {d for d in candidates if all(c.isalnum() or c in "-." for c in d)}
    return {d for d in candidates if not is_official(d)}


# ---- certificate transparency ----

def _query_crtsh(keyword):
    url = f"https://crt.sh/?q=%25{keyword}%25&output=json"
    try:
        resp = requests.get(url, timeout=REQUEST_TIMEOUT,
                             headers={"User-Agent": "fifa-domain-monitor/1.0"})
        if resp.status_code == 200 and resp.text.strip():
            found = set()
            for entry in json.loads(resp.text):
                for line in entry.get("name_value", "").split("\n"):
                    d = line.strip().lower().lstrip("*.")
                    if d and "." in d:
                        found.add(d)
            return found
    except Exception as e:
        print(f"  [crt.sh] error for '{keyword}': {e}")
    return set()


def discover_via_certificate_transparency():
    found = set()
    for kw in BRAND_KEYWORDS:
        found |= _query_crtsh(kw)
        time.sleep(1.5)  # be polite to crt.sh
    return {d for d in found if not is_official(d)}


# ---- DNS ----

def _resolves(domain):
    resolver = dns.resolver.Resolver()
    resolver.timeout = DNS_TIMEOUT
    resolver.lifetime = DNS_TIMEOUT
    try:
        resolver.resolve(domain, "A")
        return True
    except Exception:
        return False


def bulk_resolve(domains):
    """
    Return the set of domains that currently resolve (are live).

    Only the first MAX_DOMAINS_TO_RESOLVE domains (from the given iterable)
    are ever checked, no matter how many are passed in. This keeps each run
    fast and bounded instead of resolving the full candidate list.
    """
    domains = list(domains)[:MAX_DOMAINS_TO_RESOLVE]

    if not domains:
        return set()

    print(f"[discovery] resolving {len(domains)} domain(s) (capped at {MAX_DOMAINS_TO_RESOLVE})")

    live = set()
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_DNS_WORKERS) as ex:
        futures = {ex.submit(_resolves, d): d for d in domains}
        for fut in concurrent.futures.as_completed(futures):
            d = futures[fut]
            if fut.result():
                live.add(d)
    return live


# ---- main job: discover + save to SQLite ----

def run_once():
    print(f"[discovery] cycle start {datetime.utcnow().isoformat()} UTC")
    db = SessionLocal()
    try:
        existing = {r[0] for r in db.query(DiscoveredDomain.domain).all()}

        perm = generate_candidate_domains()
        ct = discover_via_certificate_transparency()
        all_candidates = {d for d in (perm | ct) if not is_official(d)}

        new_domains = [d for d in all_candidates if d not in existing]
        print(f"[discovery] {len(new_domains)} new candidates found (only first "
              f"{MAX_DOMAINS_TO_RESOLVE} will be resolved this run)")

        # bulk_resolve() itself caps to MAX_DOMAINS_TO_RESOLVE, so this call
        # is safe even though new_domains may be large.
        live = bulk_resolve(new_domains)
        print(f"[discovery] {len(live)} are live")

        for domain in live:
            db.add(DiscoveredDomain(domain=domain))

        db.commit()
        print(f"[discovery] saved {len(live)} new domains to DB")

    except Exception as e:
        db.rollback()
        print(f"[discovery] ERROR: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_once()