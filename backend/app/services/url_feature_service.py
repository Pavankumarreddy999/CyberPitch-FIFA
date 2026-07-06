import math
import re
from collections import Counter
from urllib.parse import urlparse, parse_qs

import tldextract


SUSPICIOUS_KEYWORDS = [
    "login",
    "signin",
    "verify",
    "update",
    "secure",
    "account",
    "bank",
    "password",
    "confirm",
    "wallet",
    "payment",
    "invoice",
]


SHORTENERS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "is.gd",
    "buff.ly",
    "ow.ly",
    "rebrand.ly",
    "cutt.ly",
    "shorturl.at",
}


def entropy(text):

    counter = Counter(text)

    total = len(text)

    entropy = 0

    for count in counter.values():

        p = count / total

        entropy -= p * math.log2(p)

    return round(entropy, 3)


def url_features(domain):

    url = f"https://{domain}"

    parsed = urlparse(url)

    extracted = tldextract.extract(domain)

    hostname = parsed.hostname or ""

    query = parse_qs(parsed.query)

    return {

        "url": url,

        "url_length": len(url),

        "domain_length": len(hostname),

        "dot_count": url.count("."),

        "hyphen_count": url.count("-"),

        "underscore_count": url.count("_"),

        "digit_count": sum(c.isdigit() for c in url),

        "special_character_count":
            len(re.findall(r"[@%&=+~!*$,;:?]", url)),

        "https": parsed.scheme == "https",

        "uses_ip_address":
            bool(re.fullmatch(r"\d+\.\d+\.\d+\.\d+", hostname)),

        "query_parameter_count":
            len(query),

        "entropy":
            entropy(hostname),

        "tld":
            extracted.suffix,

        "subdomain":
            extracted.subdomain,

        "subdomain_count":
            0 if extracted.subdomain == ""
            else len(extracted.subdomain.split(".")),

        "is_shortened":
            hostname in SHORTENERS,

        "suspicious_keywords":
            [
                word
                for word in SUSPICIOUS_KEYWORDS
                if word in url.lower()
            ],

        "keyword_count":
            sum(
                word in url.lower()
                for word in SUSPICIOUS_KEYWORDS
            ),
    }