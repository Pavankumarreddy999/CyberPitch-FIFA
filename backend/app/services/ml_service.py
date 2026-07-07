"""
ml_service.py
──────────────────────────────────────────────────────────────────────────────
Two-stage ML prediction pipeline.

Task 3 – Confidence Score: variance across RF individual-tree predictions.
Task 4 – Real SHAP: shap.TreeExplainer for both RF and HGB.
         Falls back to hand-rolled explain_risk() if shap is unavailable.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# ── Optional SHAP ────────────────────────────────────────────────────────────
try:
    import shap as _shap
    _SHAP_AVAILABLE = True
except ImportError:
    _SHAP_AVAILABLE = False

# ──────────────────────────────────────────────────────────────────────────────
# Paths
# ──────────────────────────────────────────────────────────────────────────────
SERVICES_DIR = os.path.dirname(__file__)
HGB_PATH = os.path.join(SERVICES_DIR, "hist_gradient_boosting_pipeline.pkl")
RF_PATH  = os.path.join(SERVICES_DIR, "cyberpitch_classifier.joblib")

# 21 features used by the Random-Forest classifier (unchanged)
RF_FEATURES = [
    "Domain Length", "Subdomain Count", "Hyphen Count", "Digit Count",
    "Contains FIFA Keyword", "Contains Ticket Keyword", "Contains Official Keyword",
    "Contains Stream Keyword", "Contains Reward Keyword",
    "Typosquat Distance to FIFA", "WHOIS Age Days", "Is Privacy Protected",
    "SSL Status Numerical", "SSL Valid Days Remaining",
    "Visual Similarity Score", "Malware Signature Match",
    "Social Media Mentions", "OSINT Report Count",
    "Redirect Chain Length", "Has Payment Page", "Has Login Form",
]

# Columns expected by the HGB pipeline
HGB_FEATURES = [
    "tld", "domain_length", "subdomain_count", "hyphen_count", "digit_count",
    "contains_fifa_keyword", "contains_ticket_keyword", "contains_official_keyword",
    "contains_stream_keyword", "contains_reward_keyword",
    "typosquat_distance_to_fifa", "registrar", "whois_age_days",
    "is_privacy_protected", "ssl_status", "ssl_issuer", "ssl_valid_days_remaining",
    "hosting_country", "asn_provider",
    "visual_similarity_score", "phishing_probability",
    "malware_signature_match", "social_media_mentions",
    "osint_report_count", "redirect_chain_length",
    "has_payment_page", "has_login_form",
]


# ──────────────────────────────────────────────────────────────────────────────
# Model loaders (lazy + cached)
# ──────────────────────────────────────────────────────────────────────────────
_hgb_pipeline   = None
_rf_model       = None
_rf_explainer   = None   # Task 4
_hgb_explainer  = None   # Task 4


def _get_hgb():
    global _hgb_pipeline
    if _hgb_pipeline is None and os.path.exists(HGB_PATH):
        try:
            _hgb_pipeline = joblib.load(HGB_PATH)
        except Exception:
            _hgb_pipeline = None
    return _hgb_pipeline


def _get_rf():
    global _rf_model
    if _rf_model is None:
        if os.path.exists(RF_PATH):
            try:
                _rf_model = joblib.load(RF_PATH)
            except Exception:
                _rf_model = _train_rf()
        else:
            _rf_model = _train_rf()
    return _rf_model


def _get_rf_explainer():
    """Task 4 – lazy SHAP TreeExplainer for RF."""
    global _rf_explainer
    if _rf_explainer is None and _SHAP_AVAILABLE:
        try:
            _rf_explainer = _shap.TreeExplainer(_get_rf())
        except Exception:
            _rf_explainer = None
    return _rf_explainer


def _get_hgb_explainer():
    """Task 4 – lazy SHAP TreeExplainer for HGB."""
    global _hgb_explainer
    hgb = _get_hgb()
    if _hgb_explainer is None and _SHAP_AVAILABLE and hgb is not None:
        try:
            # The HGB pipeline wraps a regressor; extract the final estimator
            estimator = hgb
            if hasattr(hgb, "steps"):
                estimator = hgb.steps[-1][1]
            _hgb_explainer = _shap.TreeExplainer(estimator)
        except Exception:
            _hgb_explainer = None
    return _hgb_explainer


def _train_rf():
    """Fallback: retrain the original Random-Forest on synthetic data."""
    np.random.seed(42)
    n, half = 2500, 1250

    benign = pd.DataFrame({
        "Domain Length":              np.random.randint(8, 20, half),
        "Subdomain Count":            np.random.choice([0, 1, 2], half, p=[0.8, 0.15, 0.05]),
        "Hyphen Count":               np.random.choice([0, 1, 2], half, p=[0.7, 0.2, 0.1]),
        "Digit Count":                np.random.choice([0, 1, 2], half, p=[0.9, 0.08, 0.02]),
        "Contains FIFA Keyword":      np.random.choice([0, 1], half, p=[0.95, 0.05]),
        "Contains Ticket Keyword":    np.random.choice([0, 1], half, p=[0.95, 0.05]),
        "Contains Official Keyword":  np.random.choice([0, 1], half, p=[0.92, 0.08]),
        "Contains Stream Keyword":    np.random.choice([0, 1], half, p=[0.98, 0.02]),
        "Contains Reward Keyword":    np.random.choice([0, 1], half, p=[0.99, 0.01]),
        "Typosquat Distance to FIFA": np.random.choice([2, 3, 4], half, p=[0.1, 0.2, 0.7]),
        "WHOIS Age Days":             np.random.randint(150, 4000, half),
        "Is Privacy Protected":       np.random.choice([0, 1], half, p=[0.6, 0.4]),
        "SSL Status Numerical":       np.random.choice([0, 1, 2, 3], half, p=[0.97, 0.01, 0.01, 0.01]),
        "SSL Valid Days Remaining":   np.random.randint(30, 365, half),
        "Visual Similarity Score":    np.random.uniform(5.0, 35.0, half),
        "Malware Signature Match":    np.zeros(half),
        "Social Media Mentions":      np.random.randint(5, 100, half),
        "OSINT Report Count":         np.zeros(half),
        "Redirect Chain Length":      np.random.choice([0, 1], half, p=[0.9, 0.1]),
        "Has Payment Page":           np.random.choice([0, 1], half, p=[0.85, 0.15]),
        "Has Login Form":             np.random.choice([0, 1], half, p=[0.75, 0.25]),
        "is_malicious":               np.zeros(half),
    })
    phish = pd.DataFrame({
        "Domain Length":              np.random.randint(12, 35, half),
        "Subdomain Count":            np.random.choice([0, 1, 2, 3], half, p=[0.3, 0.4, 0.2, 0.1]),
        "Hyphen Count":               np.random.choice([0, 1, 2, 3], half, p=[0.2, 0.4, 0.3, 0.1]),
        "Digit Count":                np.random.randint(0, 8, half),
        "Contains FIFA Keyword":      np.random.choice([0, 1], half, p=[0.15, 0.85]),
        "Contains Ticket Keyword":    np.random.choice([0, 1], half, p=[0.3, 0.7]),
        "Contains Official Keyword":  np.random.choice([0, 1], half, p=[0.6, 0.4]),
        "Contains Stream Keyword":    np.random.choice([0, 1], half, p=[0.7, 0.3]),
        "Contains Reward Keyword":    np.random.choice([0, 1], half, p=[0.8, 0.2]),
        "Typosquat Distance to FIFA": np.random.choice([0, 1, 2, 3], half, p=[0.2, 0.5, 0.2, 0.1]),
        "WHOIS Age Days":             np.random.randint(1, 90, half),
        "Is Privacy Protected":       np.random.choice([0, 1], half, p=[0.1, 0.9]),
        "SSL Status Numerical":       np.random.choice([0, 1, 2, 3], half, p=[0.4, 0.2, 0.1, 0.3]),
        "SSL Valid Days Remaining":   [np.random.randint(1, 91) if s == 0 else 0
                                       for s in np.random.choice([0, 1, 2, 3], half, p=[0.4, 0.2, 0.1, 0.3])],
        "Visual Similarity Score":    np.random.uniform(65.0, 99.0, half),
        "Malware Signature Match":    np.random.choice([0, 1], half, p=[0.8, 0.2]),
        "Social Media Mentions":      np.random.choice([0, 1, 2], half, p=[0.8, 0.15, 0.05]),
        "OSINT Report Count":         np.random.randint(0, 5, half),
        "Redirect Chain Length":      np.random.randint(0, 4, half),
        "Has Payment Page":           np.random.choice([0, 1], half, p=[0.4, 0.6]),
        "Has Login Form":             np.random.choice([0, 1], half, p=[0.2, 0.8]),
        "is_malicious":               np.ones(half),
    })
    df = pd.concat([benign, phish], ignore_index=True)
    X, y = df[RF_FEATURES], df["is_malicious"]
    m = RandomForestClassifier(n_estimators=100, random_state=42)
    m.fit(X, y)
    joblib.dump(m, RF_PATH)
    return m


# ──────────────────────────────────────────────────────────────────────────────
# Task 3 — Confidence Score
# ──────────────────────────────────────────────────────────────────────────────

def _compute_confidence(rf, X_rf: pd.DataFrame) -> float:
    """
    Confidence = 1 - std_dev of per-tree P(malicious).

    High confidence → trees agree (low variance).
    Low confidence  → trees disagree (high variance).
    Result is clipped to [0, 1] and rounded to 3 dp.
    """
    try:
        per_tree_probs = np.array([
            estimator.predict_proba(X_rf)[0][1]
            for estimator in rf.estimators_
        ])
        std_dev = float(np.std(per_tree_probs))
        confidence = float(np.clip(1.0 - std_dev * 4, 0.0, 1.0))  # scale std
        return round(confidence, 3)
    except Exception:
        return 0.5


# ──────────────────────────────────────────────────────────────────────────────
# Task 4 — SHAP Explanations
# ──────────────────────────────────────────────────────────────────────────────

def _shap_explanations(X_rf: pd.DataFrame, features: dict) -> list:
    """
    Returns top-5 SHAP feature attributions as structured dicts:
      [{"feature": "WHOIS Age Days", "value": 12, "shap_value": 0.34}, ...]

    Falls back to [] if SHAP is unavailable or fails.
    """
    if not _SHAP_AVAILABLE:
        return []

    explainer = _get_rf_explainer()
    if explainer is None:
        return []

    try:
        shap_vals = explainer.shap_values(X_rf)
        # shap_values returns [class0_vals, class1_vals] for binary RF
        if isinstance(shap_vals, list) and len(shap_vals) == 2:
            vals = shap_vals[1][0]   # class-1 (malicious) SHAP values for row 0
        else:
            vals = shap_vals[0]

        # Pair with feature names and sort by |SHAP| descending
        pairs = sorted(
            zip(RF_FEATURES, vals),
            key=lambda x: abs(x[1]),
            reverse=True,
        )[:5]

        return [
            {
                "feature":    feat,
                "value":      float(X_rf.iloc[0][feat]),
                "shap_value": round(float(sv), 4),
            }
            for feat, sv in pairs
        ]
    except Exception:
        return []


# ──────────────────────────────────────────────────────────────────────────────
# Hand-rolled fallback explanations (kept for backwards compat)
# ──────────────────────────────────────────────────────────────────────────────
def explain_risk(features: dict, prob: float) -> list:
    explanations = []
    if features.get("Blacklist Source") not in (None, "None"):
        explanations.append(f"Domain blacklisted on {features['Blacklist Source']} (+45 Risk)")
    age = features.get("WHOIS Age Days", 365)
    if age < 30:
        explanations.append(f"Extremely young domain age ({age} days) (+25 Risk)")
    elif age < 90:
        explanations.append(f"Domain registered recently ({age} days) (+15 Risk)")
    ssl = features.get("SSL Status")
    if ssl == "Self-Signed":
        explanations.append("SSL Certificate is self-signed (untrusted) (+20 Risk)")
    elif ssl == "Expired":
        explanations.append("SSL Certificate is expired (+15 Risk)")
    elif ssl == "Invalid":
        explanations.append("Invalid or missing SSL Certificate (+20 Risk)")
    if features.get("Contains FIFA Keyword"):
        explanations.append("Impersonates 'FIFA' brand name in domain (+15 Risk)")
    if features.get("Contains Ticket Keyword"):
        explanations.append("Contains ticketing keyword in domain (+10 Risk)")
    if features.get("Contains Reward Keyword"):
        explanations.append("Contains phishing-lure 'reward' keyword (+15 Risk)")
    if features.get("Contains Stream Keyword"):
        explanations.append("Contains streaming keyword (+10 Risk)")
    typo = features.get("Typosquat Distance to FIFA", 4)
    if typo <= 1:
        explanations.append(f"Typosquatting detected (distance {typo} to 'fifa') (+20 Risk)")
    vis = features.get("Visual Similarity Score", 0.0)
    if vis > 75:
        explanations.append(f"High visual similarity to FIFA portals ({vis:.1f}%) (+20 Risk)")
    if features.get("Has Login Form"):
        explanations.append("Page contains authentication input form (+10 Risk)")
    if features.get("Has Payment Page"):
        explanations.append("Page contains ticketing checkout prompts (+10 Risk)")
    reports = features.get("OSINT Report Count", 0)
    if reports > 0:
        explanations.append(f"Domain flagged in {reports} OSINT reports (+15 Risk)")
    reds = features.get("Redirect Chain Length", 0)
    if reds >= 2:
        explanations.append(f"Long URL redirect chain ({reds} hops) (+10 Risk)")
    if not explanations and prob < 0.15:
        explanations.append("Domain presents zero critical threat indicators")
    return explanations


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────
def make_prediction(features: dict) -> dict:
    """
    Two-stage prediction:
      1. Random Forest → classification probability + confidence score
      2. HistGradientBoosting pipeline → precise risk_score regression
         (falls back to RF-based score if HGB model is unavailable)
      3. Real SHAP explanations (falls back to hand-rolled if shap missing)
    """
    # ── SSL numeric mapping ──────────────────────────────────────────────────
    ssl_str = features.get("SSL Status", "Invalid")
    ssl_num = {"Valid": 0, "Self-Signed": 1, "Expired": 2}.get(ssl_str, 3)

    # ── Stage 1: RF probability + confidence (Task 3) ────────────────────────
    rf = _get_rf()
    rf_vector = [
        features.get("Domain Length", len(features.get("domain", ""))),
        features.get("Subdomain Count", 0),
        features.get("Hyphen Count", 0),
        features.get("Digit Count", 0),
        features.get("Contains FIFA Keyword", 0),
        features.get("Contains Ticket Keyword", 0),
        features.get("Contains Official Keyword", 0),
        features.get("Contains Stream Keyword", 0),
        features.get("Contains Reward Keyword", 0),
        features.get("Typosquat Distance to FIFA", 4),
        features.get("WHOIS Age Days", 365),
        features.get("Is Privacy Protected", 0),
        ssl_num,
        features.get("SSL Valid Days Remaining", 0),
        features.get("Visual Similarity Score", 0.0),
        features.get("Malware Signature Match", 0),
        features.get("Social Media Mentions", 0),
        features.get("OSINT Report Count", 0),
        features.get("Redirect Chain Length", 0),
        features.get("Has Payment Page", 0),
        features.get("Has Login Form", 0),
    ]
    X_rf = pd.DataFrame([rf_vector], columns=RF_FEATURES)
    prob  = float(rf.predict_proba(X_rf)[0][1])

    # Task 3: confidence score
    confidence_score = _compute_confidence(rf, X_rf)

    # ── Stage 2: HGB precise risk score ─────────────────────────────────────
    hgb = _get_hgb()
    domain_str = features.get("domain", "")
    import tldextract
    ext = tldextract.extract(domain_str)

    if hgb is not None:
        hgb_row = {
            "tld":                       ext.suffix or features.get("TLD", ""),
            "domain_length":             features.get("Domain Length", len(domain_str)),
            "subdomain_count":           features.get("Subdomain Count", 0),
            "hyphen_count":              features.get("Hyphen Count", 0),
            "digit_count":               features.get("Digit Count", 0),
            "contains_fifa_keyword":     features.get("Contains FIFA Keyword", 0),
            "contains_ticket_keyword":   features.get("Contains Ticket Keyword", 0),
            "contains_official_keyword": features.get("Contains Official Keyword", 0),
            "contains_stream_keyword":   features.get("Contains Stream Keyword", 0),
            "contains_reward_keyword":   features.get("Contains Reward Keyword", 0),
            "typosquat_distance_to_fifa":features.get("Typosquat Distance to FIFA", 4),
            "registrar":                 features.get("Registrar", "Unknown"),
            "whois_age_days":            features.get("WHOIS Age Days", 365),
            "is_privacy_protected":      features.get("Is Privacy Protected", 0),
            "ssl_status":                ssl_str,
            "ssl_issuer":                features.get("SSL Issuer", "None"),
            "ssl_valid_days_remaining":  features.get("SSL Valid Days Remaining", 0),
            "hosting_country":           features.get("Hosting Country", "Unknown"),
            "asn_provider":              features.get("ASN Provider", "Unknown"),
            "visual_similarity_score":   features.get("Visual Similarity Score", 0.0),
            "phishing_probability":      round(prob * 100, 1),
            "malware_signature_match":   features.get("Malware Signature Match", 0),
            "social_media_mentions":     features.get("Social Media Mentions", 0),
            "osint_report_count":        features.get("OSINT Report Count", 0),
            "redirect_chain_length":     features.get("Redirect Chain Length", 0),
            "has_payment_page":          features.get("Has Payment Page", 0),
            "has_login_form":            features.get("Has Login Form", 0),
        }
        X_hgb = pd.DataFrame([hgb_row], columns=HGB_FEATURES)
        try:
            raw_score = float(hgb.predict(X_hgb)[0])
            risk_score = int(np.clip(round(raw_score), 0, 100))
        except Exception:
            risk_score = int(prob * 100)
    else:
        blacklist = features.get("Blacklist Source", "None")
        if blacklist not in (None, "None") or features.get("Malware Signature Match") == 1:
            risk_score = 95  # deterministic high score for confirmed threats
        else:
            risk_score = int(prob * 100)

    # ── Threat type ──────────────────────────────────────────────────────────
    blacklist = features.get("Blacklist Source", "None")
    if features.get("Contains Stream Keyword"):
        threat_type = "Illegal Streaming"
    elif features.get("Contains Ticket Keyword"):
        threat_type = "Fake Ticketing"
    elif features.get("Contains Reward Keyword"):
        threat_type = "Phishing"
    elif blacklist not in (None, "None") or features.get("Malware Signature Match") == 1:
        threat_type = "Malware"
    elif features.get("Contains Official Keyword") or features.get("Contains FIFA Keyword"):
        threat_type = "Brand Impersonation"
    else:
        threat_type = "Phishing" if risk_score >= 50 else "Safe"

    # ── Severity / status / action ───────────────────────────────────────────
    if risk_score >= 85:
        severity, action, status = "Critical", "Block Domain, Notify Analysts, Generate IOC Report", "Pending Block"
    elif risk_score >= 70:
        severity, action, status = "High", "Send Takedown Request", "Notified"
    elif risk_score >= 45:
        severity, action, status = "Medium", "Investigate", "Under Review"
    else:
        severity = "Low"
        action   = "Monitor Traffic" if risk_score > 20 else "None"
        status   = "Under Review"

    if threat_type == "Safe":
        severity, action, status = "Low", "None", "Under Review"

    # ── Task 4: SHAP explanations ────────────────────────────────────────────
    shap_exps   = _shap_explanations(X_rf, features)
    text_exps   = explain_risk(features, prob)   # kept for UI backwards compat

    return {
        "Phishing Probability":  round(prob * 100, 1),
        "Risk Score":            risk_score,
        "Confidence Score":      confidence_score,        # Task 3
        "Threat Type":           threat_type,
        "Severity":              severity,
        "Recommended Action":    action,
        "Status":                status,
        "Explanations":          text_exps,               # human-readable text
        "SHAP Explanations":     shap_exps,               # Task 4: structured
    }
