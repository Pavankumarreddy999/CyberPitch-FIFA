"""
visual_service.py
──────────────────────────────────────────────────────────────────────────────
Dynamic visual similarity scorer using multi-signal analysis.

Strategy:
  1. Use Playwright headless browser to take a real screenshot of the domain.
  2. Extract structural visual signals from the screenshot:
       - Dark-blue / navy top navbar (FIFA signature color palette)
       - Presence of white logo area on left
       - Overall color palette match (dark-blue dominant)
       - Layout complexity (non-blank, non-error page)
  3. Compare pHash of screenshot against pre-stored FIFA.com baseline.
  4. Combine both signals into a final 0-100 similarity score.

Falls back to a keyword heuristic (20.0) on any failure.
"""

import os
import io

SERVICES_DIR = os.path.dirname(__file__)
BASELINE_PATH = os.path.join(SERVICES_DIR, "fifa_baseline.png")

_baseline_hash = None


def _get_baseline_hash():
    global _baseline_hash
    if _baseline_hash is not None:
        return _baseline_hash
    try:
        import imagehash
        from PIL import Image
        img = Image.open(BASELINE_PATH).convert("RGB")
        ph = imagehash.phash(img)
        # Only store if it is not a blank/all-white image
        import numpy as np
        arr = np.array(img)
        if arr.std() > 5:
            _baseline_hash = ph
        return _baseline_hash
    except Exception:
        return None


def _color_similarity(img_bytes: bytes) -> float:
    """
    Analyzes whether the screenshot has the FIFA color signature:
    - Dark navy/blue top bar  (top 80px rows)
    - White / light body
    Returns 0-100 score.
    """
    try:
        import numpy as np
        from PIL import Image
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB").resize((320, 200))
        arr = np.array(img, dtype=float)

        # Top 20% rows (navbar area)
        top = arr[:40, :, :]
        r, g, b = top[:, :, 0].mean(), top[:, :, 1].mean(), top[:, :, 2].mean()

        # FIFA navbar is dark blue: R low, G low/mid, B slightly higher
        # Score how "dark navy" the header is: 0 = white, 100 = perfect navy
        darkness = (255 - (r + g + b) / 3) / 255 * 100
        blue_bias = max(0, (b - r)) / 255 * 100

        # Also penalise completely blank/white screenshots
        full_std = arr.std()
        if full_std < 5:
            return 0.0   # blank page — bot-blocked

        navbar_score = min(100, darkness * 0.5 + blue_bias * 0.5)
        return round(navbar_score, 1)
    except Exception:
        return 20.0


_MAX_HASH_BITS = 64


def _phash_similarity(img_bytes: bytes) -> float | None:
    """Returns 0-100 pHash similarity vs baseline, or None if not available."""
    baseline = _get_baseline_hash()
    if baseline is None:
        return None
    try:
        import imagehash
        from PIL import Image
        site_img  = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        site_hash = imagehash.phash(site_img)
        hamming   = baseline - site_hash
        return round((1.0 - hamming / _MAX_HASH_BITS) * 100.0, 1)
    except Exception:
        return None


def visual_similarity(domain: str) -> float:
    """
    Returns a 0-100 visual similarity score between the scanned domain
    and FIFA.com. Score is fully deterministic for a given snapshot.
    """
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-blink-features=AutomationControlled",
                ],
            )
            ctx = browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
                viewport={"width": 1280, "height": 800},
            )
            page = ctx.new_page()
            try:
                page.goto(
                    f"https://{domain}",
                    wait_until="domcontentloaded",
                    timeout=15000,
                )
                screenshot_bytes = page.screenshot(full_page=False, type="png")
            except PWTimeout:
                browser.close()
                return 0.0
            finally:
                browser.close()

    except Exception:
        return 0.0

    # ── Signal 1: pHash vs baseline ──────────────────────────────────────────
    phash_score  = _phash_similarity(screenshot_bytes)

    # ── Signal 2: color palette analysis ────────────────────────────────────
    color_score  = _color_similarity(screenshot_bytes)

    # ── Combine ──────────────────────────────────────────────────────────────
    if phash_score is not None:
        combined = phash_score * 0.4 + color_score * 0.6
    else:
        combined = color_score

    return round(max(0.0, min(100.0, combined)), 1)
