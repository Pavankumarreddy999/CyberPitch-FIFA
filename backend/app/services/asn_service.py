"""
ASN lookup service using ipwhois.
Queries RDAP to get the real ASN number and provider name for an IP address.
Falls back to "Unknown" gracefully if the lookup fails or the IP is private.
"""
import ipaddress

try:
    from ipwhois import IPWhois
    _IPWHOIS_AVAILABLE = True
except ImportError:
    _IPWHOIS_AVAILABLE = False


def lookup_asn(ip: str) -> dict:
    """
    Look up ASN information for an IP address.

    Returns:
        {
            "asn": "AS15169",
            "asn_description": "GOOGLE, US"
        }
    Falls back to Unknown on any error.
    """
    default = {"asn": "Unknown", "asn_description": "Unknown"}

    if not _IPWHOIS_AVAILABLE:
        return default

    if not ip or ip == "0.0.0.0":
        return default

    try:
        # Skip private/loopback addresses — they have no ASN
        addr = ipaddress.ip_address(ip)
        if addr.is_private or addr.is_loopback or addr.is_link_local or addr.is_reserved:
            return default
    except ValueError:
        return default

    try:
        obj = IPWhois(ip)
        result = obj.lookup_rdap(depth=1)
        asn = result.get("asn", "Unknown")
        asn_desc = result.get("asn_description", "Unknown") or "Unknown"
        # Format: "AS15169" style
        if asn and asn != "NA":
            asn_str = f"AS{asn}"
        else:
            asn_str = "Unknown"
        return {
            "asn": asn_str,
            "asn_description": asn_desc,
        }
    except Exception:
        return default
