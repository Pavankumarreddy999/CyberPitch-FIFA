import json
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.models.scan_history import ScanHistory
from app.schemas.whois import DomainRequest
from app.services.aggregator_service import aggregate_features
from app.services.ml_service import make_prediction
from app.utils.validators import normalize_domain, is_valid_domain
from app.utils.logger import logger

router = APIRouter(
    prefix="/api",
    tags=["Domain Scanner"]
)


@router.post("/scan")
def scan_domain(request: DomainRequest, db: Session = Depends(get_db)):
    """
    Phishing Threat Scan Pipeline:
    1. Normalize and Validate Domain
    2. Threat Intelligence API check (URLhaus)
    3. Feature Aggregator (DNS, SSL, WHOIS, HTML)
    4. ML Prediction model evaluation
    5. Save results to Scan History
    """
    domain = normalize_domain(request.domain)

    if not is_valid_domain(domain):
        raise HTTPException(status_code=400, detail="Invalid domain name format.")

    logger.info(f"Scanning domain: {domain}")

    try:
        # Step 2 & 3: Run Feature Aggregator
        features = aggregate_features(domain, db)

        # Step 4: Run ML Prediction
        prediction_res = make_prediction(features)

        # Step 5: Construct Unified Scan Record
        # Generate a unique Domain ID for this scan
        domain_id = f"DOM{random.randint(10000, 99999)}"
        
        # Merge features & predictions
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

        # Step 6: Save to database
        history_entry = ScanHistory(
            domain=domain,
            prediction=json.dumps(scan_result),
            risk_score=scan_result["Risk Score"]
        )
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)

        # Include database ID in response
        scan_result["id"] = history_entry.id
        return {
            "success": True,
            "data": scan_result
        }

    except Exception as e:
        logger.exception(f"Scan failed for {domain}")
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")


@router.get("/scan/history")
def get_scan_history(limit: int = 50, db: Session = Depends(get_db)):
    """Returns scanned domain history."""
    rows = db.query(ScanHistory).order_by(ScanHistory.created_at.desc()).limit(limit).all()

    history = []
    for r in rows:
        try:
            data = json.loads(r.prediction)
            data["id"] = r.id
            data["created_at_db"] = r.created_at.isoformat()
            history.append(data)
        except Exception:
            # Fallback if parsing fails
            history.append({
                "id": r.id,
                "domain": r.domain,
                "Risk Score": r.risk_score,
                "Threat Type": "Phishing" if r.risk_score >= 50 else "Safe",
                "Severity": "Critical" if r.risk_score >= 85 else "High" if r.risk_score >= 70 else "Medium" if r.risk_score >= 45 else "Low",
                "Status": "Under Review",
                "Detection Timestamp": r.created_at.isoformat()
            })
    return history


@router.get("/scan/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Computes real-time statistics from scan database records."""
    total_domains = db.query(func.count(ScanHistory.id)).scalar() or 0
    
    # If no records exist, return seed placeholders so dashboard doesn't look empty
    if total_domains == 0:
        return {
            "stats": {
                "totalDomains": 0,
                "threatsDetected": 0,
                "highRiskDomains": 0,
                "activeCampaigns": 0,
                "domainsScannedToday": 0,
                "averageRiskScore": 0
            },
            "severityDistribution": {"critical": 0, "high": 0, "medium": 0, "low": 0},
            "recentActivity": []
        }

    threats_detected = db.query(func.count(ScanHistory.id)).filter(ScanHistory.risk_score >= 50).scalar() or 0
    high_risk_domains = db.query(func.count(ScanHistory.id)).filter(ScanHistory.risk_score >= 70).scalar() or 0
    
    # Average Risk Score
    avg_score_res = db.query(func.avg(ScanHistory.risk_score)).scalar()
    avg_risk_score = round(float(avg_score_res)) if avg_score_res is not None else 0

    # Scans Today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    scanned_today = db.query(func.count(ScanHistory.id)).filter(ScanHistory.created_at >= today_start).scalar() or 0

    # Active Campaigns (count distinct malicious Threat Types)
    rows = db.query(ScanHistory.prediction).all()
    threat_types = set()
    severity_dist = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    recent_activity = []

    for r in rows:
        try:
            p_data = json.loads(r[0])
            threat = p_data.get("Threat Type", "Safe")
            if threat != "Safe":
                threat_types.add(threat)
            
            # Severity distribution
            sev = str(p_data.get("Severity", "Low")).lower()
            if sev in severity_dist:
                severity_dist[sev] += 1
        except Exception:
            pass

    active_campaigns = len(threat_types)

    # Compile recent activity (last 5 scans)
    recent_scans = db.query(ScanHistory).order_by(ScanHistory.id.desc()).limit(5).all()
    for s in recent_scans:
        try:
            p_data = json.loads(s.prediction)
            action = "New Threat Detected" if s.risk_score >= 50 else "New Scan Started"
            recent_activity.append({
                "timestamp": s.created_at.isoformat(),
                "action": action,
                "domain": s.domain
            })
        except Exception:
            recent_activity.append({
                "timestamp": s.created_at.isoformat(),
                "action": "New Scan Started",
                "domain": s.domain
            })

    return {
        "stats": {
            "totalDomains": total_domains,
            "threatsDetected": threats_detected,
            "highRiskDomains": high_risk_domains,
            "activeCampaigns": active_campaigns if active_campaigns > 0 else 1,
            "domainsScannedToday": scanned_today,
            "averageRiskScore": avg_risk_score
        },
        "severityDistribution": severity_dist,
        "recentActivity": recent_activity
    }
