import sys
import os
import sqlite3
import json
import asyncio
from datetime import datetime
import hashlib

# Add backend directory to sys.path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database.database import SessionLocal
from app.models.scan_history import ScanHistory
from app.services.aggregator_service import aggregate_features
from app.services.ml_service import make_prediction

async def process_domains():
    db = SessionLocal()
    try:
        # Fetch domains from discovered_domains
        cursor = db.execute(text("SELECT domain FROM discovered_domains"))
        domains = [row[0] for row in cursor.fetchall()]
        
        print(f"Found {len(domains)} domains in discovered_domains table.")
        
        for domain in domains:
            print(f"Processing domain: {domain}")
            
            # 1. Feature Aggregation
            features = await aggregate_features(domain, db)
            
            # 2. ML Prediction
            prediction_res = make_prediction(features)
            
            # 3. Save to Scan History
            domain_id = f"DOM{int(hashlib.sha256(domain.encode()).hexdigest(), 16) % 90000 + 10000}"
            
            scan_result = {
                "Domain ID": domain_id,
                "Domain Name": domain,
                "TLD": features.get("TLD", ""),
                "Domain Length": features.get("Domain Length", len(domain)),
                "Subdomain Count": features.get("Subdomain Count", 0),
                "Hyphen Count": features.get("Hyphen Count", 0),
                "Digit Count": features.get("Digit Count", 0),
                "Contains FIFA Keyword": features.get("Contains FIFA Keyword", 0),
                "Contains Ticket Keyword": features.get("Contains Ticket Keyword", 0),
                "Contains Official Keyword": features.get("Contains Official Keyword", 0),
                "Contains Stream Keyword": features.get("Contains Stream Keyword", 0),
                "Contains Reward Keyword": features.get("Contains Reward Keyword", 0),
                "Typosquat Distance to FIFA": features.get("Typosquat Distance to FIFA", 4),
                "Registrar": features.get("Registrar", "Unknown"),
                "WHOIS Age Days": features.get("WHOIS Age Days", 0),
                "Is Privacy Protected": features.get("Is Privacy Protected", 0),
                "SSL Status": features.get("SSL Status", "Invalid"),
                "SSL Issuer": features.get("SSL Issuer", "None"),
                "SSL Valid Days Remaining": features.get("SSL Valid Days Remaining", 0),
                "IP Address": features.get("IP Address", "0.0.0.0"),
                "Hosting Country": features.get("Hosting Country", "Unknown"),
                "ASN Provider": features.get("ASN Provider", "Unknown"),
                "Visual Similarity Score": features.get("Visual Similarity Score", 0.0),
                "Phishing Probability": prediction_res.get("Phishing Probability", 0.0),
                "Malware Signature Match": features.get("Malware Signature Match", 0),
                "Blacklist Source": features.get("Blacklist Source", "None"),
                "Social Media Mentions": features.get("Social Media Mentions", 0),
                "OSINT Report Count": features.get("OSINT Report Count", 0),
                "Redirect Chain Length": features.get("Redirect Chain Length", 0),
                "Has Payment Page": features.get("Has Payment Page", 0),
                "Has Login Form": features.get("Has Login Form", 0),
                "Threat Type": prediction_res.get("Threat Type", "Safe"),
                "Risk Score": prediction_res.get("Risk Score", 0),
                "Severity": prediction_res.get("Severity", "Low"),
                "Status": prediction_res.get("Status", "Under Review"),
                "Recommended Action": prediction_res.get("Recommended Action", "None"),
                "Explanations": prediction_res.get("Explanations", []),
                "Detection Timestamp": datetime.utcnow().isoformat()
            }
            
            existing = db.query(ScanHistory).filter(ScanHistory.domain == domain).first()
            if existing:
                existing.prediction = json.dumps(scan_result)
                existing.risk_score = scan_result["Risk Score"]
                existing.created_at = datetime.utcnow()
                print(f"Updated existing record for {domain}")
            else:
                history_entry = ScanHistory(
                    domain=domain,
                    prediction=json.dumps(scan_result),
                    risk_score=scan_result["Risk Score"]
                )
                db.add(history_entry)
                print(f"Added new record for {domain}")
            db.commit()
            
        print("Done processing discovered domains.")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(process_domains())
