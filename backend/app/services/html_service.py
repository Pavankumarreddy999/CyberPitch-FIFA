import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse


def html_lookup(domain):

    try:

        url = f"https://{domain}"

        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        response = requests.get(
            url,
            timeout=10,
            headers=headers,
            allow_redirects=True
        )

        soup = BeautifulSoup(response.text, "lxml")

        # -----------------------
        # Basic
        # -----------------------

        title = soup.title.string.strip() if soup.title else ""

        forms = soup.find_all("form")

        iframes = soup.find_all("iframe")

        scripts = soup.find_all("script")

        links = soup.find_all("a")

        images = soup.find_all("img")

        inputs = soup.find_all("input")

        meta_refresh = False

        for meta in soup.find_all("meta"):

            if meta.get("http-equiv", "").lower() == "refresh":
                meta_refresh = True

        # -----------------------
        # Password Fields
        # -----------------------

        password_fields = 0

        hidden_fields = 0

        for inp in inputs:

            if inp.get("type") == "password":
                password_fields += 1

            if inp.get("type") == "hidden":
                hidden_fields += 1

        # -----------------------
        # External Scripts
        # -----------------------

        external_scripts = 0

        internal_scripts = 0

        for script in scripts:

            src = script.get("src")

            if src:

                if src.startswith("http"):

                    external_scripts += 1

                else:

                    internal_scripts += 1

        # -----------------------
        # External Links
        # -----------------------

        external_links = 0

        internal_links = 0

        for link in links:

            href = link.get("href")

            if not href:
                continue

            absolute = urljoin(url, href)

            parsed = urlparse(absolute)

            if domain in parsed.netloc:

                internal_links += 1

            else:

                external_links += 1

        # -----------------------
        # Login Form
        # -----------------------

        login_page = password_fields > 0

        # -----------------------
        # JavaScript Redirect
        # -----------------------

        js_redirect = False

        for script in scripts:

            if script.string:

                code = script.string.lower()

                if (
                    "window.location" in code
                    or "location.href" in code
                    or "location.replace" in code
                ):
                    js_redirect = True

        return {

            "url": response.url,

            "status_code": response.status_code,

            "title": title,

            "forms": len(forms),

            "iframes": len(iframes),

            "images": len(images),

            "scripts": len(scripts),

            "external_scripts": external_scripts,

            "internal_scripts": internal_scripts,

            "internal_links": internal_links,

            "external_links": external_links,

            "password_fields": password_fields,

            "hidden_fields": hidden_fields,

            "login_page": login_page,

            "meta_refresh": meta_refresh,

            "javascript_redirect": js_redirect,

            "content_length": len(response.text),

            "redirected": response.url != url

        }

    except Exception as e:

        return {
            "error": str(e)
        }