# 🛡️ CyberPitch FIFA — Phishing Domain Detection Platform

> **An AI-powered cybersecurity dashboard for detecting, classifying, and monitoring phishing domains that impersonate FIFA / World Cup 2026 brands.**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [ML Pipeline](#ml-pipeline)
- [External APIs & Services Used](#external-apis--services-used)
- [Backend API Reference](#backend-api-reference)
- [Environment Variables & Configuration](#environment-variables--configuration)
- [Getting Started](#getting-started)
- [Dataset](#dataset)
- [Security Notes](#security-notes)

---

## Overview

CyberPitch FIFA is a full-stack cybersecurity intelligence platform built to detect and monitor phishing websites that impersonate **FIFA**, **World Cup 2026**, and related brands. It combines real-time domain intelligence gathering with a dual-model machine learning pipeline to assign risk scores, classify threats, and provide human-readable explanations.

The platform features:

- A **Next.js 16 dashboard** with a deep-blue/neon cyberpunk aesthetic
- A **FastAPI backend** that orchestrates concurrent domain scanning across 6+ intelligence services
- A **two-stage ML engine** (Random Forest + HistGradientBoosting) with SHAP-powered explanations
- An **autonomous domain discovery** scheduler that continuously surfaces new suspicious domains using typosquatting, combosquatting, and Certificate Transparency logs
- **SQLite persistence** with 7-day smart caching for WHOIS, DNS, SSL, and ASN results

---

## Features

| Feature | Description |
|---|---|
| 🔍 **Domain Scanner** | Paste any domain → full phishing risk report in seconds |
| 🤖 **Dual ML Models** | Random Forest (classification) + HistGradientBoosting (risk regression) |
| 📊 **SHAP Explanations** | Top-5 feature attributions explaining why a domain is flagged |
| 🛰️ **Auto Domain Discovery** | Scheduled job runs every 12 hours, generating typo/combo variants and querying crt.sh CT logs |
| 📡 **Real-time OSINT** | URLHaus blacklist, RDAP/WHOIS, DNS, SSL, HTML form analysis, ASN lookup |
| 👁️ **Visual Similarity** | Playwright headless browser + pHash comparison against FIFA.com baseline |
| 🔐 **Auth System** | JWT-based login/signup with bcrypt password hashing |
| 📈 **Analytics Dashboard** | Live charts: threat distribution, risk trends, severity breakdown, campaign tracking |
| 📁 **CSV Bulk Upload** | Upload a CSV of domains for batch analysis |
| 🌗 **Dark / Light Mode** | Togglable theme with CSS custom property tokens |
| 💾 **Smart Caching** | WHOIS, DNS, SSL, and ASN results cached in SQLite for 7 days |
| 📋 **Scan History** | All scans persisted with full feature vectors and predictions |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js 16 Frontend                         │
│  React 19 · TanStack Query · Recharts · Zustand · Radix UI      │
│  Single-page dashboard (dark neon theme, light mode support)    │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTP / REST  (localhost:3000 → :8000)
┌──────────────────────────▼──────────────────────────────────────┐
│                   FastAPI Backend (Python 3.x)                  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  POST /api/scan  ← Main Scan Pipeline                    │  │
│  │                                                           │  │
│  │  1. Domain normalize + validate                           │  │
│  │  2. Aggregator Service (asyncio.gather — concurrent I/O)  │  │
│  │     ├── WHOIS / RDAP lookup                               │  │
│  │     ├── DNS lookup (A, AAAA, MX, NS, TXT, SOA, DMARC)    │  │
│  │     ├── SSL certificate inspection                        │  │
│  │     ├── HTML analysis (forms, logins, redirects)          │  │
│  │     ├── URLHaus blacklist check                           │  │
│  │     ├── ASN lookup via RDAP (ipwhois)                     │  │
│  │     └── Visual similarity (Playwright pHash vs baseline)  │  │
│  │  3. ML Service                                            │  │
│  │     ├── Stage 1: Random Forest → phishing probability     │  │
│  │     │           + confidence score (tree variance)        │  │
│  │     ├── Stage 2: HistGradientBoosting → risk_score (0-100)│  │
│  │     └── SHAP TreeExplainer → top-5 feature attributions  │  │
│  │  4. Save result to ScanHistory (SQLite)                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│  │ APScheduler (every 12h)  │  │  Smart Cache Layer (SQLite)  │ │
│  │  domain_discovery.py     │  │  WHOIS / DNS / SSL / ASN     │ │
│  │  typos + crt.sh CT logs  │  │  TTL: 7 days, auto-purge     │ │
│  └──────────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   SQLite Database       │
              │   cyberpitch.db         │
              │                         │
              │  • scan_history         │
              │  • discovered_domains   │
              │  • whois_cache          │
              │  • dns_cache            │
              │  • ssl_cache            │
              │  • asn_cache            │
              │  • users                │
              └─────────────────────────┘
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.10 | React framework, App Router, API proxy routes |
| **React** | 19.2.4 | UI rendering |
| **TypeScript** | ^5 | Type safety |
| **TailwindCSS** | ^4 | Utility-first styling base |
| **Recharts** | ^3.9.2 | Bar, Pie, Line charts on dashboard |
| **TanStack Query** | ^5.101.2 | Server state management, caching, background refetch |
| **Zustand** | ^5.0.14 | Client-side global state (auth, settings) |
| **Radix UI** | Various | Accessible Dialog, Dropdown, Tabs, Toast primitives |
| **Axios** | ^1.18.1 | HTTP client for backend API calls |
| **React Hook Form** | ^7.81.0 | Form handling for scan inputs and auth |
| **Zod** | ^4.4.3 | Schema validation for forms |
| **PapaParse** | ^5.5.4 | CSV parsing for bulk domain uploads |
| **Lucide React** | ^1.23.0 | Icon library |
| **date-fns** | ^4.4.0 | Date formatting in scan history |
| **class-variance-authority** | ^0.7.1 | Component variant management |
| **Google Fonts** | — | Inter (body), Space Grotesk (headings), JetBrains Mono (code) |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **FastAPI** | 0.115.12 | Async REST API framework |
| **Uvicorn** | 0.34.3 | ASGI server |
| **SQLAlchemy** | 2.0.41 | ORM + SQLite connection pooling |
| **Pydantic** | 2.11.7 | Request/response schema validation |
| **python-dotenv** | 1.1.1 | `.env` file loading |
| **APScheduler** | ≥3.11 | Background domain discovery scheduler (every 12h) |
| **scikit-learn** | 1.7.1 | RandomForestClassifier, HistGradientBoostingRegressor, pipeline |
| **pandas** | 2.3.1 | Feature DataFrame construction |
| **numpy** | 2.2.6 | Numerical operations, confidence score computation |
| **joblib** | 1.5.1 | Model serialization/deserialization |
| **shap** | optional | SHAP TreeExplainer for feature attribution |
| **requests** | 2.32.4 | HTTP calls to URLHaus, crt.sh, RDAP |
| **python-whois** | 0.9.6 | WHOIS fallback when RDAP fails |
| **dnspython** | 2.7.0 | DNS record resolution (A, AAAA, MX, NS, TXT, SOA, DNSSEC) |
| **beautifulsoup4** | 4.13.4 | HTML parsing for login form & payment page detection |
| **lxml** | 6.0.0 | Fast HTML parser backend for BeautifulSoup |
| **tldextract** | 5.3.0 | Subdomain/domain/TLD extraction |
| **cryptography** | 45.0.5 | SSL certificate utilities |
| **ipwhois** | — | ASN/RDAP lookup for IP addresses |
| **PyJWT** | 2.8.0 | JWT token creation and validation |
| **passlib[bcrypt]** | 1.7.4 | bcrypt password hashing |
| **playwright** | ≥1.61.0 | Headless Chromium for visual screenshots |
| **imagehash** | ≥4.3.2 | Perceptual hash (pHash) for image comparison |
| **Pillow** | ≥12.0.0 | Image processing for visual similarity |
| **python-dateutil** | ≥2.9.0 | Timezone-aware WHOIS date parsing |

---

## Project Structure

```
CyberPitch-FIFA/
│
├── src/                            # Next.js frontend source
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Redirects to /dashboard
│   │   ├── globals.css             # Base CSS reset
│   │   └── dashboard/
│   │       ├── page.tsx            # Main dashboard (1873 lines, all views)
│   │       ├── scan/               # Scan detail pages
│   │       ├── alerts/             # Alerts management
│   │       ├── campaigns/          # Campaign tracker
│   │       ├── domains/            # Discovered domains browser
│   │       └── recommendations/    # Security recommendations
│   │   └── api/                    # Next.js proxy API routes
│   │       ├── auth/               # Login / Signup
│   │       ├── scan/               # Domain scan proxy
│   │       ├── dashboard/          # Dashboard stats
│   │       ├── threats/            # Threat feed
│   │       ├── domains/            # Discovered domains
│   │       ├── campaigns/          # Campaigns
│   │       ├── alerts/             # Alerts
│   │       ├── recommendations/    # Recommendations
│   │       ├── flagged/            # Flagged domains
│   │       └── analyze/            # Analyze endpoint
│   ├── components/
│   │   ├── dashboard/              # Dashboard-specific components
│   │   ├── providers/              # React context providers
│   │   └── ui/                     # Reusable UI primitives
│   ├── lib/
│   │   ├── utils.ts                # cn() helper, formatters
│   │   └── types/                  # TypeScript type definitions
│   └── services/
│       ├── api/                    # Axios API client wrappers
│       └── threats.ts              # Threat feed service
│
├── backend/                        # FastAPI Python backend
│   ├── app/
│   │   ├── main.py                 # FastAPI app init, router registration, scheduler start
│   │   ├── config.py               # CACHE_TTL_DAYS = 7
│   │   ├── api/
│   │   │   ├── scan.py             # POST /api/scan — main scan pipeline
│   │   │   ├── auth.py             # POST /auth/signup, /auth/login, /auth/update-password
│   │   │   ├── whois.py            # GET /whois/{domain}
│   │   │   ├── dns.py              # GET /dns/{domain}
│   │   │   ├── ssl.py              # GET /ssl/{domain}
│   │   │   ├── html.py             # GET /html/{domain}
│   │   │   ├── url_features.py     # GET /url-features/{domain}
│   │   │   └── threat.py           # GET /threat/{domain}
│   │   ├── services/
│   │   │   ├── aggregator_service.py   # Orchestrates all scanners (asyncio.gather)
│   │   │   ├── ml_service.py           # Two-stage ML prediction + SHAP
│   │   │   ├── whois_service.py        # RDAP → python-whois fallback
│   │   │   ├── dns_service.py          # dnspython resolver
│   │   │   ├── ssl_service.py          # Python stdlib ssl socket inspection
│   │   │   ├── html_service.py         # requests + BeautifulSoup
│   │   │   ├── threat_service.py       # URLHaus API check
│   │   │   ├── asn_service.py          # ipwhois RDAP lookup
│   │   │   ├── visual_service.py       # Playwright screenshot + pHash
│   │   │   ├── cache_service.py        # SQLite cache CRUD (WHOIS/DNS/SSL/ASN)
│   │   │   ├── rdap_service.py         # rdap.org REST client
│   │   │   ├── url_feature_service.py  # URL string feature extraction
│   │   │   ├── hist_gradient_boosting_pipeline.pkl  # Trained HGB model
│   │   │   ├── cyberpitch_classifier.joblib         # Trained RF model
│   │   │   └── fifa_baseline.png                    # FIFA.com screenshot baseline
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── database/               # Engine, session, migrations
│   │   └── utils/
│   │       ├── auth.py             # JWT token creation + bcrypt helpers
│   │       ├── validators.py       # Domain normalize + validation
│   │       └── logger.py           # Structured logging
│   ├── scripts/
│   │   ├── domain_discovery.py     # Autonomous discovery scheduler job
│   │   └── seed.py                 # DB seed script
│   ├── train_model.py              # HGB model training script
│   ├── this_one_balanced.csv       # Training dataset (balanced)
│   ├── cyberpitch.db               # SQLite database
│   └── requirements.txt
│
├── dataset/                        # Raw dataset files
├── dataset.csv                     # Full original dataset
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

---

## ML Pipeline

The ML engine is a **two-stage prediction pipeline** located in [`backend/app/services/ml_service.py`](backend/app/services/ml_service.py).

### Stage 1 — Random Forest Classifier

**Model:** `RandomForestClassifier(n_estimators=100)` trained on 21 URL/domain/network features.

**Purpose:** Produces a raw phishing probability (0–1) and a confidence score.

**21 Input Features:**

| Feature | Description |
|---|---|
| Domain Length | Total character length of the domain |
| Subdomain Count | Number of subdomain levels |
| Hyphen Count | Number of hyphens in the domain |
| Digit Count | Number of digit characters |
| Contains FIFA Keyword | 1 if `"fifa"` appears in domain |
| Contains Ticket Keyword | 1 if `"ticket"` appears in domain |
| Contains Official Keyword | 1 if `"official"` appears in domain |
| Contains Stream Keyword | 1 if `"stream"` appears in domain |
| Contains Reward Keyword | 1 if `"reward"` appears in domain |
| Typosquat Distance to FIFA | Minimum Levenshtein distance to `"fifa"` |
| WHOIS Age Days | Domain age in days (from creation date) |
| Is Privacy Protected | 1 if registrant data is privacy-protected |
| SSL Status Numerical | 0=Valid, 1=Self-Signed, 2=Expired, 3=Invalid |
| SSL Valid Days Remaining | Days until certificate expiry |
| Visual Similarity Score | 0–100 pHash similarity vs FIFA.com baseline |
| Malware Signature Match | 1 if URLHaus blacklisted |
| Social Media Mentions | Social signal count (heuristic) |
| OSINT Report Count | OSINT flag count |
| Redirect Chain Length | Number of HTTP redirects detected |
| Has Payment Page | 1 if payment-related keywords found in HTML |
| Has Login Form | 1 if password input form detected |

**Confidence Score:** Computed as `1 - std_dev(per_tree_probabilities) × 4`, scaled to [0, 1]. High confidence = trees agree strongly.

---

### Stage 2 — HistGradientBoosting Regressor

**Model:** `HistGradientBoostingRegressor(max_iter=200, learning_rate=0.1)` wrapped in a `sklearn.Pipeline` with `OrdinalEncoder` for categorical columns.

**Purpose:** Produces a precise **risk_score** (0–100 integer) using 27 features including categorical columns like TLD, registrar, SSL issuer, hosting country, and ASN provider.

**Training Script:** [`backend/train_model.py`](backend/train_model.py)

**Training Dataset:** `backend/this_one_balanced.csv` (balanced phishing/benign samples)

**Saved Model:** `backend/app/services/hist_gradient_boosting_pipeline.pkl`

---

### SHAP Explanations

If the `shap` library is installed, a `shap.TreeExplainer` is used on the RF model to produce **top-5 feature attributions** per scan — showing exactly which features contributed most to the prediction and by how much.

Falls back to a hand-rolled `explain_risk()` text-based explanation if SHAP is unavailable.

---

### Threat Classification Logic

| Risk Score | Severity | Action |
|---|---|---|
| ≥ 85 | **Critical** | Block Domain, Notify Analysts, Generate IOC Report |
| 70–84 | **High** | Send Takedown Request |
| 45–69 | **Medium** | Investigate |
| < 45 | **Low** | Monitor Traffic / None |

**Threat Types:** `Illegal Streaming`, `Fake Ticketing`, `Phishing`, `Malware`, `Brand Impersonation`, `Safe`

---

## External APIs & Services Used

### 1. URLHaus (abuse.ch) — Malware Blacklist

> **Used in:** `backend/app/services/threat_service.py`

- **Endpoint:** `https://urlhaus-api.abuse.ch/v1/host/`
- **Method:** `POST` with `{"host": "<domain>"}`
- **No API key required** — free public API
- **Purpose:** Checks if the domain appears in the URLHaus malware/phishing blacklist
- **How it's used:** If `query_status == "ok"`, the domain is flagged as `blacklisted=True`, setting `Malware Signature Match = 1` and `Blacklist Source = "URLHaus"` in the feature vector

---

### 2. RDAP.org — Domain Registration Data

> **Used in:** `backend/app/services/rdap_service.py`

- **Endpoint:** `https://rdap.org/domain/{domain}`
- **Method:** `GET`
- **No API key required** — free public RDAP proxy
- **Purpose:** Primary WHOIS data source — fetches registrar, creation date, expiration date, nameservers, and status
- **Fallback:** If RDAP returns no data, `python-whois` library is used as the secondary WHOIS source

---

### 3. crt.sh — Certificate Transparency Logs

> **Used in:** `backend/scripts/domain_discovery.py`

- **Endpoint:** `https://crt.sh/?q=%25{keyword}%25&output=json`
- **Method:** `GET`
- **No API key required** — free public CT log search
- **Purpose:** Discovers newly issued SSL certificates matching FIFA brand keywords (`fifa`, `fifaworldcup`, `fifaplus`, `worldcup2026`, `fifatickets`). Any domain that received a certificate matching these keywords is a potential phishing candidate
- **Rate limiting:** 1.5-second sleep between queries to respect crt.sh

---

### 4. ipwhois / RDAP — ASN Lookup

> **Used in:** `backend/app/services/asn_service.py`

- **Library:** `ipwhois` (Python package)
- **Method:** `IPWhois(ip).lookup_rdap(depth=1)`
- **No API key required** — queries RDAP/ARIN/RIPE/APNIC registries
- **Purpose:** Resolves the IP address of the scanned domain to its Autonomous System Number (ASN) and provider name (e.g., `AS15169 GOOGLE, US`)
- **How it's used:** `ASN Provider` and `ASN` are fed as features into the HGB model

---

### 5. Playwright (Headless Chromium) — Visual Similarity

> **Used in:** `backend/app/services/visual_service.py`

- **Library:** `playwright` (Python Chromium automation)
- **No external API** — runs locally
- **Purpose:** Launches a headless browser, navigates to `https://{domain}`, takes a PNG screenshot, and computes two signals:
  1. **pHash similarity** — Perceptual hash of the screenshot vs the stored `fifa_baseline.png` (captured from FIFA.com). Hamming distance between hashes → similarity score (0–100)
  2. **Color palette analysis** — Checks if the top 20% of the viewport has a dark navy header (FIFA's signature color), scoring how closely the layout matches FIFA's design
- **Combined score:** `phash × 0.4 + color × 0.6`
- **Fallback:** If Playwright is unavailable or the page times out, returns `0.0` or a keyword-heuristic default (85 if domain contains both `fifa` and `ticket`/`reward`/`stream`)

---

### 6. Python `ssl` / `socket` — SSL Certificate Inspection

> **Used in:** `backend/app/services/ssl_service.py`

- **Library:** Python standard library `ssl` + `socket`
- **No API key required**
- **Purpose:** Opens a TLS connection to port 443, retrieves the certificate, and extracts: issuer, subject, validity dates, days remaining, self-signed status, expired status, TLS version, cipher suite, Subject Alternative Names

---

### 7. dnspython — DNS Resolution

> **Used in:** `backend/app/services/dns_service.py`

- **Library:** `dnspython`
- **No API key required** — queries public DNS resolvers
- **Records fetched:** `A`, `AAAA`, `MX`, `NS`, `TXT`, `CNAME`, `SOA`, `DNSKEY`
- **Purpose:** Resolves IP address, checks SPF/DMARC/DNSSEC configuration — weak email security is a phishing indicator

---

### 8. BeautifulSoup + requests — HTML Analysis

> **Used in:** `backend/app/services/html_service.py`

- **Libraries:** `requests`, `beautifulsoup4`, `lxml`
- **No API key required**
- **Purpose:** Fetches the live HTML of the domain and analyzes: password input forms, payment page keywords in title, iframe count, external script count, JavaScript redirects, meta-refresh tags, redirect detection

---

## Backend API Reference

All endpoints are served at `http://localhost:8000`.

### Authentication

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | `{username, password}` | Register new user, returns JWT token |
| `POST` | `/auth/login` | `{username, password}` | Login, returns JWT token |
| `POST` | `/auth/update-password` | `{username, current_password, new_password}` | Change password |

### Core Scanning

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/scan` | `{domain: string}` | **Main scan pipeline** — full phishing analysis, ML prediction, saves to history |
| `GET` | `/api/scan/history` | — | Returns all past scan results |
| `GET` | `/api/scan/history/{domain}` | — | Returns scan history for a specific domain |

### Individual Intelligence Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/whois/{domain}` | RDAP / python-whois lookup |
| `GET` | `/dns/{domain}` | DNS record lookup (all record types) |
| `GET` | `/ssl/{domain}` | SSL certificate inspection |
| `GET` | `/html/{domain}` | HTML feature extraction |
| `GET` | `/url-features/{domain}` | URL string feature extraction |
| `GET` | `/threat/{domain}` | URLHaus blacklist check |

### Dashboard & Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Aggregate stats (total scans, threat counts, severity breakdown) |
| `GET` | `/api/threats` | Recent threat feed |
| `GET` | `/api/domains` | All discovered domains from the scheduler |
| `GET` | `/api/alerts` | Active alerts |
| `GET` | `/api/campaigns` | Campaign monitoring data |
| `GET` | `/api/recommendations` | Security recommendations |
| `GET` | `/api/flagged` | Flagged domain list |
| `GET` | `/health` | Health check (`{"status": "OK"}`) |

### Scan Response Schema (POST `/api/scan`)

```json
{
  "Domain ID": "DOM12345",
  "Domain Name": "fifatickets-free.xyz",
  "TLD": "xyz",
  "Domain Length": 22,
  "Subdomain Count": 0,
  "Hyphen Count": 1,
  "Digit Count": 0,
  "Contains FIFA Keyword": 1,
  "Contains Ticket Keyword": 1,
  "WHOIS Age Days": 14,
  "Is Privacy Protected": 1,
  "SSL Status": "Self-Signed",
  "SSL Issuer": "Unknown",
  "SSL Valid Days Remaining": 87,
  "IP Address": "103.25.10.12",
  "Hosting Country": "CN",
  "ASN Provider": "CLOUDIE LIMITED",
  "Visual Similarity Score": 78.4,
  "Phishing Probability": 94.2,
  "Risk Score": 91,
  "Confidence Score": 0.887,
  "Threat Type": "Fake Ticketing",
  "Severity": "Critical",
  "Recommended Action": "Block Domain, Notify Analysts, Generate IOC Report",
  "Status": "Pending Block",
  "Explanations": [
    "Impersonates 'FIFA' brand name in domain (+15 Risk)",
    "Contains ticketing keyword in domain (+10 Risk)",
    "Extremely young domain age (14 days) (+25 Risk)",
    "SSL Certificate is self-signed (untrusted) (+20 Risk)",
    "High visual similarity to FIFA portals (78.4%) (+20 Risk)"
  ],
  "SHAP Explanations": [
    {"feature": "WHOIS Age Days", "value": 14, "shap_value": 0.3421},
    {"feature": "Visual Similarity Score", "value": 78.4, "shap_value": 0.2815},
    {"feature": "Contains FIFA Keyword", "value": 1, "shap_value": 0.1932}
  ]
}
```

---

## Environment Variables & Configuration

### Backend

The backend uses a hardcoded config for local development. For production, move secrets to environment variables.

**`backend/app/utils/auth.py`** — JWT Configuration:

```python
SECRET_KEY = "cyberpitch-fifa-super-secret-key-change-me"   # ⚠️ CHANGE THIS IN PRODUCTION
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7   # 7 days
```

> **⚠️ Production Warning:** Replace the hardcoded `SECRET_KEY` with a proper secret loaded from an environment variable:
> ```python
> import os
> SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-dev-key")
> ```

**`backend/app/config.py`** — Cache Configuration:

```python
CACHE_TTL_DAYS = 7   # How long WHOIS/DNS/SSL/ASN results are cached in SQLite
```

**No external API keys are required.** All external services used (URLHaus, RDAP, crt.sh, ipwhois) are free public APIs that do not require authentication.

### Frontend

The frontend connects to `http://localhost:8000` by default. To change the backend URL, update the API base URL in `src/services/api/`.

Create a `.env.local` file in the project root if needed:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.10
- **pip** or **uv**

---

### 1. Clone the repository

```bash
git clone https://github.com/your-org/CyberPitch-FIFA.git
cd CyberPitch-FIFA
```

---

### 2. Set up the Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers (required for visual similarity)
playwright install chromium

# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`.  
Interactive API docs: `http://localhost:8000/docs`

> **Note:** On first startup, the domain discovery scheduler fires immediately and runs every 12 hours thereafter. The SQLite database (`cyberpitch.db`) is auto-created.

---

### 3. (Optional) Retrain the ML Models

The pre-trained models are already included in the repository. To retrain from scratch:

```bash
cd backend
python train_model.py
# Saves: hist_gradient_boosting_pipeline.pkl
```

The Random Forest model auto-retrains on synthetic data if `cyberpitch_classifier.joblib` is missing.

---

### 4. Set up the Frontend

```bash
# In the project root (CyberPitch-FIFA/)
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

### 5. Usage

1. Open `http://localhost:3000`
2. **Sign up** or **Log in** using the auth form
3. Navigate to the **Scan** tab
4. Enter any domain (e.g., `fifa-tickets-2026.xyz`) and click **Scan**
5. View the full risk report with ML predictions, SHAP explanations, and intelligence data
6. Use **Bulk Upload** to scan multiple domains via CSV

---

## Dataset

The training dataset (`this_one_balanced.csv` / `dataset.csv`) contains labeled domain records with the following columns:

- `domain`, `domain_id`, `tld`, `domain_length`, `subdomain_count`, `hyphen_count`, `digit_count`
- `contains_fifa_keyword`, `contains_ticket_keyword`, `contains_official_keyword`, `contains_stream_keyword`, `contains_reward_keyword`
- `typosquat_distance_to_fifa`, `registrar`, `whois_age_days`, `is_privacy_protected`
- `ssl_status`, `ssl_issuer`, `ssl_valid_days_remaining`
- `ip_address`, `hosting_country`, `asn_provider`
- `visual_similarity_score`, `phishing_probability`
- `malware_signature_match`, `blacklist_source`
- `social_media_mentions`, `osint_report_count`
- `redirect_chain_length`, `has_payment_page`, `has_login_form`
- `risk_score` ← **regression target** for HGB
- `threat_type`, `severity`, `status`, `recommended_action`, `detection_timestamp`

The dataset is **balanced** between benign and malicious samples to prevent class imbalance bias.

---

## Security Notes

- **JWT Secret Key:** The default `SECRET_KEY` in `auth.py` is a placeholder. Always replace it with a cryptographically random secret in any non-local deployment.
- **SQLite:** Suitable for development and single-server deployments. Migrate to PostgreSQL for production multi-user setups.
- **CORS:** FastAPI currently allows all origins for local development. Restrict to your frontend domain in production.
- **Rate Limiting:** The crt.sh queries in `domain_discovery.py` include polite 1.5-second delays. The URLHaus API is rate-limit-friendly with 10-second timeouts.
- **Playwright:** Headless browser instances are created and destroyed per scan. Ensure the server has sufficient RAM (≥512 MB per worker) if deploying under load.
- **No PII Stored:** The platform only stores domain names, scan results, and hashed passwords. No user browsing data or personal information is collected.

---

## License

This project was built as part of the **FIFA Legends / CyberPitch** initiative. All rights reserved.

---

*Built with ❤️ by the CyberPitch team — protecting the beautiful game from cyber threats.*
