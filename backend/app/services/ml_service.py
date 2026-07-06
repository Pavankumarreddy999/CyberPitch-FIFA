import os
import random
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

MODEL_PATH = os.path.join(os.path.dirname(__file__), "cyberpitch_classifier.joblib")

# The 21 features used for model training
FEATURES = [
    "Domain Length",
    "Subdomain Count",
    "Hyphen Count",
    "Digit Count",
    "Contains FIFA Keyword",
    "Contains Ticket Keyword",
    "Contains Official Keyword",
    "Contains Stream Keyword",
    "Contains Reward Keyword",
    "Typosquat Distance to FIFA",
    "WHOIS Age Days",
    "Is Privacy Protected",
    "SSL Status Numerical",  # Valid=0, Self-Signed=1, Expired=2, Invalid=3
    "SSL Valid Days Remaining",
    "Visual Similarity Score",
    "Malware Signature Match",
    "Social Media Mentions",
    "OSINT Report Count",
    "Redirect Chain Length",
    "Has Payment Page",
    "Has Login Form"
]


def train_model():
    """
    Generates a synthetic dataset of 2,500 domains modeling phishing signatures
    versus benign profiles, trains a Random Forest Classifier, and saves it.
    """
    print("Training cyberpitch phishing detection model...")
    np.random.seed(42)
    n_samples = 2500
    half_samples = n_samples // 2

    # Benign data generation
    benign = pd.DataFrame()
    benign["Domain Length"] = np.random.randint(8, 20, half_samples)
    benign["Subdomain Count"] = np.random.choice([0, 1, 2], half_samples, p=[0.8, 0.15, 0.05])
    benign["Hyphen Count"] = np.random.choice([0, 1, 2], half_samples, p=[0.7, 0.2, 0.1])
    benign["Digit Count"] = np.random.choice([0, 1, 2], half_samples, p=[0.9, 0.08, 0.02])
    benign["Contains FIFA Keyword"] = np.random.choice([0, 1], half_samples, p=[0.95, 0.05])
    benign["Contains Ticket Keyword"] = np.random.choice([0, 1], half_samples, p=[0.95, 0.05])
    benign["Contains Official Keyword"] = np.random.choice([0, 1], half_samples, p=[0.92, 0.08])
    benign["Contains Stream Keyword"] = np.random.choice([0, 1], half_samples, p=[0.98, 0.02])
    benign["Contains Reward Keyword"] = np.random.choice([0, 1], half_samples, p=[0.99, 0.01])
    benign["Typosquat Distance to FIFA"] = np.random.choice([2, 3, 4], half_samples, p=[0.1, 0.2, 0.7])
    benign["WHOIS Age Days"] = np.random.randint(150, 4000, half_samples)
    benign["Is Privacy Protected"] = np.random.choice([0, 1], half_samples, p=[0.6, 0.4])
    benign["SSL Status Numerical"] = np.random.choice([0, 1, 2, 3], half_samples, p=[0.97, 0.01, 0.01, 0.01])
    benign["SSL Valid Days Remaining"] = np.random.randint(30, 365, half_samples)
    benign["Visual Similarity Score"] = np.random.uniform(5.0, 35.0, half_samples)
    benign["Malware Signature Match"] = np.zeros(half_samples)
    benign["Social Media Mentions"] = np.random.randint(5, 100, half_samples)
    benign["OSINT Report Count"] = np.zeros(half_samples)
    benign["Redirect Chain Length"] = np.random.choice([0, 1], half_samples, p=[0.9, 0.1])
    benign["Has Payment Page"] = np.random.choice([0, 1], half_samples, p=[0.85, 0.15])
    benign["Has Login Form"] = np.random.choice([0, 1], half_samples, p=[0.75, 0.25])
    benign["is_malicious"] = np.zeros(half_samples)

    # Phishing/Malicious data generation
    phish = pd.DataFrame()
    phish["Domain Length"] = np.random.randint(12, 35, half_samples)
    phish["Subdomain Count"] = np.random.choice([0, 1, 2, 3], half_samples, p=[0.3, 0.4, 0.2, 0.1])
    phish["Hyphen Count"] = np.random.choice([0, 1, 2, 3], half_samples, p=[0.2, 0.4, 0.3, 0.1])
    phish["Digit Count"] = np.random.randint(0, 8, half_samples)
    phish["Contains FIFA Keyword"] = np.random.choice([0, 1], half_samples, p=[0.15, 0.85])
    phish["Contains Ticket Keyword"] = np.random.choice([0, 1], half_samples, p=[0.3, 0.7])
    phish["Contains Official Keyword"] = np.random.choice([0, 1], half_samples, p=[0.6, 0.4])
    phish["Contains Stream Keyword"] = np.random.choice([0, 1], half_samples, p=[0.7, 0.3])
    phish["Contains Reward Keyword"] = np.random.choice([0, 1], half_samples, p=[0.8, 0.2])
    phish["Typosquat Distance to FIFA"] = np.random.choice([0, 1, 2, 3], half_samples, p=[0.2, 0.5, 0.2, 0.1])
    phish["WHOIS Age Days"] = np.random.randint(1, 90, half_samples)
    phish["Is Privacy Protected"] = np.random.choice([0, 1], half_samples, p=[0.1, 0.9])
    phish["SSL Status Numerical"] = np.random.choice([0, 1, 2, 3], half_samples, p=[0.4, 0.2, 0.1, 0.3])
    
    # SSL Days remaining (0 for invalid status)
    ssl_days = []
    for stat in phish["SSL Status Numerical"]:
        if stat == 0:
            ssl_days.append(random.randint(1, 90))
        else:
            ssl_days.append(0)
    phish["SSL Valid Days Remaining"] = ssl_days
    
    phish["Visual Similarity Score"] = np.random.uniform(65.0, 99.0, half_samples)
    phish["Malware Signature Match"] = np.random.choice([0, 1], half_samples, p=[0.8, 0.2])
    phish["Social Media Mentions"] = np.random.choice([0, 1, 2], half_samples, p=[0.8, 0.15, 0.05])
    phish["OSINT Report Count"] = np.random.randint(0, 5, half_samples)
    phish["Redirect Chain Length"] = np.random.randint(0, 4, half_samples)
    phish["Has Payment Page"] = np.random.choice([0, 1], half_samples, p=[0.4, 0.6])
    phish["Has Login Form"] = np.random.choice([0, 1], half_samples, p=[0.2, 0.8])
    phish["is_malicious"] = np.ones(half_samples)

    # Combine & Train
    df = pd.concat([benign, phish], ignore_index=True)
    X = df[FEATURES]
    y = df["is_malicious"]

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    # Save model
    joblib.dump(model, MODEL_PATH)
    print(f"Model trained and saved to {MODEL_PATH}")
    return model


def get_model():
    """Loads the model, training it first if not present."""
    if not os.path.exists(MODEL_PATH):
        return train_model()
    try:
        return joblib.load(MODEL_PATH)
    except Exception:
        return train_model()


def explain_risk(features: dict, prob: float) -> list:
    """
    Computes human-readable risk indicator explanations (SHAP-like)
    based on high-risk feature contributions.
    """
    explanations = []

    # Check blacklist (automatic trigger)
    if features.get("Blacklist Source") != "None":
        explanations.append(f"Domain is blacklisted on {features['Blacklist Source']} (+45 Risk)")

    # WHOIS age
    age = features.get("WHOIS Age Days", 365)
    if age < 30:
        explanations.append(f"Extremely young domain age ({age} days) (+25 Risk)")
    elif age < 90:
        explanations.append(f"Domain registered recently ({age} days) (+15 Risk)")

    # SSL Status
    ssl = features.get("SSL Status")
    if ssl == "Self-Signed":
        explanations.append("SSL Certificate is self-signed (untrusted) (+20 Risk)")
    elif ssl == "Expired":
        explanations.append("SSL Certificate is expired (+15 Risk)")
    elif ssl == "Invalid":
        explanations.append("Invalid or missing SSL Certificate (+20 Risk)")

    # Keywords
    if features.get("Contains FIFA Keyword"):
        explanations.append("Impersonates 'FIFA' brand name in domain (+15 Risk)")
    if features.get("Contains Ticket Keyword"):
        explanations.append("Contains ticketing keyword in domain (+10 Risk)")
    if features.get("Contains Reward Keyword"):
        explanations.append("Contains phishing-lure 'reward' keyword (+15 Risk)")
    if features.get("Contains Stream Keyword"):
        explanations.append("Contains streaming keyword (+10 Risk)")

    # Typosquat
    typo = features.get("Typosquat Distance to FIFA", 4)
    if typo <= 1:
        explanations.append(f"Typosquatting detected (distance {typo} to 'fifa') (+20 Risk)")

    # Visual Similarity
    vis = features.get("Visual Similarity Score", 0.0)
    if vis > 75:
        explanations.append(f"High visual similarity to FIFA portals ({vis:.1f}%) (+20 Risk)")

    # HTML Input Elements
    if features.get("Has Login Form"):
        explanations.append("Page contains password or authentication input form (+10 Risk)")
    if features.get("Has Payment Page"):
        explanations.append("Page contains ticketing checkout payment prompts (+10 Risk)")

    # OSINT reports
    reports = features.get("OSINT Report Count", 0)
    if reports > 0:
        explanations.append(f"Domain flagged in {reports} OSINT reports (+15 Risk)")

    # Redirect chain
    reds = features.get("Redirect Chain Length", 0)
    if reds >= 2:
        explanations.append(f"Long URL redirect chain ({reds} hops) (+10 Risk)")

    # If no warnings and low probability
    if not explanations and prob < 0.15:
        explanations.append("Domain presents zero critical threat indicators")

    return explanations


def make_prediction(features: dict) -> dict:
    """
    Ingests feature dictionary, formats for Random Forest, and returns
    probability, risk score, severity, status, and explanations.
    """
    model = get_model()

    # Convert SSL Status to numerical
    ssl_str = features.get("SSL Status", "Invalid")
    ssl_num = 3
    if ssl_str == "Valid":
        ssl_num = 0
    elif ssl_str == "Self-Signed":
        ssl_num = 1
    elif ssl_str == "Expired":
        ssl_num = 2

    # Map features dictionary to list in correct order
    feat_vector = [
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
        features.get("Has Login Form", 0)
    ]

    # Predict probability — use named DataFrame to avoid sklearn feature name warnings
    X_pred = pd.DataFrame([feat_vector], columns=FEATURES)
    prob = float(model.predict_proba(X_pred)[0][1])

    # Compute threat intelligence overrides
    blacklist = features.get("Blacklist Source", "None")
    
    # Determine risk score (0 to 100)
    if blacklist != "None" or features.get("Malware Signature Match") == 1:
        risk_score = random.randint(93, 100)
    else:
        risk_score = int(prob * 100)

    # Threat Type Mapping
    if features.get("Contains Stream Keyword"):
        threat_type = "Illegal Streaming"
    elif features.get("Contains Ticket Keyword"):
        threat_type = "Fake Ticketing"
    elif features.get("Contains Reward Keyword"):
        threat_type = "Phishing"
    elif blacklist != "None" or features.get("Malware Signature Match") == 1:
        threat_type = "Malware"
    elif features.get("Contains Official Keyword") or features.get("Contains FIFA Keyword"):
        threat_type = "Brand Impersonation"
    else:
        threat_type = "Phishing" if risk_score >= 50 else "Safe"

    # Severity Mapping
    if risk_score >= 85:
        severity = "Critical"
        recommended_action = "Block Domain, Notify Analysts, Generate IOC Report"
        status = "Pending Block"
    elif risk_score >= 70:
        severity = "High"
        recommended_action = "Send Takedown Request"
        status = "Notified"
    elif risk_score >= 45:
        severity = "Medium"
        recommended_action = "Investigate"
        status = "Under Review"
    else:
        severity = "Low"
        recommended_action = "Monitor Traffic" if risk_score > 20 else "None"
        status = "Under Review"

    if threat_type == "Safe":
        severity = "Low"
        recommended_action = "None"
        status = "Under Review"

    # Generate explanations
    explanations = explain_risk(features, prob)

    return {
        "Phishing Probability": float(round(prob * 100, 1)),
        "Risk Score": risk_score,
        "Threat Type": threat_type,
        "Severity": severity,
        "Recommended Action": recommended_action,
        "Status": status,
        "Explanations": explanations
    }
