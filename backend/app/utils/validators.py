import re

DOMAIN_REGEX = re.compile(
    r"^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.[A-Za-z]{2,}$"
)


def normalize_domain(domain: str) -> str:
    domain = domain.strip().lower()

    domain = domain.replace("https://", "")
    domain = domain.replace("http://", "")

    domain = domain.replace("www.", "")

    domain = domain.split("/")[0]

    return domain


def is_valid_domain(domain: str):

    domain = normalize_domain(domain)

    return bool(DOMAIN_REGEX.match(domain))