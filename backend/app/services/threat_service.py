import requests


URLHAUS_API = "https://urlhaus-api.abuse.ch/v1/host/"


def check_urlhaus(domain):

    try:

        response = requests.post(
            URLHAUS_API,
            data={"host": domain},
            timeout=10
        )

        data = response.json()

        if data.get("query_status") == "ok":

            return {
                "found": True,
                "status": data.get("query_status"),
                "urls": len(data.get("urls", [])),
                "blacklisted": True
            }

        return {
            "found": False,
            "blacklisted": False
        }

    except Exception as e:

        return {
            "error": str(e)
        }