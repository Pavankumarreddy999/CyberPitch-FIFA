import dns.resolver
import dns.exception


def query_record(domain, record_type):
    try:
        answers = dns.resolver.resolve(domain, record_type)

        ttl = answers.rrset.ttl

        return [str(answer) for answer in answers], ttl

    except Exception:
        return [], None


def dns_lookup(domain):

    data = {}

    # A Record
    a_records, ttl = query_record(domain, "A")
    data["a_records"] = a_records
    data["ttl"] = ttl

    # AAAA
    aaaa_records, _ = query_record(domain, "AAAA")
    data["aaaa_records"] = aaaa_records

    # MX
    mx_records, _ = query_record(domain, "MX")
    data["mx_records"] = mx_records

    # NS
    ns_records, _ = query_record(domain, "NS")
    data["ns_records"] = ns_records

    # TXT
    txt_records, _ = query_record(domain, "TXT")
    data["txt_records"] = txt_records

    # CNAME
    cname, _ = query_record(domain, "CNAME")
    data["cname"] = cname

    # SOA
    soa, _ = query_record(domain, "SOA")
    data["soa"] = soa

    # -----------------------
    # SPF Detection
    # -----------------------

    data["spf_enabled"] = any(
        "v=spf1" in txt
        for txt in txt_records
    )

    # -----------------------
    # DMARC Detection
    # -----------------------

    try:
        dmarc = dns.resolver.resolve(
            "_dmarc." + domain,
            "TXT"
        )

        data["dmarc_enabled"] = True
        data["dmarc"] = [str(x) for x in dmarc]

    except Exception:

        data["dmarc_enabled"] = False
        data["dmarc"] = []

    # -----------------------
    # DNSSEC Detection
    # -----------------------

    try:
        dns.resolver.resolve(domain, "DNSKEY")

        data["dnssec_enabled"] = True

    except Exception:

        data["dnssec_enabled"] = False

    return data