# 🛡️ CyberPitch: FIFA Scam, Fraud & Piracy Intelligence Platform
> A full-stack threat-intelligence system that detects, scores, and surfaces scam, fraud, and piracy domains riding on the hype around FIFA and major football tournaments.

## 🎯 About the Project

Every major football tournament brings a spike in fake ticket sites, counterfeit merchandise stores, illegal streaming portals, and phishing pages impersonating official FIFA branding. CyberPitch is a domain intelligence and risk-scoring engine built to catch these threats — ingesting a domain or URL, analyzing it across multiple signal types, and returning an explainable risk score with supporting evidence.

This project was built for a national cybersecurity hackathon with the goal of matching the quality and depth of a commercial-grade threat-intel product, wrapped in a dark glassmorphism dashboard for analysts.

## ✨ Features

- **Domain Intelligence Engine:** Collects and analyzes signals — registration/WHOIS data, hosting metadata, content patterns, and brand-impersonation heuristics — for any submitted domain or URL.
- **Explainable Risk Scoring:** Combines individual signals into a single risk score, with a transparent breakdown of what drove it, instead of a black-box number.
- **Threat Dataset:** A synthetic + real-world dataset (`dataset.csv`, ~7,000 rows) of labeled scam/fraud/piracy and benign samples powering the scoring logic.
- **Analyst Dashboard:** A Next.js frontend with a dark glassmorphism aesthetic for reviewing flagged domains, drilling into risk breakdowns, and triaging threats.
- **API-First Backend:** A FastAPI service exposing the intelligence and scoring engine independently of the frontend, so it can be integrated into other tools.

## 🧠 Technical Implementation

- **Architecture:** A decoupled system — a FastAPI backend handles domain analysis and scoring, while a Next.js/TypeScript frontend consumes it via API calls and renders the dashboard.
- **Risk Scoring Logic:** Signals are weighted and combined into a composite score used to bucket domains by threat severity, rather than a single pass/fail flag.
- **Dataset-Driven Detection:** The ~7,000-row labeled dataset blends synthetic scam patterns with real-world examples, forming the foundation for both rule-based scoring and future ML-based scoring.
- **Dark Glassmorphism UI:** The frontend prioritizes a polished, enterprise-security-product feel — translucent panels, layered depth, and a dark color palette — over a generic dashboard template.

## 📁 Project Structure

```
CyberPitch-FIFA/
├── backend/          # FastAPI service — domain intelligence & risk scoring engine
├── dataset/          # Supporting dataset assets / processing scripts
├── public/           # Static assets for the Next.js frontend
├── src/              # Next.js application source (pages/components/UI)
├── dataset.csv        # ~7,000-row labeled threat/benign dataset
├── next.config.ts      # Next.js configuration
├── package.json         # Frontend dependencies & scripts
├── eslint.config.mjs    # Lint configuration
├── tsconfig.json        # TypeScript configuration
└── postcss.config.mjs   # PostCSS/Tailwind configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0 or higher)
- Python 3.10+

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Pavankumarreddy999/CyberPitch-FIFA.git
   ```
2. Navigate into the directory
   ```bash
   cd CyberPitch-FIFA
   ```
3. Install frontend dependencies
   ```bash
   npm install
   ```
4. Start the frontend dev server
   ```bash
   npm run dev
   ```
5. In a separate terminal, set up the backend
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
   > Adjust the entrypoint (`main:app`) to match the actual FastAPI module name in `backend/`.

Open [http://localhost:3000](http://localhost:3000) in your browser once both services are running.

## 🕹️ How to Use the Platform

1. **Submit a domain or URL**: Enter the target into the dashboard's intelligence lookup.
2. **Review the risk score**: See the composite score and severity bucket returned by the engine.
3. **Inspect the signal breakdown**: Drill into the individual signals (registration, hosting, content, brand-impersonation heuristics) that contributed to the score.
4. **Triage flagged domains**: Use the dashboard to track and review domains flagged as likely scam, fraud, or piracy sites.

## 🗺️ Roadmap

- [ ] Threat intelligence API integrations (external feeds for domain reputation, blocklists, etc.)
- [ ] Visual similarity engine (detect look-alike/spoofed brand pages)
- [ ] ML ensemble model for improved risk scoring accuracy
- [ ] Production deployment infrastructure

## ⚠️ Disclaimer

This project was built for a cybersecurity hackathon for research and educational purposes. It is not an official FIFA product and is not affiliated with FIFA or any football governing body.