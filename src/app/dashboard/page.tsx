'use client';

import React, { useState, useMemo, useCallback } from "react";
import Papa from "papaparse";
import {
  Shield, AlertTriangle, Globe2, Ticket, Radio, Users, Bell, Settings,
  LayoutDashboard, TrendingUp, TrendingDown, Search, Upload, ChevronDown,
  ChevronRight, ChevronLeft, ExternalLink, Lock, Unlock, ShieldAlert, ShieldCheck,
  CircleDot, X, Info, Menu, RefreshCw, Download, HelpCircle, LogOut, Sun, Moon, Eye, Filter, Calendar
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, LineChart, Line
} from "recharts";

/* ---------------------------------------------------------------
   DESIGN TOKENS
   Brief specifies deep blue / gold / dark cybersecurity theme —
   honored exactly. Distinctiveness comes from type pairing
   (Space Grotesk display + JetBrains Mono for data), the hex-grid
   radar-scan signature motif, and dense analyst-console layout.
------------------------------------------------------------------*/
const TOKENS = `
  :root {
    --void: #030812;
    --panel: rgba(8, 17, 36, 0.65);
    --panel-raised: rgba(15, 32, 67, 0.8);
    --panel-hair: rgba(0, 210, 255, 0.15);
    --border: rgba(0, 194, 255, 0.12);
    --border-strong: rgba(0, 194, 255, 0.28);
    --gold: #FFD700;
    --gold-dim: #d4b200;
    --green: #00ffd2;
    --red: #ff2a5f;
    --amber: #ff9f1a;
    --blue-neon: #00d2ff;
    --blue-deep: #0066ff;
    --text: #f0f5fc;
    --text-dim: #a5b7d0;
    --text-faint: #677b96;
    --mono: 'JetBrains Mono', ui-monospace, monospace;
    --grotesk: 'Space Grotesk', sans-serif;
    --body: 'Inter', sans-serif;
    --shadow-neon: 0 0 15px rgba(0, 210, 255, 0.25);
  }
  
  .stg-root {
    background: 
      radial-gradient(circle at 10% 10%, rgba(0, 102, 255, 0.12), transparent 45%),
      radial-gradient(circle at 90% 80%, rgba(120, 0, 255, 0.08), transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(0, 210, 255, 0.03), transparent 60%),
      var(--void);
    color: var(--text);
    font-family: var(--body);
    min-height: 100vh;
    display: flex;
    position: relative;
    overflow-x: hidden;
  }
  
  .hexbg {
    position: absolute; 
    inset: 0; 
    pointer-events: none; 
    opacity: 0.18;
    background-image: 
      linear-gradient(rgba(0, 210, 255, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 210, 255, 0.08) 1px, transparent 1px);
    background-size: 30px 30px;
    mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 80%);
  }

  .font-display { 
    font-family: var(--grotesk); 
    letter-spacing: -0.02em; 
  }
  
  .font-mono { 
    font-family: var(--mono); 
  }

  .sidebar {
    width: 245px; 
    flex-shrink: 0; 
    background: rgba(4, 9, 20, 0.85);
    backdrop-filter: blur(20px);
    border-right: 1px solid var(--border-strong); 
    display: flex; 
    flex-direction: column;
    position: relative; 
    z-index: 2;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .sidebar.collapsed {
    width: 68px;
  }
  
  .brand { 
    padding: 24px 22px; 
    border-bottom: 1px solid var(--border); 
  }
  
  .brand-mark {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--blue-neon), var(--blue-deep));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(0, 210, 255, 0.45);
  }
  
  .navgroup { 
    padding: 16px 12px; 
  }
  
  .navlabel { 
    font-size: 10px; 
    font-weight: 600;
    letter-spacing: 0.16em; 
    color: var(--text-faint); 
    text-transform: uppercase; 
    padding: 12px 12px 8px; 
  }
  
  .navitem {
    display: flex; 
    align-items: center; 
    gap: 12px; 
    padding: 10px 14px; 
    border-radius: 10px;
    color: var(--text-dim); 
    font-size: 13.5px; 
    cursor: pointer; 
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent; 
    margin-bottom: 4px;
  }
  
  .navitem:hover { 
    background: rgba(0, 210, 255, 0.08); 
    color: var(--text);
    border-color: rgba(0, 210, 255, 0.15);
    box-shadow: inset 0 0 10px rgba(0, 210, 255, 0.05);
  }
  
  .navitem.active { 
    background: linear-gradient(90deg, rgba(0, 102, 255, 0.2), rgba(0, 210, 255, 0.05)); 
    color: var(--blue-neon); 
    border-color: var(--border-strong); 
    box-shadow: var(--shadow-neon);
  }
  
  .navitem.disabled { 
    opacity: 0.35; 
    cursor: default; 
  }
  
  .navitem.disabled:hover { 
    background: transparent; 
    color: var(--text-dim);
    border-color: transparent;
    box-shadow: none;
  }
  
  .soon-badge {
    margin-left: auto; 
    font-size: 8px; 
    font-weight: 700;
    padding: 2px 6px; 
    border-radius: 6px;
    background: rgba(0, 210, 255, 0.1); 
    color: var(--blue-neon); 
    letter-spacing: 0.08em;
    border: 1px solid rgba(0, 210, 255, 0.2);
  }

  .main { 
    flex: 1; 
    position: relative; 
    z-index: 2; 
    min-width: 0; 
  }
  
  .topbar {
    display: flex; 
    align-items: center; 
    justify-content: space-between;
    padding: 18px 32px; 
    border-bottom: 1px solid var(--border);
    background: rgba(4, 9, 20, 0.5); 
    backdrop-filter: blur(16px);
    position: sticky; 
    top: 0; 
    z-index: 5;
  }
  
  .content { 
    padding: 32px; 
  }

  .pulse-dot { 
    width: 8px;
    height: 8px;
    border-radius: 50%; 
    background: var(--green); 
    position: relative; 
  }
  
  .pulse-dot::after {
    content: ''; 
    position: absolute; 
    inset: -4px; 
    border-radius: 50%; 
    border: 1px solid var(--green);
    animation: pulse 2.2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
  }
  
  @keyframes pulse { 
    0% { transform: scale(0.7); opacity: 0.9; } 
    100% { transform: scale(2.4); opacity: 0; } 
  }

  .status-pill {
    display: flex; 
    align-items: center; 
    gap: 8px; 
    font-size: 11.5px; 
    color: var(--blue-neon); 
    font-weight: 500;
    font-family: var(--mono); 
    padding: 6px 14px; 
    border: 1px solid var(--border-strong); 
    border-radius: 20px;
    background: rgba(0, 210, 255, 0.05);
    box-shadow: 0 0 10px rgba(0, 210, 255, 0.1);
  }

  .btn {
    display: flex; 
    align-items: center; 
    gap: 8px; 
    font-size: 13px; 
    font-weight: 600;
    padding: 9px 16px; 
    border-radius: 8px; 
    cursor: pointer; 
    border: 1px solid var(--border-strong);
    background: rgba(15, 32, 67, 0.5); 
    color: var(--text); 
    transition: all 0.2s ease;
  }
  
  .btn:hover { 
    border-color: var(--blue-neon); 
    color: var(--blue-neon);
    box-shadow: 0 0 12px rgba(0, 210, 255, 0.2);
  }
  
  .btn-gold { 
    background: linear-gradient(135deg, var(--blue-neon), var(--blue-deep)); 
    color: #030812; 
    border: none; 
    font-weight: 700;
    box-shadow: 0 4px 15px rgba(0, 210, 255, 0.3);
  }
  
  .btn-gold:hover { 
    filter: brightness(1.15); 
    color: #030812;
    box-shadow: 0 4px 20px rgba(0, 210, 255, 0.55);
  }

  .card {
    background: var(--panel); 
    backdrop-filter: blur(14px);
    border: 1px solid var(--border); 
    border-radius: 16px;
    position: relative; 
    overflow: hidden;
    transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  .card:hover {
    border-color: rgba(0, 210, 255, 0.25);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0, 210, 255, 0.08);
  }
  
  .scanline {
    position: absolute; 
    top: 0; 
    left: -30%; 
    width: 30%; 
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--blue-neon), transparent);
    animation: sweep 4s linear infinite;
  }
  
  @keyframes sweep { 
    0% { left: -30%; } 
    100% { left: 110%; } 
  }

  .stat-grid { 
    display: grid; 
    grid-template-columns: repeat(5, 1fr); 
    gap: 16px; 
    margin-bottom: 24px; 
  }
  
  @media (max-width: 1200px) { 
    .stat-grid { grid-template-columns: repeat(3, 1fr); } 
  }
  @media (max-width: 800px) { 
    .stat-grid { grid-template-columns: repeat(2, 1fr); } 
  }
  
  .stat-card { 
    padding: 22px 20px; 
  }
  
  .stat-icon { 
    width: 38px;
    height: 38px;
    border-radius: 10px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    margin-bottom: 16px; 
  }
  
  .stat-value { 
    font-family: var(--mono); 
    font-size: 28px; 
    font-weight: 700; 
    line-height: 1;
    background: linear-gradient(135deg, var(--text), var(--text-dim));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .stat-label { 
    font-size: 12px; 
    color: var(--text-dim); 
    margin-top: 8px; 
    font-weight: 500;
  }
  
  .trend { 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    font-size: 11px; 
    font-weight: 600;
    font-family: var(--mono); 
    margin-top: 12px; 
  }

  .section-title { 
    font-family: var(--grotesk); 
    font-size: 16px; 
    font-weight: 600; 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    color: var(--text);
  }
  
  .section-sub { 
    font-size: 12px; 
    color: var(--text-dim); 
    margin-top: 4px; 
  }

  .badge { 
    font-size: 10px; 
    font-weight: 600;
    font-family: var(--mono); 
    padding: 3px 10px; 
    border-radius: 6px; 
    display: inline-flex; 
    align-items: center; 
    gap: 5px; 
    letter-spacing: 0.02em; 
    white-space: nowrap; 
  }
  
  .badge-high { 
    background: rgba(255, 42, 95, 0.12); 
    color: var(--red); 
    border: 1px solid rgba(255, 42, 95, 0.35); 
    box-shadow: 0 0 10px rgba(255, 42, 95, 0.1);
  }
  
  .badge-medium { 
    background: rgba(255, 159, 26, 0.12); 
    color: var(--amber); 
    border: 1px solid rgba(255, 159, 26, 0.35); 
    box-shadow: 0 0 10px rgba(255, 159, 26, 0.1);
  }
  
  .badge-low { 
    background: rgba(0, 255, 210, 0.1); 
    color: var(--green); 
    border: 1px solid rgba(0, 255, 210, 0.3); 
    box-shadow: 0 0 10px rgba(0, 255, 210, 0.1);
  }
  
  .badge-neutral { 
    background: rgba(0, 210, 255, 0.05); 
    color: var(--blue-neon); 
    border: 1px solid rgba(0, 210, 255, 0.25); 
  }

  table { 
    width: 100%; 
    border-collapse: collapse; 
    font-size: 13px; 
  }
  
  thead th {
    text-align: left; 
    font-size: 10.5px; 
    letter-spacing: 0.1em; 
    text-transform: uppercase;
    color: var(--text-faint); 
    font-weight: 600; 
    padding: 14px 18px; 
    border-bottom: 1px solid var(--border-strong);
    position: sticky; 
    top: 0; 
    background: rgba(6, 15, 34, 0.95);
    backdrop-filter: blur(10px);
  }
  
  tbody td { 
    padding: 14px 18px; 
    border-bottom: 1px solid var(--border); 
    vertical-align: middle; 
  }
  
  tbody tr { 
    cursor: pointer; 
    transition: all 0.2s ease; 
  }
  
  tbody tr:hover { 
    background: rgba(0, 210, 255, 0.04); 
  }
  
  .domain-name { 
    font-family: var(--mono); 
    font-size: 13px; 
    color: var(--text); 
    font-weight: 500;
  }

  input.search {
    background: rgba(4, 9, 20, 0.6); 
    border: 1px solid var(--border-strong); 
    border-radius: 10px;
    padding: 10px 14px 10px 38px; 
    font-size: 13.5px; 
    color: var(--text); 
    width: 280px; 
    outline: none;
    transition: all 0.25s ease;
  }
  
  input.search:focus { 
    border-color: var(--blue-neon); 
    box-shadow: var(--shadow-neon);
    background: rgba(4, 9, 20, 0.85);
  }
  
  select.filter {
    background: rgba(4, 9, 20, 0.6); 
    border: 1px solid var(--border-strong); 
    border-radius: 10px;
    padding: 9px 14px; 
    font-size: 13px; 
    color: var(--text-dim); 
    outline: none; 
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  select.filter:focus, select.filter:hover {
    border-color: var(--blue-neon);
    color: var(--text);
  }

  .risk-bar-track { 
    width: 70px; 
    height: 6px; 
    border-radius: 4px; 
    background: rgba(0, 210, 255, 0.08); 
    overflow: hidden; 
  }
  
  .risk-bar-fill { 
    height: 100%; 
    border-radius: 4px; 
    box-shadow: 0 0 8px rgba(0, 210, 255, 0.5);
  }

  .flag-chip { 
    font-size: 10.5px; 
    padding: 4px 10px; 
    border-radius: 8px; 
    background: rgba(0, 210, 255, 0.05); 
    border: 1px solid rgba(0, 210, 255, 0.15); 
    color: var(--text-dim); 
    transition: all 0.2s ease;
  }
  
  .flag-chip:hover {
    border-color: var(--blue-neon);
    color: var(--text);
    background: rgba(0, 210, 255, 0.1);
  }

  .empty-state { 
    text-align: center; 
    padding: 60px 20px; 
    color: var(--text-dim); 
  }

  ::-webkit-scrollbar { 
    width: 8px; 
    height: 8px; 
  }
  
  ::-webkit-scrollbar-thumb { 
    background: rgba(0, 210, 255, 0.2); 
    border-radius: 8px; 
    border: 2px solid var(--void);
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 210, 255, 0.4);
  }
  
  ::-webkit-scrollbar-track { 
    background: transparent; 
  }
`;

/* ---------------------------------------------------------------
   MOCK DATA — shaped to mirror a real FIFA threat-intel schema
   (domain / WHOIS / SSL / risk / ticketing fields). Swap this out
   instantly with the CSV upload button in the top bar.
------------------------------------------------------------------*/
const THREAT_TYPES = ["Ticket Scam", "Phishing", "Malware", "Streaming Piracy"];
const COUNTRIES = ["Russia", "Nigeria", "Vietnam", "Brazil", "India", "Ukraine", "Indonesia", "China", "Philippines", "USA"];
const REGISTRARS = ["NameCheap Inc.", "GoDaddy.com LLC", "PDR Ltd.", "Alibaba Cloud", "REG.RU", "Dynadot LLC"];
const SSL_STATES = ["Invalid", "Expired", "None", "Valid"];
const STATUSES = ["Active", "Under Review", "Blocked"];
const RED_FLAG_POOL = [
  "Price 60-80% below official", "Domain registered <30 days ago", "No SSL / self-signed cert",
  "Spoofed FIFA branding", "Offshore hosting", "No refund policy listed",
  "Unofficial payment gateway", "No verifiable physical address", "WHOIS privacy shield active"
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateMockData(count = 180) {
  const rnd = seededRandom(42);
  const rows = [];
  for (let i = 0; i < count; i++) {
    const threatType = THREAT_TYPES[Math.floor(rnd() * THREAT_TYPES.length)];
    const riskScore = Math.round(rnd() * 100);
    const ageDays = Math.floor(rnd() * 900) + 1;
    const isTicket = threatType === "Ticket Scam";
    const officialPrice = [80, 120, 250, 400][Math.floor(rnd() * 4)];
    const flagCount = 2 + Math.floor(rnd() * 4);
    const flags = [...RED_FLAG_POOL].sort(() => rnd() - 0.5).slice(0, flagCount);
    rows.push({
      id: `TH-${1000 + i}`,
      domain: `fifa-${["worldcup", "tickets2026", "official", "matchday", "livepass", "fanzone", "goldpass"][Math.floor(rnd() * 7)]}-${Math.floor(rnd() * 999)}.${["com", "net", "info", "xyz", "ru", "top"][Math.floor(rnd() * 6)]}`,
      threatType,
      riskScore,
      riskLevel: riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low",
      registrationDate: `2025-${String(Math.floor(rnd() * 12) + 1).padStart(2, "0")}-${String(Math.floor(rnd() * 28) + 1).padStart(2, "0")}`,
      ageDays,
      registrar: REGISTRARS[Math.floor(rnd() * REGISTRARS.length)],
      country: COUNTRIES[Math.floor(rnd() * COUNTRIES.length)],
      sslStatus: SSL_STATES[Math.floor(rnd() * SSL_STATES.length)],
      similarityScore: Math.round(40 + rnd() * 60),
      detectedDate: `2026-0${Math.floor(rnd() * 6) + 1}-${String(Math.floor(rnd() * 28) + 1).padStart(2, "0")}`,
      status: STATUSES[Math.floor(rnd() * STATUSES.length)],
      estimatedLoss: isTicket ? Math.round(rnd() * 45000) : Math.round(rnd() * 8000),
      affectedUsers: isTicket ? Math.floor(rnd() * 900) : Math.floor(rnd() * 200),
      officialPrice: isTicket ? officialPrice : null,
      scamPrice: isTicket ? Math.round(officialPrice * (0.15 + rnd() * 0.35)) : null,
      redFlags: flags,
      source: rnd() > 0.4 ? "Synthetic" : "Real (FBI/IC3-linked)",
    });
  }
  return rows;
}

const CSV_FIELD_MAP = {
  domain: ["domain", "url", "domain_name"],
  threatType: ["threat_type", "threattype", "category", "type"],
  riskScore: ["risk_score", "riskscore", "score"],
  registrationDate: ["registration_date", "reg_date", "created_date"],
  ageDays: ["age_days", "domain_age", "age"],
  registrar: ["registrar", "whois_registrar"],
  country: ["country", "whois_country", "registrant_country"],
  sslStatus: ["ssl_status", "ssl", "certificate_status"],
  similarityScore: ["similarity_score", "visual_similarity", "similarity"],
  detectedDate: ["detected_date", "detection_date", "date_detected"],
  status: ["status", "state"],
  estimatedLoss: ["estimated_loss", "financial_loss", "loss_usd"],
  affectedUsers: ["affected_users", "victims", "num_victims"],
  source: ["source", "data_source"],
};

function findKey(row: Record<string, string>, aliases: string[]): string | null {
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const match = keys.find((k) => k.toLowerCase().replace(/\s+/g, "_") === alias);
    if (match) return match;
  }
  return null;
}

function normalizeCSVRow(row: Record<string, string>, idx: number) {
  const get = (field: keyof typeof CSV_FIELD_MAP, fallback: string): string => {
    const key = findKey(row, CSV_FIELD_MAP[field]);
    return (key && row[key] !== undefined && row[key] !== "" ? row[key] : fallback) as string;
  };
  const riskScoreRaw = get("riskScore", String(Math.round(Math.random() * 100)));
  const riskScore = Math.min(100, Math.max(0, Number(riskScoreRaw) || 0));
  const threatType = get("threatType", "Phishing");
  return {
    id: `CSV-${1000 + idx}`,
    domain: get("domain", "unknown-domain.com"),
    threatType: THREAT_TYPES.includes(threatType) ? threatType : threatType || "Phishing",
    riskScore,
    riskLevel: riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low",
    registrationDate: get("registrationDate", "—"),
    ageDays: Number(get("ageDays", "0")) || 0,
    registrar: get("registrar", "Unknown"),
    country: get("country", "Unknown"),
    sslStatus: get("sslStatus", "Unknown"),
    similarityScore: Number(get("similarityScore", "0")) || 0,
    detectedDate: get("detectedDate", "—"),
    status: get("status", "Active"),
    estimatedLoss: Number(get("estimatedLoss", "0")) || 0,
    affectedUsers: Number(get("affectedUsers", "0")) || 0,
    officialPrice: null,
    scamPrice: null,
    redFlags: [],
    source: get("source", "Uploaded CSV"),
  };
}

interface ThreatRecord {
  id: string;
  domain: string;
  threatType: string;
  riskScore: number;
  riskLevel: string;
  registrationDate: string;
  ageDays: number;
  registrar: string;
  country: string;
  sslStatus: string;
  similarityScore: number;
  detectedDate: string;
  status: string;
  estimatedLoss: number;
  affectedUsers: number;
  officialPrice: number | null;
  scamPrice: number | null;
  redFlags: string[];
  source: string;
}

const RISK_COLOR: Record<string, string> = { High: "var(--red)", Medium: "var(--amber)", Low: "var(--green)" };

function riskBadge(level: string) {
  const cls = level === "High" ? "badge-high" : level === "Medium" ? "badge-medium" : "badge-low";
  return <span className={`badge ${cls}`}>{level}</span>;
}

function sslBadge(status: string) {
  if (status === "Valid") return <span className="badge badge-low"><Lock size={10} />Valid</span>;
  if (status === "Unknown") return <span className="badge badge-neutral">Unknown</span>;
  return <span className="badge badge-high"><Unlock size={10} />{status}</span>;
}

/* ---------------------------------------------------------------
   SIDEBAR
------------------------------------------------------------------*/
/* ---------------------------------------------------------------
   SIDEBAR
------------------------------------------------------------------*/
interface SidebarProps {
  page: string;
  setPage: (p: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

function Sidebar({ page, setPage, collapsed, setCollapsed }: SidebarProps) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, enabled: true },
    { key: "domains", label: "Domain Intelligence", icon: Globe2, enabled: true, subItems: ["Search & Filters", "Active Blocks", "WHOIS Records"] },
    { key: "tickets", label: "Ticketing Fraud", icon: Ticket, enabled: true, subItems: ["Pricing Scams", "Est. Losses"] },
    { key: "social", label: "Social & OSINT", icon: Users, enabled: false },
    { key: "streaming", label: "Streaming Piracy", icon: Radio, enabled: false },
    { key: "alerts", label: "Alerts", icon: Bell, enabled: false },
    { key: "settings", label: "Settings", icon: Settings, enabled: false },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="brand" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10 }}>
          <div className="brand-mark">
            <Shield size={17} color="#030812" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div>
              <div className="font-display" style={{ fontSize: 14.5, fontWeight: 700, background: "linear-gradient(135deg, var(--gold), #ff9f1a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SENTINEL/7</div>
              <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em" }}>FIFA THREAT INTEL</div>
            </div>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", display: "flex", alignItems: "center" }}
          title={collapsed ? "Expand menu" : "Collapse menu"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="navgroup" style={{ padding: "16px 8px" }}>
        <div className="navlabel" style={{ display: collapsed ? "none" : "block" }}>Monitor</div>
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = page === it.key;
          return (
            <React.Fragment key={it.key}>
              <div
                className={`navitem ${isActive ? "active" : ""} ${!it.enabled ? "disabled" : ""}`}
                onClick={() => it.enabled && setPage(it.key)}
                style={{ padding: collapsed ? "10px 0" : "10px 14px", justifyContent: collapsed ? "center" : "flex-start" }}
              >
                <Icon size={16} />
                {!collapsed && <span>{it.label}</span>}
                {!it.enabled && !collapsed && <span className="soon-badge">SOON</span>}
              </div>
              
              {/* Indented Submenus */}
              {!collapsed && isActive && it.subItems && (
                <div style={{ paddingLeft: 28, marginBottom: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  {it.subItems.map((sub, sIdx) => (
                    <div 
                      key={sIdx} 
                      style={{ fontSize: 11.5, color: "var(--text-dim)", cursor: "pointer", transition: "color 0.2s" }}
                      onClick={(e) => { e.stopPropagation(); alert(`Navigating to ${sub}`); }}
                      className="sub-menu-item"
                    >
                      {sub}
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* User Profile section at the bottom */}
      <div style={{ marginTop: "auto", padding: collapsed ? "12px 6px" : "12px 16px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
          <div style={{ 
            width: 32, 
            height: 32, 
            borderRadius: "50%", 
            background: "linear-gradient(135deg, var(--blue-neon), var(--blue-deep))", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#030812", 
            fontWeight: "bold", 
            fontSize: 12 
          }}>
            AK
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Abhinav Kumar</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>Analyst Level 3</div>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={() => alert("Settings Panel")}
              style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 2 }}
            >
              <Settings size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   TOPBAR
------------------------------------------------------------------*/
interface TopBarProps {
  title: string;
  subtitle: string;
  onUpload: (f: File) => void;
  dataSource: string;
  onScan: () => void;
  onExport: () => void;
}

function TopBar({ title, subtitle, onUpload, dataSource, onScan, onExport }: TopBarProps) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [themeDark, setThemeDark] = useState(true);

  const notifications = [
    { type: "Critical", text: "Fake ticket domain registered: fifa2026-store.xyz", time: "2m ago" },
    { type: "Warning", text: "High traffic load detected on pipeline #4", time: "15m ago" },
    { type: "Info", text: "Threat database successfully refreshed", time: "1h ago" }
  ];

  return (
    <div className="topbar">
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="font-display" style={{ fontSize: 19, fontWeight: 700 }}>{title}</div>
          <span className="pulse-dot" title="Live refresh active" />
          <span style={{ fontSize: 10, color: "var(--green)", fontFamily: "var(--mono)" }}>AUTO-REFRESH: 10S</span>
        </div>
        <div className="section-sub">{subtitle}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="status-pill" style={{ fontSize: 11 }}>
          <Info size={12} />
          {dataSource}
        </div>
        
        {/* Last updated timestamp */}
        <span style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--mono)" }}>Updated: Just now</span>

        {/* Quick action buttons */}
        <button className="btn" onClick={onScan}>
          <RefreshCw size={13} />
          Scan Now
        </button>

        <button className="btn" onClick={onExport}>
          <Download size={13} />
          Export CSV
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
        />
        <button className="btn btn-gold" onClick={() => fileRef.current?.click()}>
          <Upload size={14} /> Upload dataset (.csv)
        </button>

        <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />

        {/* Theme Toggle simulator */}
        <button 
          onClick={() => { setThemeDark(!themeDark); alert("Light/Dark Mode is simulated for visual demo!"); }}
          style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}
          title="Toggle Light/Dark Theme"
        >
          {themeDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Help button */}
        <button 
          onClick={() => alert("Sentinel/7 User Guide: Upload a threat-intel CSV dataset, filter domains using filters, or monitor fraudulent ticket price drops.")}
          style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}
          title="Help & Guides"
        >
          <HelpCircle size={15} />
        </button>

        {/* Notification Bell Dropdown */}
        <div style={{ position: "relative" }}>
          <button 
            onClick={() => { setShowBellDropdown(!showBellDropdown); setShowProfileDropdown(false); }}
            style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", position: "relative" }}
          >
            <Bell size={15} />
            <span style={{ 
              position: "absolute", 
              top: -4, 
              right: -4, 
              width: 12, 
              height: 12, 
              borderRadius: "50%", 
              background: "var(--red)", 
              color: "#fff", 
              fontSize: 8, 
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>3</span>
          </button>
          
          {showBellDropdown && (
            <div style={{ 
              position: "absolute", 
              top: 30, 
              right: -10, 
              width: 320, 
              background: "rgba(10, 25, 50, 0.95)", 
              border: "1.5px solid var(--blue-neon)", 
              borderRadius: 12, 
              padding: 12, 
              zIndex: 10,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: 6, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                <span>NOTIFICATIONS</span>
                <span style={{ color: "var(--blue-neon)", cursor: "pointer" }} onClick={() => setShowBellDropdown(false)}>Clear all</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {notifications.map((n, idx) => (
                  <div key={idx} style={{ fontSize: 11.5, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, color: n.type === "Critical" ? "var(--red)" : n.type === "Warning" ? "var(--amber)" : "var(--green)" }}>{n.type}</span>
                      <span style={{ color: "var(--text-faint)" }}>{n.time}</span>
                    </div>
                    <div style={{ color: "var(--text-dim)" }}>{n.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown avatar trigger */}
        <div style={{ position: "relative" }}>
          <div 
            onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowBellDropdown(false); }}
            style={{ 
              width: 28, 
              height: 28, 
              borderRadius: "50%", 
              background: "linear-gradient(135deg, var(--gold), var(--gold-dim))", 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: 11,
              color: "#030812"
            }}
          >
            AK
          </div>

          {showProfileDropdown && (
            <div style={{ 
              position: "absolute", 
              top: 32, 
              right: 0, 
              width: 160, 
              background: "rgba(10, 25, 50, 0.95)", 
              border: "1px solid var(--blue-neon)", 
              borderRadius: 8, 
              padding: 8, 
              zIndex: 10,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
            }}>
              <div style={{ fontSize: 12, padding: "6px 8px", cursor: "pointer", color: "var(--text)", borderBottom: "1px solid var(--border)" }} onClick={() => alert("Profile Settings")}>My Profile</div>
              <div style={{ fontSize: 12, padding: "6px 8px", cursor: "pointer", color: "var(--text)", borderBottom: "1px solid var(--border)" }} onClick={() => alert("Security Log")}>Security Log</div>
              <div style={{ fontSize: 12, padding: "6px 8px", cursor: "pointer", color: "var(--red)" }} onClick={() => alert("Logged Out")}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <LogOut size={12} /> Log Out
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   DASHBOARD PAGE
------------------------------------------------------------------*/
function Dashboard({ data }: { data: ThreatRecord[] }) {
  const stats = useMemo(() => {
    const byType = (t: string) => data.filter((d) => d.threatType === t).length;
    return {
      total: data.length,
      tickets: byType("Ticket Scam"),
      phishing: byType("Phishing"),
      streaming: byType("Streaming Piracy"),
      malware: byType("Malware"),
    };
  }, [data]);

  const avgRisk = useMemo(
    () => (data.length ? Math.round(data.reduce((a, d) => a + d.riskScore, 0) / data.length) : 0),
    [data]
  );

  const riskDist = useMemo(() => {
    const counts: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    data.forEach((d) => (counts[d.riskLevel] = (counts[d.riskLevel] || 0) + 1));
    return [
      { name: "High", value: counts.High, color: "#ff2a5f" },
      { name: "Medium", value: counts.Medium, color: "#ff9f1a" },
      { name: "Low", value: counts.Low, color: "#00ffd2" },
    ];
  }, [data]);

  const countryDist = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((d) => (counts[d.country] = (counts[d.country] || 0) + 1));
    return Object.entries(counts)
      .map(([country, count]) => ({ country, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [data]);

  const timelineData = useMemo(() => {
    const dates = ["06-29", "06-30", "07-01", "07-02", "07-03", "07-04", "07-05", "07-06"];
    return dates.map((d, idx) => ({
      date: d,
      "Threat Alerts": data.filter(item => item.detectedDate?.endsWith(d)).length || (12 + (idx * 3) % 7)
    }));
  }, [data]);

  const recent = useMemo(
    () => [...data].sort((a, b) => (b.detectedDate || "").localeCompare(a.detectedDate || "")).slice(0, 8),
    [data]
  );

  // Sparkline SVG path coordinates for stat cards
  const sparklines = [
    "M0,18 Q15,4 30,14 T60,2 T90,16 L100,8",
    "M0,15 Q15,22 30,5 T60,19 T90,2 L100,12",
    "M0,8 Q15,18 30,3 T60,12 T90,18 L100,5",
    "M0,20 Q15,8 30,16 T60,4 T90,22 L100,15",
    "M0,5 Q15,15 30,8 T60,22 T90,4 L100,18"
  ];

  const statCards = [
    { label: "Total threats detected", value: stats.total, icon: ShieldAlert, color: "var(--gold)", trend: "+12.4%", up: true, spark: sparklines[0] },
    { label: "Fake ticketing portals", value: stats.tickets, icon: Ticket, color: "var(--red)", trend: "+8.1%", up: true, spark: sparklines[1] },
    { label: "Phishing campaigns", value: stats.phishing, icon: AlertTriangle, color: "var(--amber)", trend: "+3.6%", up: true, spark: sparklines[2] },
    { label: "Illegal streaming sites", value: stats.streaming, icon: Radio, color: "#4fa3ff", trend: "-2.0%", up: false, spark: sparklines[3] },
    { label: "Malware / impersonation", value: stats.malware, icon: ShieldCheck, color: "var(--green)", trend: "+5.9%", up: true, spark: sparklines[4] },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 5-Column Grid */}
      <div className="stat-grid">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div className="card stat-card" key={i} style={{ transition: "transform 0.2s", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
              <div className="scanline" />
              <div className="stat-icon" style={{ background: `${s.color}18`, border: `1.5px solid ${s.color}40` }}>
                <Icon size={16} color={s.color} />
              </div>
              <div className="stat-value" style={{ fontSize: 26, fontWeight: 800 }}>{s.value.toLocaleString()}</div>
              <div className="stat-label">{s.label}</div>
              
              {/* Mini Sparkline Chart */}
              <div style={{ height: 26, marginTop: 10, marginBottom: 8 }}>
                <svg viewBox="0 0 100 25" width="100%" height="100%" preserveAspectRatio="none">
                  <path d={s.spark} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" style={{ filter: `drop-shadow(0 2px 4px ${s.color}40)` }} />
                </svg>
              </div>

              <div className="trend" style={{ color: s.up ? "var(--red)" : "var(--green)", fontSize: 11 }}>
                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.trend} vs last week
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title"><ShieldAlert size={15} color="var(--gold)" /> Average risk score</div>
          <div className="section-sub">Across all tracked domains &amp; campaigns</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 0 6px" }}>
            <RiskGauge value={avgRisk} />
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="section-title"><CircleDot size={15} color="var(--gold)" /> Risk level distribution</div>
          <div className="section-sub">{data.length} records analyzed</div>
          <div style={{ height: 170 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={66} paddingAngle={4}>
                  {riskDist.map((entry, idx) => <Cell key={idx} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(8, 17, 36, 0.95)", border: "1.5px solid var(--blue-neon)", borderRadius: 10, fontSize: 12, boxShadow: "0 0 15px rgba(0, 210, 255, 0.2)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: -6 }}>
            {riskDist.map((r) => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-dim)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color }} /> {r.name} ({r.value})
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="section-title"><Globe2 size={15} color="var(--gold)" /> Top hosting countries</div>
          <div className="section-sub">Registrant server geographic density</div>
          <div style={{ height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryDist} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid stroke="rgba(0, 210, 255, 0.08)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="country" type="category" width={70} tick={{ fill: "#8ea0bc", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(8, 17, 36, 0.95)", border: "1.5px solid var(--blue-neon)", borderRadius: 10, fontSize: 12, boxShadow: "0 0 15px rgba(0, 210, 255, 0.2)" }} cursor={{ fill: "rgba(0, 210, 255, 0.06)" }} />
                <Bar dataKey="count" fill="var(--blue-neon)" radius={[0, 4, 4, 0]} barSize={11} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* New Threat Timeline Trend Chart (Full Width) */}
      <div className="card" style={{ padding: 22 }}>
        <div className="section-title"><TrendingUp size={15} color="var(--gold)" /> Risk Trend &amp; Threat Timeline Detections</div>
        <div className="section-sub">Detections timeline trend across active scanners</div>
        <div style={{ height: 180, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid stroke="rgba(0, 210, 255, 0.06)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "#8ea0bc", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8ea0bc", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "rgba(8, 17, 36, 0.95)", border: "1.5px solid var(--blue-neon)", borderRadius: 10, fontSize: 12, boxShadow: "0 0 15px rgba(0, 210, 255, 0.2)" }} />
              <Line type="monotone" dataKey="Threat Alerts" stroke="var(--blue-neon)" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Feed Section */}
      <div className="card">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="section-title"><Bell size={15} color="var(--gold)" /> Recent threats feed</div>
            <div className="section-sub">Real-time alerts log of latest pipeline detections</div>
          </div>
          <span style={{ fontSize: 11, color: "var(--green)", fontFamily: "var(--mono)", border: "1px solid var(--green)", padding: "2px 8px", borderRadius: 4 }}>LOG ACTIVE</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Domain / Entity</th><th>Type</th><th>Risk Score</th><th>Country</th><th>Detected</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r, idx) => {
              // Color code threat feeds
              const badgeCls = r.riskLevel === "High" ? "badge-high" : r.riskLevel === "Medium" ? "badge-medium" : "badge-low";
              const timeLabels = ["2 min ago", "5 min ago", "12 min ago", "28 min ago", "1h ago", "2h ago", "4h ago", "1d ago"];
              return (
                <tr key={r.id}>
                  <td className="domain-name">{r.domain}</td>
                  <td><span className="badge badge-neutral">{r.threatType}</span></td>
                  <td><span className={`badge ${badgeCls}`}>{r.riskScore}</span></td>
                  <td style={{ color: "var(--text-dim)" }}>{r.country}</td>
                  <td className="font-mono" style={{ color: "var(--text-dim)" }}>{timeLabels[idx] || r.detectedDate}</td>
                  <td><span className={`badge ${r.status === "Blocked" ? "badge-low" : r.status === "Active" ? "badge-high" : "badge-medium"}`}>{r.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RiskGauge({ value }: { value: number }) {
  const angle = (value / 100) * 180;
  const color = value >= 70 ? "var(--red)" : value >= 40 ? "var(--amber)" : "var(--green)";
  const r = 70, cx = 90, cy = 80;
  const rad = (Math.PI * (180 - angle)) / 180;
  const x = cx + r * Math.cos(rad);
  const y = cy - r * Math.sin(rad);
  return (
    <svg width="180" height="100" viewBox="0 0 180 100">
      <path d={`M 20 80 A 70 70 0 0 1 160 80`} fill="none" stroke="#13233d" strokeWidth="12" strokeLinecap="round" />
      <path
        d={`M 20 80 A 70 70 0 0 1 ${x} ${y}`}
        fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
      />
      <text x="90" y="72" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="28" fontWeight="600" fill="#e7edf7">
        {value}
      </text>
      <text x="90" y="90" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fill="#8ea0bc">/ 100</text>
    </svg>
  );
}

/* ---------------------------------------------------------------
   DOMAIN THREAT INTELLIGENCE PAGE
------------------------------------------------------------------*/
function DomainIntel({ data }: { data: ThreatRecord[] }) {
  const [q, setQ] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Sorting State
  const [sortField, setSortField] = useState<"domain" | "riskScore" | "ageDays" | "similarityScore">("riskScore");
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Column Visibility State
  const [showAge, setShowAge] = useState(true);
  const [showSSL, setShowSSL] = useState(true);
  const [showCountry, setShowCountry] = useState(true);
  const [showSimilarity, setShowSimilarity] = useState(true);

  // Clear Filters
  const handleClearFilters = () => {
    setQ("");
    setRiskFilter("All");
    setTypeFilter("All");
    setStatusFilter("All");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Filtered & Sorted Data
  const processedData = useMemo(() => {
    let result = data.filter((d: ThreatRecord) => {
      if (q && !d.domain.toLowerCase().includes(q.toLowerCase())) return false;
      if (riskFilter !== "All" && d.riskLevel !== riskFilter) return false;
      if (typeFilter !== "All" && d.threatType !== typeFilter) return false;
      if (statusFilter !== "All" && d.status !== statusFilter) return false;
      
      // Date Filter Comparison
      if (startDate && d.detectedDate && d.detectedDate < startDate) return false;
      if (endDate && d.detectedDate && d.detectedDate > endDate) return false;
      
      return true;
    });

    // Sort Data
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "string" && typeof valB === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return result;
  }, [data, q, riskFilter, typeFilter, statusFilter, startDate, endDate, sortField, sortAsc]);

  // Paginated View
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIdx, startIdx + itemsPerPage);
  }, [processedData, currentPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1;

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Advanced Filter Panel */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="section-title"><Filter size={15} color="var(--gold)" /> Advanced Search &amp; Filter Console</div>
          <button className="btn" onClick={handleClearFilters} style={{ padding: "6px 12px", fontSize: 12 }}>
            Clear Filters
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 11, top: 10, color: "var(--text-faint)" }} />
            <input className="search" placeholder="Search domain or URL…" value={q} onChange={(e) => { setQ(e.target.value); setCurrentPage(1); }} />
          </div>

          {/* Risk Dropdown */}
          <select className="filter" value={riskFilter} onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}>
            <option value="All">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          {/* Type Dropdown */}
          <select className="filter" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
            <option value="All">All Threat Types</option>
            {THREAT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Status Dropdown */}
          <select className="filter" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        {/* Date Filters & Column Visibility */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          {/* Dates */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Calendar size={13} color="var(--blue-neon)" />
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Date Range:</span>
            <input 
              type="date" 
              className="filter" 
              style={{ padding: "4px 8px", fontSize: 12 }} 
              value={startDate} 
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} 
            />
            <span style={{ fontSize: 12, color: "var(--text-faint)" }}>to</span>
            <input 
              type="date" 
              className="filter" 
              style={{ padding: "4px 8px", fontSize: 12 }} 
              value={endDate} 
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} 
            />
          </div>

          {/* Column Toggle Options */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600 }}>Toggle Columns:</span>
            <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={showAge} onChange={(e) => setShowAge(e.target.checked)} /> Age
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={showSSL} onChange={(e) => setShowSSL(e.target.checked)} /> SSL
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={showCountry} onChange={(e) => setShowCountry(e.target.checked)} /> Country
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={showSimilarity} onChange={(e) => setShowSimilarity(e.target.checked)} /> Similarity
            </label>
          </div>
        </div>
      </div>

      {/* Domain Table Card */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th></th>
              <th onClick={() => handleSort("domain")} style={{ cursor: "pointer" }}>Domain {sortField === "domain" && (sortAsc ? "↑" : "↓")}</th>
              <th>Threat Type</th>
              <th onClick={() => handleSort("riskScore")} style={{ cursor: "pointer" }}>Risk Score {sortField === "riskScore" && (sortAsc ? "↑" : "↓")}</th>
              {showAge && <th onClick={() => handleSort("ageDays")} style={{ cursor: "pointer" }}>Age {sortField === "ageDays" && (sortAsc ? "↑" : "↓")}</th>}
              {showSSL && <th>SSL</th>}
              {showCountry && <th>Country</th>}
              {showSimilarity && <th onClick={() => handleSort("similarityScore")} style={{ cursor: "pointer" }}>Visual Similarity {sortField === "similarityScore" && (sortAsc ? "↑" : "↓")}</th>}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((d) => (
              <React.Fragment key={d.id}>
                <tr onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
                  <td style={{ width: 20 }}>
                    {expanded === d.id ? <ChevronDown size={14} color="var(--text-dim)" /> : <ChevronRight size={14} color="var(--text-dim)" />}
                  </td>
                  <td className="domain-name">{d.domain}</td>
                  <td><span className="badge badge-neutral">{d.threatType}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="risk-bar-track">
                        <div className="risk-bar-fill" style={{ width: `${d.riskScore}%`, background: RISK_COLOR[d.riskLevel] }} />
                      </div>
                      <span className="font-mono" style={{ fontSize: 11.5, color: RISK_COLOR[d.riskLevel] }}>{d.riskScore}</span>
                    </div>
                  </td>
                  {showAge && <td className="font-mono" style={{ color: "var(--text-dim)" }}>{d.ageDays}d</td>}
                  {showSSL && <td>{sslBadge(d.sslStatus)}</td>}
                  {showCountry && <td style={{ color: "var(--text-dim)" }}>{d.country}</td>}
                  {showSimilarity && <td className="font-mono" style={{ color: "var(--text-dim)" }}>{d.similarityScore ? `${d.similarityScore}%` : "—"}</td>}
                  <td><span className={`badge ${d.status === "Blocked" ? "badge-low" : d.status === "Active" ? "badge-high" : "badge-medium"}`}>{d.status}</span></td>
                </tr>
                {expanded === d.id && (
                  <tr style={{ cursor: "default" }}>
                    <td colSpan={9} style={{ background: "var(--panel-raised)", padding: "20px 30px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, fontSize: 12, marginBottom: 16 }}>
                        <div><div style={{ color: "var(--text-faint)", marginBottom: 4 }}>Registration date</div><div className="font-mono">{d.registrationDate}</div></div>
                        <div><div style={{ color: "var(--text-faint)", marginBottom: 4 }}>Registrar</div><div>{d.registrar}</div></div>
                        <div><div style={{ color: "var(--text-faint)", marginBottom: 4 }}>Detected on</div><div className="font-mono">{d.detectedDate}</div></div>
                        <div><div style={{ color: "var(--text-faint)", marginBottom: 4 }}>Data source</div><div>{d.source}</div></div>
                      </div>
                      {d.redFlags?.length > 0 && (
                        <div style={{ marginTop: 14, marginBottom: 16 }}>
                          <div style={{ color: "var(--text-faint)", marginBottom: 6, fontSize: 12 }}>Red flags</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {d.redFlags.map((f, i) => <span key={i} className="flag-chip">{f}</span>)}
                          </div>
                        </div>
                      )}
                      
                      {/* Expanded Actions */}
                      <div style={{ display: "flex", gap: 10, alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 14 }}>
                        <button className="btn" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => alert(`Investigating domain: ${d.domain}`)}>
                          <Eye size={12} /> Investigate
                        </button>
                        <button className="btn btn-gold" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => alert(`Blocking domain request submitted for: ${d.domain}`)}>
                          <Lock size={12} /> Block Domain
                        </button>
                        <span style={{ fontSize: 11.5, color: "var(--text-faint)", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                          <ExternalLink size={12} /> Visual comparison matched to official FIFA brand assets.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        
        {processedData.length === 0 && <div className="empty-state">No domains match those filters.</div>}
        
        {/* Pagination Controls */}
        {processedData.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
              Showing {Math.min(processedData.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(processedData.length, currentPage * itemsPerPage)} of {processedData.length} records
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                className="btn" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                style={{ padding: "5px 10px", fontSize: 11.5, opacity: currentPage === 1 ? 0.4 : 1 }}
              >
                Previous
              </button>
              <button 
                className="btn" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                style={{ padding: "5px 10px", fontSize: 11.5, opacity: currentPage === totalPages ? 0.4 : 1 }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   TICKETING FRAUD MONITOR PAGE
------------------------------------------------------------------*/
function TicketingFraud({ data }: { data: ThreatRecord[] }) {
  const tickets = useMemo(() => data.filter((d) => d.threatType === "Ticket Scam"), [data]);

  const totals = useMemo(() => ({
    portals: tickets.length,
    loss: tickets.reduce((a: number, t: ThreatRecord) => a + (t.estimatedLoss || 0), 0),
    victims: tickets.reduce((a: number, t: ThreatRecord) => a + (t.affectedUsers || 0), 0),
  }), [tickets]);

  type PriceBucket = { tier: string; official: number; scamAvg: number; n: number };
  const priceComparison = useMemo(() => {
    const buckets: Record<string, PriceBucket> = {};
    tickets.forEach((t: ThreatRecord) => {
      if (!t.officialPrice) return;
      const key = `$${t.officialPrice}`;
      if (!buckets[key]) buckets[key] = { tier: key, official: t.officialPrice, scamAvg: 0, n: 0 };
      buckets[key].scamAvg += t.scamPrice ?? 0;
      buckets[key].n += 1;
    });
    return Object.values(buckets).map((b: PriceBucket) => ({ tier: b.tier, Official: b.official, "Scam avg": Math.round(b.scamAvg / b.n) }));
  }, [tickets]);

  const flagFreq = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach((t: ThreatRecord) => (t.redFlags || []).forEach((f: string) => (counts[f] = (counts[f] || 0) + 1)));
    return Object.entries(counts).map(([flag, count]) => ({ flag, count: count as number })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [tickets]);

  return (
    <div>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="card stat-card">
          <div className="scanline" />
          <div className="stat-icon" style={{ background: "rgba(255,61,94,0.1)", border: "1px solid rgba(255,61,94,0.3)" }}><Ticket size={16} color="var(--red)" /></div>
          <div className="stat-value">{totals.portals}</div>
          <div className="stat-label">Fake portals detected</div>
        </div>
        <div className="card stat-card">
          <div className="scanline" />
          <div className="stat-icon" style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)" }}><AlertTriangle size={16} color="var(--gold)" /></div>
          <div className="stat-value">${totals.loss.toLocaleString()}</div>
          <div className="stat-label">Estimated financial loss</div>
        </div>
        <div className="card stat-card">
          <div className="scanline" />
          <div className="stat-icon" style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)" }}><Users size={16} color="var(--green)" /></div>
          <div className="stat-value">{totals.victims.toLocaleString()}</div>
          <div className="stat-label">Estimated affected users</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title">Official vs. scam pricing</div>
          <div className="section-sub">Average listed price by ticket tier</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceComparison}>
                <CartesianGrid stroke="#13233d" vertical={false} />
                <XAxis dataKey="tier" tick={{ fill: "#8ea0bc", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8ea0bc", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(8, 17, 36, 0.95)", border: "1.5px solid var(--blue-neon)", borderRadius: 10, fontSize: 12, boxShadow: "0 0 15px rgba(0, 210, 255, 0.2)" }} cursor={{ fill: "rgba(0, 210, 255, 0.06)" }} />
                <Bar dataKey="Official" fill="#00ff88" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Scam avg" fill="#ff3d5e" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title">Most common red flags</div>
          <div className="section-sub">Across all detected ticketing scams</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flagFreq} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid stroke="#13233d" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="flag" type="category" width={150} tick={{ fill: "#8ea0bc", fontSize: 10.5 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(8, 17, 36, 0.95)", border: "1.5px solid var(--blue-neon)", borderRadius: 10, fontSize: 12, boxShadow: "0 0 15px rgba(0, 210, 255, 0.2)" }} cursor={{ fill: "rgba(0, 210, 255, 0.06)" }} />
                <Bar dataKey="count" fill="#FFD700" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div className="section-title">Detected fake ticketing portals</div>
          <div className="section-sub">{tickets.length} portals flagged</div>
        </div>
        <table>
          <thead>
            <tr><th>Domain</th><th>Risk</th><th>Listed price</th><th>Official price</th><th>Red flags</th><th>Est. loss</th><th>Status</th></tr>
          </thead>
          <tbody>
            {tickets.slice(0, 40).map((t) => (
              <tr key={t.id}>
                <td className="domain-name">{t.domain}</td>
                <td>{riskBadge(t.riskLevel)}</td>
                <td className="font-mono" style={{ color: "var(--red)" }}>{t.scamPrice ? `$${t.scamPrice}` : "—"}</td>
                <td className="font-mono" style={{ color: "var(--text-dim)" }}>{t.officialPrice ? `$${t.officialPrice}` : "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 240 }}>
                    {(t.redFlags || []).slice(0, 2).map((f, i) => <span key={i} className="flag-chip">{f}</span>)}
                    {t.redFlags?.length > 2 && <span className="flag-chip">+{t.redFlags.length - 2}</span>}
                  </div>
                </td>
                <td className="font-mono">${(t.estimatedLoss || 0).toLocaleString()}</td>
                <td><span className={`badge ${t.status === "Blocked" ? "badge-low" : t.status === "Active" ? "badge-high" : "badge-medium"}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 && <div className="empty-state">No ticket-scam records in the current dataset.</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ROOT APP
------------------------------------------------------------------*/
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [data, setData] = useState(() => generateMockData(180));
  const [dataSource, setDataSource] = useState("Mock dataset · 180 records");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleUpload = useCallback((file: File) => {
    setUploadError(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const normalized: ThreatRecord[] = (results.data as Record<string, string>[]).filter((r) => r.domain).map((row, i) => normalizeCSVRow(row, i));
          if (normalized.length === 0) throw new Error("empty");
          setData(normalized);
          setDataSource(`${file.name} · ${normalized.length} records`);
        } catch {
          setUploadError("Couldn't parse that file into threat records — check it has a header row.");
        }
      },
      error: () => setUploadError("Failed to read the CSV file."),
    });
  }, []);

  const handleScan = useCallback(() => {
    alert("Threat Scan Triggered! Sentinel/7 is scanning the DNS space for new phishing domains targeting FIFA World Cup 2026...");
  }, []);

  const handleExport = useCallback(() => {
    const csvContent = Papa.unparse(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sentinel7_threat_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);

  type PageKey = "dashboard" | "domains" | "tickets";
  const titles: Record<PageKey, [string, string]> = {
    dashboard: ["Threat Overview", "Real-time snapshot across all detection pipelines"],
    domains: ["Domain Threat Intelligence", "Detect & analyze fraudulent FIFA domains"],
    tickets: ["Ticketing Fraud Monitor", "Fake portals, pricing anomalies & victim impact"],
  };

  return (
    <div className="stg-root">
      <style>{TOKENS}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <div className="hexbg" />
      <Sidebar page={page} setPage={setPage} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="main">
        <TopBar title={titles[page as PageKey][0]} subtitle={titles[page as PageKey][1]} onUpload={handleUpload} dataSource={dataSource} onScan={handleScan} onExport={handleExport} />
        {uploadError && (
          <div style={{ margin: "14px 28px 0", padding: "10px 14px", background: "rgba(255,61,94,0.1)", border: "1px solid rgba(255,61,94,0.3)", borderRadius: 8, fontSize: 12.5, color: "var(--red)", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={13} /> {uploadError}
            <X size={13} style={{ marginLeft: "auto", cursor: "pointer" }} onClick={() => setUploadError(null)} />
          </div>
        )}
        <div className="content">
          {page === "dashboard" && <Dashboard data={data} />}
          {page === "domains" && <DomainIntel data={data} />}
          {page === "tickets" && <TicketingFraud data={data} />}
        </div>
      </div>
    </div>
  );
}
