import socket
import ssl
from datetime import datetime


def parse_name(name):
    """
    Converts certificate issuer/subject tuples into a dictionary.

    Example:
    (
        (('countryName', 'US'),),
        (('organizationName', 'Google Trust Services'),),
        (('commonName', 'WE2'),)
    )

    becomes

    {
        "countryName": "US",
        "organizationName": "Google Trust Services",
        "commonName": "WE2"
    }
    """

    result = {}

    for item in name:
        for key, value in item:
            result[key] = value

    return result


def ssl_lookup(domain):
    """
    Perform SSL Certificate Lookup
    """

    try:

        context = ssl.create_default_context()

        with socket.create_connection((domain, 443), timeout=10) as sock:

            with context.wrap_socket(
                sock,
                server_hostname=domain
            ) as secure_socket:

                cert = secure_socket.getpeercert()

                # -----------------------------
                # Parse Issuer & Subject
                # -----------------------------

                issuer = parse_name(cert.get("issuer", []))
                subject = parse_name(cert.get("subject", []))

                # -----------------------------
                # Certificate Dates
                # -----------------------------

                valid_from = datetime.strptime(
                    cert["notBefore"],
                    "%b %d %H:%M:%S %Y %Z"
                )

                valid_until = datetime.strptime(
                    cert["notAfter"],
                    "%b %d %H:%M:%S %Y %Z"
                )

                now = datetime.utcnow()

                # -----------------------------
                # Wildcard Certificate
                # -----------------------------

                common_name = subject.get(
                    "commonName",
                    ""
                )

                wildcard_certificate = common_name.startswith("*.")

                # -----------------------------
                # Self Signed
                # -----------------------------

                self_signed = issuer == subject

                # -----------------------------
                # Subject Alternative Names
                # -----------------------------

                san = []

                for item in cert.get("subjectAltName", []):

                    if len(item) == 2:

                        san.append({
                            "type": item[0],
                            "value": item[1]
                        })

                # -----------------------------
                # Cipher
                # -----------------------------

                cipher = secure_socket.cipher()

                return {

                    "domain": domain,

                    "issuer": issuer,

                    "subject": subject,

                    "valid_from": valid_from.isoformat(),

                    "valid_until": valid_until.isoformat(),

                    "certificate_age_days": (
                        now - valid_from
                    ).days,

                    "days_remaining": (
                        valid_until - now
                    ).days,

                    "expired": now > valid_until,

                    "wildcard_certificate": wildcard_certificate,

                    "self_signed": self_signed,

                    "serial_number": cert.get(
                        "serialNumber"
                    ),

                    "version": cert.get(
                        "version"
                    ),

                    "tls_version": secure_socket.version(),

                    "cipher": {
                        "name": cipher[0],
                        "protocol": cipher[1],
                        "bits": cipher[2]
                    },

                    "subject_alt_names_count": len(san),

                }

    except ssl.SSLError as e:

        return {
            "error": "SSL Error",
            "details": str(e)
        }

    except socket.timeout:

        return {
            "error": "Connection Timed Out"
        }

    except socket.gaierror:

        return {
            "error": "Unable to Resolve Domain"
        }

    except ConnectionRefusedError:

        return {
            "error": "Connection Refused"
        }

    except Exception as e:

        return {
            "error": str(e)
        }