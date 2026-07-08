import json
import hashlib
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
async def scan_domain(request: DomainRequest, db: Session = Depends(get_db)):
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
        features = await aggregate_features(domain, db)

        # Check for non-existing or completely inactive domains
        if features.get("IP Address") == "0.0.0.0" and features.get("Registrar", "Unknown") == "Unknown":
            raise HTTPException(status_code=404, detail="Domain does not exist, is unregistered, or is completely inactive.")

        # Step 4: Run ML Prediction
        prediction_res = make_prediction(features)

        # Step 5: Construct Unified Scan Record
        # Generate a deterministic Domain ID from a hash of the domain name
        domain_id = f"DOM{int(hashlib.sha256(domain.encode()).hexdigest(), 16) % 90000 + 10000}"
        
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

        # Step 6: Save to database (upsert — prevent duplicates)
        existing = db.query(ScanHistory).filter(
            ScanHistory.domain == domain
        ).first()

        if existing:
            # Update the existing record with the latest scan result
            existing.prediction = json.dumps(scan_result)
            existing.risk_score = scan_result["Risk Score"]
            existing.created_at = datetime.utcnow()
            db.commit()
            db.refresh(existing)
            scan_result["id"] = existing.id
        else:
            history_entry = ScanHistory(
                domain=domain,
                prediction=json.dumps(scan_result),
                risk_score=scan_result["Risk Score"]
            )
            db.add(history_entry)
            db.commit()
            db.refresh(history_entry)
            scan_result["id"] = history_entry.id
        return {
            "success": True,
            "data": scan_result
        }

    except Exception as e:
        logger.exception(f"Scan failed for {domain}")
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")

@router.post("/domains/analyze")
async def analyze_domain(request: DomainRequest, db: Session = Depends(get_db)):
    """Alias for /scan – runs the full domain analysis pipeline."""
    return scan_domain(request, db)


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


@router.get("/scan/alerts")
def get_threat_alerts(limit: int = 20, db: Session = Depends(get_db)):
    """Returns high-severity (Critical/High) domains as threat alerts."""
    rows = db.query(ScanHistory).filter(
        ScanHistory.risk_score >= 70
    ).order_by(ScanHistory.created_at.desc()).limit(limit).all()

    alerts = []
    for r in rows:
        try:
            p = json.loads(r.prediction)
            alerts.append({
                "id": r.id,
                "domain": r.domain,
                "riskScore": r.risk_score,
                "threatType": p.get("Threat Type", "Unknown"),
                "severity": p.get("Severity", "High"),
                "recommendedAction": p.get("Recommended Action", "Investigate"),
                "status": p.get("Status", "Under Review"),
                "detectedAt": r.created_at.isoformat(),
                "explanations": p.get("Explanations", []),
            })
        except Exception:
            alerts.append({
                "id": r.id,
                "domain": r.domain,
                "riskScore": r.risk_score,
                "threatType": "Unknown",
                "severity": "High",
                "recommendedAction": "Investigate",
                "status": "Under Review",
                "detectedAt": r.created_at.isoformat(),
                "explanations": [],
            })
    return alerts


@router.get("/scan/campaigns")
def get_campaigns(db: Session = Depends(get_db)):
    """Aggregates active threat campaigns by type with timeline."""
    rows = db.query(ScanHistory).order_by(ScanHistory.created_at.asc()).all()

    campaigns: dict = {}
    for r in rows:
        try:
            p = json.loads(r.prediction)
            tt = p.get("Threat Type", "Safe")
            if tt == "Safe":
                continue
            sev = p.get("Severity", "Low").lower()
            if tt not in campaigns:
                campaigns[tt] = {
                    "name": tt,
                    "count": 0,
                    "criticalCount": 0,
                    "highCount": 0,
                    "mediumCount": 0,
                    "domains": [],
                    "timeline": [],
                }
            c = campaigns[tt]
            c["count"] += 1
            if sev == "critical": c["criticalCount"] += 1
            elif sev == "high":   c["highCount"] += 1
            elif sev == "medium": c["mediumCount"] += 1
            c["domains"].append(r.domain)
            c["timeline"].append({
                "domain": r.domain,
                "date": r.created_at.isoformat(),
                "riskScore": r.risk_score,
            })
        except Exception:
            pass

    return list(campaigns.values())


@router.get("/scan/flagged")
def get_flagged_domains(
    severity: str = None,
    threat_type: str = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Returns flagged (malicious) domains with optional filters."""
    query = db.query(ScanHistory).filter(
        ScanHistory.risk_score >= 45
    ).order_by(ScanHistory.created_at.desc()).limit(limit)
    rows = query.all()

    result = []
    for r in rows:
        try:
            p = json.loads(r.prediction)
            sev = p.get("Severity", "Low").lower()
            tt  = p.get("Threat Type", "Unknown")
            if severity and sev != severity.lower():
                continue
            if threat_type and tt.lower() != threat_type.lower():
                continue
            result.append({
                "id": r.id,
                "domain": r.domain,
                "threatType": tt,
                "riskScore": r.risk_score,
                "severity": sev,
                "status": p.get("Status", "Under Review").lower(),
                "detectedAt": r.created_at.isoformat(),
                "sslStatus": p.get("SSL Status", "Unknown"),
                "whoisAge": p.get("WHOIS Age Days", 0),
                "visualSimilarity": p.get("Visual Similarity Score", 0),
                "phishingProbability": p.get("Phishing Probability", 0),
                "recommendedAction": p.get("Recommended Action", "Investigate"),
                "explanations": p.get("Explanations", []),
            })
        except Exception:
            pass
    return result


@router.get("/scan/recommendations")
def get_recommendations(db: Session = Depends(get_db)):
    """Returns analyst recommendations grouped by action type."""
    rows = db.query(ScanHistory).filter(
        ScanHistory.risk_score >= 45
    ).order_by(ScanHistory.created_at.desc()).limit(50).all()

    action_groups: dict = {}
    for r in rows:
        try:
            p = json.loads(r.prediction)
            action = p.get("Recommended Action", "Investigate")
            if action not in action_groups:
                action_groups[action] = {
                    "action": action,
                    "count": 0,
                    "severity": p.get("Severity", "Medium"),
                    "domains": [],
                }
            action_groups[action]["count"] += 1
            action_groups[action]["domains"].append({
                "domain": r.domain,
                "riskScore": r.risk_score,
                "threatType": p.get("Threat Type", "Unknown"),
                "severity": p.get("Severity", "Medium"),
                "detectedAt": r.created_at.isoformat(),
            })
        except Exception:
            pass

    return sorted(list(action_groups.values()), key=lambda x: x["count"], reverse=True)


@router.get("/scan/{scan_id}")
def get_scan_detail(scan_id: int, db: Session = Depends(get_db)):
    """Returns full details for a single scan record."""
    row = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Scan not found")
    try:
        data = json.loads(row.prediction)
        data["id"] = row.id
        data["created_at_db"] = row.created_at.isoformat()
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/scan/{scan_id}")
def delete_scan(scan_id: int, db: Session = Depends(get_db)):
    """Deletes a single scan record."""
    row = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Scan not found")
    try:
        db.delete(row)
        db.commit()
        return {"success": True, "message": f"Scan {scan_id} deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
