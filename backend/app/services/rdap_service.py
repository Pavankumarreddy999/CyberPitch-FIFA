import requests


def lookup_rdap(domain: str):
    url = f"https://rdap.org/domain/{domain}"

    response = requests.get(url, timeout=10)

    if response.status_code == 200:
        return response.json()

    return None