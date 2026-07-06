"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import {
  Shield, AlertTriangle, Globe2, Ticket, Radio, Users, Bell, Settings,
  LayoutDashboard, TrendingUp, TrendingDown, Search, Upload, ChevronDown,
  ChevronRight, ChevronLeft, ExternalLink, Lock, Unlock, ShieldAlert, ShieldCheck,
  CircleDot, X, Info, RefreshCw, Download, HelpCircle, LogOut, Sun, Moon,
  UserPlus, LogIn, Eye, EyeOff, Key, Mail, Award, BarChart3, Activity,
  Database, Zap, Fingerprint, FileText, BookOpen, Server, Cpu, Clock,
  Percent, MapPin, Link2, Fingerprint as FingerprintIcon, Play, Globe, Image
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";

/* ---------------------------------------------------------------
   DESIGN TOKENS — Deep blue/gold neon cybersecurity theme
------------------------------------------------------------------*/
const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

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

  .stg-root.light {
    --void: #f4f7fc;
    --panel: rgba(255, 255, 255, 0.85);
    --panel-raised: rgba(240, 244, 250, 0.95);
    --panel-hair: rgba(0, 102, 255, 0.1);
    --border: rgba(0, 102, 255, 0.12);
    --border-strong: rgba(0, 102, 255, 0.25);
    --text: #0d1b2a;
    --text-dim: #415a77;
    --text-faint: #778da9;
    --shadow-neon: 0 0 15px rgba(0, 102, 255, 0.15);
  }

  .stg-root.light input.search,
  .stg-root.light select.filter,
  .stg-root.light .auth-input {
    background: rgba(255, 255, 255, 0.95) !important;
    color: #0d1b2a !important;
    border-color: rgba(0, 102, 255, 0.25) !important;
  }

  .stg-root.light input.search:focus,
  .stg-root.light select.filter:focus,
  .stg-root.light select.filter:hover,
  .stg-root.light .auth-input:focus {
    background: #ffffff !important;
    border-color: var(--blue-neon) !important;
    box-shadow: 0 0 10px rgba(0, 102, 255, 0.1) !important;
  }

  .stg-root.light select.filter option {
    background-color: #ffffff;
    color: #0d1b2a;
  }

  .stg-root.light .hexbg {
    background-image:
      linear-gradient(rgba(0, 102, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 102, 255, 0.05) 1px, transparent 1px);
    opacity: 0.4;
  }

  .stg-root.light .sidebar {
    background: rgba(255, 255, 255, 0.95);
    border-right: 1px solid var(--border-strong);
  }

  .stg-root.light .topbar {
    background: rgba(255, 255, 255, 0.8);
  }

  .stg-root.light thead th {
    background: rgba(240, 244, 250, 0.95);
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
    position: absolute; inset: 0; pointer-events: none; opacity: 0.18;
    background-image:
      linear-gradient(rgba(0, 210, 255, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 210, 255, 0.08) 1px, transparent 1px);
    background-size: 30px 30px;
    mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 80%);
  }

  .font-display { font-family: var(--grotesk); letter-spacing: -0.02em; }
  .font-mono { font-family: var(--mono); }

  /* ── Sidebar ── */
  .sidebar {
    width: 245px; flex-shrink: 0;
    background: rgba(4, 9, 20, 0.9);
    backdrop-filter: blur(20px);
    border-right: 1px solid var(--border-strong);
    display: flex; flex-direction: column;
    position: relative; z-index: 2;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .sidebar.collapsed { width: 68px; }
  .brand { padding: 24px 22px; border-bottom: 1px solid var(--border); }
  .brand-mark {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, var(--blue-neon), var(--blue-deep));
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 20px rgba(0, 210, 255, 0.45);
    flex-shrink: 0;
  }
  .navgroup { padding: 16px 12px; }
  .navlabel {
    font-size: 10px; font-weight: 600; letter-spacing: 0.16em;
    color: var(--text-faint); text-transform: uppercase; padding: 12px 12px 8px;
  }
  .navitem {
    display: flex; align-items: center; gap: 12px; padding: 10px 14px;
    border-radius: 10px; color: var(--text-dim); font-size: 13.5px;
    cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent; margin-bottom: 4px;
  }
  .navitem:hover { background: rgba(0, 210, 255, 0.08); color: var(--text); border-color: rgba(0, 210, 255, 0.15); }
  .navitem.active { background: linear-gradient(90deg, rgba(0, 102, 255, 0.2), rgba(0, 210, 255, 0.05)); color: var(--blue-neon); border-color: var(--border-strong); box-shadow: var(--shadow-neon); }
  .navitem.disabled { opacity: 0.35; cursor: default; }
  .navitem.disabled:hover { background: transparent; color: var(--text-dim); border-color: transparent; box-shadow: none; }
  .soon-badge {
    margin-left: auto; font-size: 8px; font-weight: 700; padding: 2px 6px;
    border-radius: 6px; background: rgba(0, 210, 255, 0.1); color: var(--blue-neon);
    letter-spacing: 0.08em; border: 1px solid rgba(0, 210, 255, 0.2);
  }
  .sub-menu-item:hover { color: var(--blue-neon) !important; }

  /* ── Layout ── */
  .main { flex: 1; position: relative; z-index: 2; min-width: 0; }
  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 32px; border-bottom: 1px solid var(--border);
    background: rgba(4, 9, 20, 0.5); backdrop-filter: blur(16px);
    position: sticky; top: 0; z-index: 5;
  }
  .content { padding: 32px; }

  /* ── Live dot ── */
  .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); position: relative; display: inline-block; }
  .pulse-dot::after {
    content: ''; position: absolute; inset: -4px; border-radius: 50%;
    border: 1px solid var(--green);
    animation: pulse 2.2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
  }
  @keyframes pulse { 0% { transform: scale(0.7); opacity: 0.9; } 100% { transform: scale(2.4); opacity: 0; } }

  .status-pill {
    display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--blue-neon);
    font-weight: 500; font-family: var(--mono); padding: 6px 14px;
    border: 1px solid var(--border-strong); border-radius: 20px;
    background: rgba(0, 210, 255, 0.05); box-shadow: 0 0 10px rgba(0, 210, 255, 0.1);
  }

  /* ── Buttons ── */
  .btn {
    display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600;
    padding: 9px 16px; border-radius: 8px; cursor: pointer;
    border: 1px solid var(--border-strong); background: rgba(15, 32, 67, 0.5);
    color: var(--text); transition: all 0.2s ease;
  }
  .btn:hover { border-color: var(--blue-neon); color: var(--blue-neon); box-shadow: 0 0 12px rgba(0, 210, 255, 0.2); }
  .btn-gold { background: linear-gradient(135deg, var(--blue-neon), var(--blue-deep)); color: #030812; border: none; font-weight: 700; box-shadow: 0 4px 15px rgba(0, 210, 255, 0.3); }
  .btn-gold:hover { filter: brightness(1.15); color: #030812; box-shadow: 0 4px 20px rgba(0, 210, 255, 0.55); }

  /* ── Cards ── */
  .card {
    background: var(--panel); backdrop-filter: blur(14px);
    border: 1px solid var(--border); border-radius: 16px;
    position: relative; overflow: hidden;
    transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .card:hover { border-color: rgba(0, 210, 255, 0.25); box-shadow: 0 8px 30px rgba(0,0,0,0.4), 0 0 15px rgba(0, 210, 255, 0.08); }
  .scanline {
    position: absolute; top: 0; left: -30%; width: 30%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--blue-neon), transparent);
    animation: sweep 4s linear infinite;
  }
  @keyframes sweep { 0% { left: -30%; } 100% { left: 110%; } }

  /* ── Stat grid ── */
  .stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
  @media (max-width: 1200px) { .stat-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 800px)  { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
  .stat-card { padding: 22px 20px; cursor: pointer; transition: transform 0.2s; }
  .stat-card:hover { transform: scale(1.02); }
  .stat-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
  .stat-value {
    font-family: var(--mono); font-size: 28px; font-weight: 700; line-height: 1;
    background: linear-gradient(135deg, var(--text), var(--text-dim));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .stat-label { font-size: 12px; color: var(--text-dim); margin-top: 8px; font-weight: 500; }
  .trend { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; font-family: var(--mono); margin-top: 12px; }

  /* ── Section titles ── */
  .section-title { font-family: var(--grotesk); font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 10px; color: var(--text); }
  .section-sub { font-size: 12px; color: var(--text-dim); margin-top: 4px; }

  /* ── Badges ── */
  .badge { font-size: 10px; font-weight: 600; font-family: var(--mono); padding: 3px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px; letter-spacing: 0.02em; white-space: nowrap; }
  .badge-high   { background: rgba(255,42,95,0.12);  color: var(--red);   border: 1px solid rgba(255,42,95,0.35);  box-shadow: 0 0 10px rgba(255,42,95,0.1); }
  .badge-medium { background: rgba(255,159,26,0.12); color: var(--amber); border: 1px solid rgba(255,159,26,0.35); box-shadow: 0 0 10px rgba(255,159,26,0.1); }
  .badge-low    { background: rgba(0,255,210,0.1);   color: var(--green); border: 1px solid rgba(0,255,210,0.3);   box-shadow: 0 0 10px rgba(0,255,210,0.1); }
  .badge-neutral { background: rgba(0,210,255,0.05); color: var(--blue-neon); border: 1px solid rgba(0,210,255,0.25); }

  /* ── Table ── */
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead th {
    text-align: left; font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text-faint); font-weight: 600; padding: 14px 18px;
    border-bottom: 1px solid var(--border-strong);
    position: sticky; top: 0; background: rgba(6,15,34,0.95); backdrop-filter: blur(10px);
  }
  thead th.sortable { cursor: pointer; user-select: none; }
  thead th.sortable:hover { color: var(--blue-neon); }
  tbody td { padding: 14px 18px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  tbody tr { cursor: pointer; transition: all 0.2s ease; }
  tbody tr:hover { background: rgba(0, 210, 255, 0.04); }
  .domain-name { font-family: var(--mono); font-size: 13px; color: var(--text); font-weight: 500; }

  /* ── Inputs ── */
  input.search {
    background: rgba(4,9,20,0.6); border: 1px solid var(--border-strong); border-radius: 10px;
    padding: 10px 14px 10px 38px; font-size: 13.5px; color: var(--text); width: 280px; outline: none;
    transition: all 0.25s ease;
  }
  input.search:focus { border-color: var(--blue-neon); box-shadow: var(--shadow-neon); background: rgba(4,9,20,0.85); }
  select.filter {
    background: rgba(4,9,20,0.6); border: 1px solid var(--border-strong); border-radius: 10px;
    padding: 9px 14px; font-size: 13px; color: var(--text-dim); outline: none; cursor: pointer; transition: all 0.2s;
  }
  select.filter:focus, select.filter:hover { border-color: var(--blue-neon); color: var(--text); }

  /* ── Risk bar ── */
  .risk-bar-track { width: 70px; height: 6px; border-radius: 4px; background: rgba(0,210,255,0.08); overflow: hidden; }
  .risk-bar-fill { height: 100%; border-radius: 4px; box-shadow: 0 0 8px rgba(0,210,255,0.5); }

  .flag-chip { font-size: 10.5px; padding: 4px 10px; border-radius: 8px; background: rgba(0,210,255,0.05); border: 1px solid rgba(0,210,255,0.15); color: var(--text-dim); transition: all 0.2s; }
  .flag-chip:hover { border-color: var(--blue-neon); color: var(--text); background: rgba(0,210,255,0.1); }

  .empty-state { text-align: center; padding: 60px 20px; color: var(--text-dim); }
  .pagination-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 600; cursor: pointer; border: 1px solid var(--border-strong); background: rgba(15,32,67,0.5); color: var(--text); transition: all 0.2s; }
  .pagination-btn:hover { border-color: var(--blue-neon); color: var(--blue-neon); }
  .pagination-btn:disabled { opacity: 0.35; cursor: default; }

  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,210,255,0.2); border-radius: 8px; border: 2px solid var(--void); }
  ::-webkit-scrollbar-thumb:hover { background: rgba(0,210,255,0.4); }
  ::-webkit-scrollbar-track { background: transparent; }

  /* ── Auth pages ── */
  .auth-container {
    max-width: 420px; width: 100%; margin: auto;
    background: var(--panel); backdrop-filter: blur(20px);
    border: 1px solid var(--border-strong); border-radius: 20px;
    padding: 36px 32px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0,210,255,0.05);
  }
  .auth-container h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
  .auth-container .sub { color: var(--text-dim); font-size: 14px; margin-bottom: 24px; }
  .auth-input {
    background: rgba(4,9,20,0.6); border: 1px solid var(--border-strong); border-radius: 10px;
    padding: 12px 14px; font-size: 14px; color: var(--text); width: 100%; outline: none;
    transition: all 0.25s ease;
  }
  .auth-input:focus { border-color: var(--blue-neon); box-shadow: var(--shadow-neon); background: rgba(4,9,20,0.85); }
  .auth-label { font-size: 13px; color: var(--text-dim); margin-bottom: 4px; display: block; font-weight: 500; }
  .auth-link { color: var(--blue-neon); text-decoration: none; font-weight: 600; cursor: pointer; }
  .auth-link:hover { text-decoration: underline; }
`;

/* ---------------------------------------------------------------
   MOCK DATA
------------------------------------------------------------------*/
const THREAT_TYPES = ["Ticket Scam", "Phishing", "Malware", "Streaming Piracy"];
const COUNTRIES = ["Russia", "Nigeria", "Vietnam", "Brazil", "India", "Ukraine", "Indonesia", "China", "Philippines", "USA"];
const REGISTRARS = ["NameCheap Inc.", "GoDaddy.com LLC", "PDR Ltd.", "Alibaba Cloud", "REG.RU", "Dynadot LLC"];
const SSL_STATES = ["Invalid", "Expired", "None", "Valid"];
const STATUSES = ["Active", "Under Review", "Blocked"];
const RED_FLAG_POOL = [
  "Price 60-80% below official", "Domain registered <30 days ago", "No SSL / self-signed cert",
  "Spoofed FIFA branding", "Offshore hosting", "No refund policy listed",
  "Unofficial payment gateway", "No verifiable physical address", "WHOIS privacy shield active",
];

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
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
      domain: `fifa-${["worldcup","tickets2026","official","matchday","livepass","fanzone","goldpass"][Math.floor(rnd()*7)]}-${Math.floor(rnd()*999)}.${["com","net","info","xyz","ru","top"][Math.floor(rnd()*6)]}`,
      threatType,
      riskScore,
      riskLevel: riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low",
      registrationDate: `2025-${String(Math.floor(rnd()*12)+1).padStart(2,"0")}-${String(Math.floor(rnd()*28)+1).padStart(2,"0")}`,
      ageDays,
      registrar: REGISTRARS[Math.floor(rnd() * REGISTRARS.length)],
      country: COUNTRIES[Math.floor(rnd() * COUNTRIES.length)],
      sslStatus: SSL_STATES[Math.floor(rnd() * SSL_STATES.length)],
      similarityScore: Math.round(40 + rnd() * 60),
      detectedDate: `2026-0${Math.floor(rnd()*6)+1}-${String(Math.floor(rnd()*28)+1).padStart(2,"0")}`,
      status: STATUSES[Math.floor(rnd() * STATUSES.length)],
      estimatedLoss: isTicket ? Math.round(rnd()*45000) : Math.round(rnd()*8000),
      affectedUsers: isTicket ? Math.floor(rnd()*900) : Math.floor(rnd()*200),
      officialPrice: isTicket ? officialPrice : null,
      scamPrice: isTicket ? Math.round(officialPrice * (0.15 + rnd() * 0.35)) : null,
      redFlags: flags,
      source: rnd() > 0.4 ? "Synthetic" : "Real (FBI/IC3-linked)",
      osintReportCount: Math.floor(rnd() * 5) + 1,
      socialMediaMentions: Math.floor(rnd() * 100),
      blacklistSource: ["Google Safe Browsing", "PhishTank", "OpenPhish", "URLHaus"][Math.floor(rnd() * 4)],
    });
  }
  return rows;
}

// Removed normalizeCSVRow and CSV field maps

interface ThreatRecord {
  id: string; domain: string; threatType: string; riskScore: number; riskLevel: string;
  registrationDate: string; ageDays: number; registrar: string; country: string;
  sslStatus: string; similarityScore: number; detectedDate: string; status: string;
  estimatedLoss: number; affectedUsers: number; officialPrice: number | null;
  scamPrice: number | null; redFlags: string[]; source: string;
  osintReportCount?: number; socialMediaMentions?: number; blacklistSource?: string;
}

const RISK_COLOR: Record<string,string> = { High:"var(--red)", Medium:"var(--amber)", Low:"var(--green)" };

function riskBadge(level: string) {
  const cls = level === "High" ? "badge-high" : level === "Medium" ? "badge-medium" : "badge-low";
  return <span className={`badge ${cls}`}>{level}</span>;
}
function sslBadge(status: string) {
  if (status === "Valid")   return <span className="badge badge-low"><Lock size={10}/>Valid</span>;
  if (status === "Unknown") return <span className="badge badge-neutral">Unknown</span>;
  return <span className="badge badge-high"><Unlock size={10}/>{status}</span>;
}

/* ---------------------------------------------------------------
   RISK GAUGE SVG
------------------------------------------------------------------*/
function RiskGauge({ value }: { value: number }) {
  const angle = (value / 100) * 180;
  const color = value >= 70 ? "var(--red)" : value >= 40 ? "var(--amber)" : "var(--green)";
  const r = 70, cx = 90, cy = 80;
  const rad = (Math.PI * (180 - angle)) / 180;
  const x = cx + r * Math.cos(rad);
  const y = cy - r * Math.sin(rad);
  return (
    <svg width="180" height="100" viewBox="0 0 180 100">
      <path d="M 20 80 A 70 70 0 0 1 160 80" fill="none" stroke="rgba(0,210,255,0.12)" strokeWidth="12" strokeLinecap="round"/>
      <path d={`M 20 80 A 70 70 0 0 1 ${x} ${y}`} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" style={{ filter:`drop-shadow(0 0 6px ${color})` }}/>
      <text x="90" y="72" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="28" fontWeight="700" fill="#f0f5fc">{value}</text>
      <text x="90" y="90" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="10" fill="#a5b7d0">/ 100</text>
    </svg>
  );
}

/* ---------------------------------------------------------------
   SIDEBAR
------------------------------------------------------------------*/
interface SidebarProps {
  page: string;
  setPage: (p: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  onLogout: () => void;
  user: string;
  onNavigate?: (href: string) => void;
}
function Sidebar({ page, setPage, collapsed, setCollapsed, onLogout, user, onNavigate }: SidebarProps) {
  const items = [
    { key:"dashboard", label:"Dashboard", icon:LayoutDashboard, enabled:true },
    { key:"scan",      label:"Scan URL",      icon:Search,   enabled:true },
    { key:"domains",   label:"Domain Intelligence", icon:Globe2, enabled:true },
    { key:"tickets",   label:"Ticketing Fraud",     icon:Ticket, enabled:true },
    { key:"social",    label:"Social & OSINT",      icon:Users,    enabled:true },
    { key:"streaming", label:"Streaming Piracy",    icon:Radio,    enabled:true },
    { key:"alerts",    label:"Alerts",              icon:Bell,     enabled:true },
    { key:"settings",  label:"Settings",            icon:Settings, enabled:true },
  ];
  return (
    <div className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="brand" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"24px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap: collapsed ? 0 : 10 }}>
          <div className="brand-mark"><Shield size={17} color="#030812" strokeWidth={2.5}/></div>
          {!collapsed && (
            <div>
              <div className="font-display" style={{ fontSize:14.5, fontWeight:700, background:"linear-gradient(135deg,var(--gold),#ff9f1a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CyberPitch-FIFA</div>
              <div style={{ fontSize:9, color:"var(--text-dim)", letterSpacing:"0.08em" }}>FIFA THREAT INTEL</div>
            </div>
          )}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} style={{ background:"none", border:"none", color:"var(--text-faint)", cursor:"pointer", display:"flex", alignItems:"center" }} title={collapsed?"Expand":"Collapse"}>
          {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
        </button>
      </div>

      <div className="navgroup" style={{ padding:"16px 8px" }}>
        <div className="navlabel" style={{ display: collapsed ? "none" : "block" }}>Monitor</div>
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = page === it.key;
          return (
            <div
              key={it.key}
              className={`navitem${isActive?" active":""}${!it.enabled?" disabled":""}`}
              onClick={() => {
                if (!it.enabled) return;
                if (it.href && onNavigate) {
                  onNavigate(it.href);
                } else {
                  setPage(it.key);
                }
              }}
              style={{ padding: collapsed?"10px 0":"10px 14px", justifyContent: collapsed?"center":"flex-start" }}
            >
              <Icon size={16}/>
              {!collapsed && <span>{it.label}</span>}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop:"auto", padding: collapsed?"12px 6px":"12px 16px", borderTop:"1px solid var(--border)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent: collapsed?"center":"flex-start" }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,var(--blue-neon),var(--blue-deep))", display:"flex", alignItems:"center", justifyContent:"center", color:"#030812", fontWeight:"bold", fontSize:12, flexShrink:0 }}>
            {user?.charAt(0).toUpperCase() || "A"}
          </div>
          {!collapsed && (
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontSize:12.5, fontWeight:600, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user || "Analyst"}</div>
              <div style={{ fontSize:10, color:"var(--text-faint)" }}>Analyst Level 3</div>
            </div>
          )}
          {!collapsed && (
            <button onClick={onLogout} style={{ background:"none", border:"none", color:"var(--text-faint)", cursor:"pointer", padding:2 }} title="Logout">
              <LogOut size={14}/>
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
  title: string; subtitle: string;
  onUpload: (f: File) => void; dataSource: string;
  onScan: () => void; onExport: () => void;
  user: string;
  dark: boolean;
  setDark: (val: boolean) => void;
}
function TopBar({ title, subtitle, onUpload, dataSource, onScan, onExport, user, dark, setDark }: TopBarProps) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [showBell, setShowBell] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { type:"Critical", text:"Fake ticket domain registered: fifa2026-store.xyz", time:"2m ago" },
    { type:"Warning",  text:"High traffic load detected on pipeline #4",          time:"15m ago" },
    { type:"Info",     text:"Threat database successfully refreshed",              time:"1h ago" },
  ];

  return (
    <div className="topbar">
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div className="font-display" style={{ fontSize:19, fontWeight:700 }}>{title}</div>
          <span className="pulse-dot" title="Live refresh active"/>
          <span style={{ fontSize:10, color:"var(--green)", fontFamily:"var(--mono)" }}>AUTO-REFRESH: 10S</span>
        </div>
        <div className="section-sub">{subtitle}</div>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div className="status-pill" style={{ fontSize:11 }}><Info size={12}/>{dataSource}</div>
        <span style={{ fontSize:11, color:"var(--text-faint)", fontFamily:"var(--mono)" }}>Updated: Just now</span>

        <button className="btn btn-gold" onClick={onScan}><RefreshCw size={13}/>Scan Now</button>

        <div style={{ width:1, height:24, background:"var(--border)", margin:"0 4px" }}/>

        <button onClick={()=>{ setDark(!dark); }} style={{ background:"none", border:"none", color:"var(--text-dim)", cursor:"pointer" }} title="Toggle theme">
          {dark ? <Sun size={15}/> : <Moon size={15}/>}
        </button>

        <button onClick={()=>alert("CyberPitch-FIFA Guide: Upload a threat-intel CSV, filter domains using the controls, or monitor fraudulent ticket price drops.")} style={{ background:"none", border:"none", color:"var(--text-dim)", cursor:"pointer" }} title="Help & Guides">
          <HelpCircle size={15}/>
        </button>

        <div style={{ position:"relative" }}>
          <button onClick={()=>{ setShowBell(!showBell); setShowProfile(false); }} style={{ background:"none", border:"none", color:"var(--text-dim)", cursor:"pointer", position:"relative" }}>
            <Bell size={15}/>
            <span style={{ position:"absolute", top:-4, right:-4, width:14, height:14, borderRadius:"50%", background:"var(--red)", color:"#fff", fontSize:8, fontWeight:"bold", display:"flex", alignItems:"center", justifyContent:"center" }}>3</span>
          </button>
          {showBell && (
            <div style={{ position:"absolute", top:30, right:-10, width:320, background:"rgba(10,25,50,0.97)", border:"1.5px solid var(--blue-neon)", borderRadius:12, padding:12, zIndex:10, boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize:12, fontWeight:700, borderBottom:"1px solid var(--border)", paddingBottom:6, marginBottom:8, display:"flex", justifyContent:"space-between" }}>
                <span>NOTIFICATIONS</span>
                <span style={{ color:"var(--blue-neon)", cursor:"pointer" }} onClick={()=>setShowBell(false)}>Clear all</span>
              </div>
              {notifications.map((n,idx)=>(
                <div key={idx} style={{ fontSize:11.5, borderBottom:"1px solid rgba(255,255,255,0.05)", paddingBottom:6, marginBottom:6 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                    <span style={{ fontWeight:600, color:n.type==="Critical"?"var(--red)":n.type==="Warning"?"var(--amber)":"var(--green)" }}>{n.type}</span>
                    <span style={{ color:"var(--text-faint)" }}>{n.time}</span>
                  </div>
                  <div style={{ color:"var(--text-dim)" }}>{n.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ position:"relative" }}>
          <div onClick={()=>{ setShowProfile(!showProfile); setShowBell(false); }} style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,var(--gold),var(--gold-dim))", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", fontSize:11, color:"#030812" }}>
            {user?.charAt(0).toUpperCase() || "A"}
          </div>
          {showProfile && (
            <div style={{ position:"absolute", top:32, right:0, width:160, background:"rgba(10,25,50,0.97)", border:"1px solid var(--blue-neon)", borderRadius:8, padding:8, zIndex:10, boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize:12, padding:"6px 8px", cursor:"pointer", color:"var(--text)", borderBottom:"1px solid var(--border)" }} onClick={()=>alert("Profile Settings")}>My Profile</div>
              <div style={{ fontSize:12, padding:"6px 8px", cursor:"pointer", color:"var(--text)", borderBottom:"1px solid var(--border)" }} onClick={()=>alert("Security Log")}>Security Log</div>
              <div style={{ fontSize:12, padding:"6px 8px", cursor:"pointer", color:"var(--red)", borderBottom:"1px solid var(--border)" }} onClick={()=>alert("Logged Out")}>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}><LogOut size={12}/>Log Out</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   DASHBOARD PAGE (from your original)
------------------------------------------------------------------*/
function Dashboard({ data }: { data: ThreatRecord[] }) {
  const stats = useMemo(()=>{
    const byType=(t:string)=>data.filter(d=>d.threatType===t).length;
    return { total:data.length, tickets:byType("Ticket Scam"), phishing:byType("Phishing"), streaming:byType("Streaming Piracy"), malware:byType("Malware") };
  },[data]);

  const avgRisk = useMemo(()=>data.length ? Math.round(data.reduce((a,d)=>a+d.riskScore,0)/data.length) : 0,[data]);

  const riskDist = useMemo(()=>{
    const counts:Record<string,number>={High:0,Medium:0,Low:0};
    data.forEach(d=>(counts[d.riskLevel]=(counts[d.riskLevel]||0)+1));
    return [
      {name:"High",   value:counts.High,   color:"#ff2a5f"},
      {name:"Medium", value:counts.Medium, color:"#ff9f1a"},
      {name:"Low",    value:counts.Low,    color:"#00ffd2"},
    ];
  },[data]);

  const countryDist = useMemo(()=>{
    const counts:Record<string,number>={};
    data.forEach(d=>(counts[d.country]=(counts[d.country]||0)+1));
    return Object.entries(counts).map(([country,count])=>({country,count:count as number})).sort((a,b)=>b.count-a.count).slice(0,5);
  },[data]);

  const timelineData = useMemo(()=>{
    const dates=["06-29","06-30","07-01","07-02","07-03","07-04","07-05","07-06"];
    return dates.map((d,idx)=>({ date:d, "Threat Alerts":data.filter(item=>item.detectedDate?.endsWith(d)).length||(12+(idx*3)%7) }));
  },[data]);

  const recent = useMemo(()=>[...data].sort((a,b)=>(b.detectedDate||"").localeCompare(a.detectedDate||"")).slice(0,8),[data]);

  const sparklines = [
    "M0,18 Q15,4 30,14 T60,2 T90,16 L100,8",
    "M0,15 Q15,22 30,5 T60,19 T90,2 L100,12",
    "M0,8 Q15,18 30,3 T60,12 T90,18 L100,5",
    "M0,20 Q15,8 30,16 T60,4 T90,22 L100,15",
    "M0,5 Q15,15 30,8 T60,22 T90,4 L100,18",
  ];

  const statCards = [
    {label:"Total threats detected",    value:stats.total,    icon:ShieldAlert,  color:"var(--gold)",      trend:"+12.4%", up:true,  spark:sparklines[0]},
    {label:"Fake ticketing portals",    value:stats.tickets,  icon:Ticket,       color:"var(--red)",       trend:"+8.1%",  up:true,  spark:sparklines[1]},
    {label:"Phishing campaigns",        value:stats.phishing, icon:AlertTriangle,color:"var(--amber)",     trend:"+3.6%",  up:true,  spark:sparklines[2]},
    {label:"Illegal streaming sites",   value:stats.streaming,icon:Radio,        color:"#4fa3ff",          trend:"-2.0%",  up:false, spark:sparklines[3]},
    {label:"Malware / impersonation",   value:stats.malware,  icon:ShieldCheck,  color:"var(--green)",     trend:"+5.9%",  up:true,  spark:sparklines[4]},
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="stat-grid">
        {statCards.map((s,i)=>{
          const Icon=s.icon;
          return (
            <div className="card stat-card" key={i}>
              <div className="scanline"/>
              <div className="stat-icon" style={{ background:`${s.color}18`, border:`1.5px solid ${s.color}40` }}><Icon size={16} color={s.color}/></div>
              <div className="stat-value" style={{ fontSize:26, fontWeight:800 }}>{s.value.toLocaleString()}</div>
              <div className="stat-label">{s.label}</div>
              <div style={{ height:26, marginTop:10, marginBottom:8 }}>
                <svg viewBox="0 0 100 25" width="100%" height="100%" preserveAspectRatio="none">
                  <path d={s.spark} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" style={{ filter:`drop-shadow(0 2px 4px ${s.color}40)` }}/>
                </svg>
              </div>
              <div className="trend" style={{ color:s.up?"var(--red)":"var(--green)" }}>
                {s.up ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} {s.trend} vs last week
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1.2fr", gap:16 }}>
        <div className="card" style={{ padding:20 }}>
          <div className="section-title"><ShieldAlert size={15} color="var(--gold)"/>Average risk score</div>
          <div className="section-sub">Across all tracked domains &amp; campaigns</div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"18px 0 6px" }}>
            <RiskGauge value={avgRisk}/>
          </div>
        </div>

        <div className="card" style={{ padding:20 }}>
          <div className="section-title"><CircleDot size={15} color="var(--gold)"/>Risk level distribution</div>
          <div className="section-sub">{data.length} records analyzed</div>
          <div style={{ height:170 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={66} paddingAngle={4}>
                  {riskDist.map((entry,idx)=><Cell key={idx} fill={entry.color} stroke="none"/>)}
                </Pie>
                <Tooltip contentStyle={{ background:"rgba(8,17,36,0.95)", border:"1.5px solid var(--blue-neon)", borderRadius:10, fontSize:12, boxShadow:"0 0 15px rgba(0,210,255,0.2)" }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:14, marginTop:-6 }}>
            {riskDist.map(r=>(
              <div key={r.name} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--text-dim)" }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:r.color, display:"inline-block" }}/>{r.name} ({r.value})
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding:20 }}>
          <div className="section-title"><Globe2 size={15} color="var(--gold)"/>Top hosting countries</div>
          <div className="section-sub">Registrant server geographic density</div>
          <div style={{ height:190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryDist} layout="vertical" margin={{ left:0, right:10 }}>
                <CartesianGrid stroke="rgba(0,210,255,0.08)" horizontal={false}/>
                <XAxis type="number" hide/>
                <YAxis dataKey="country" type="category" width={70} tick={{ fill:"#8ea0bc", fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"rgba(8,17,36,0.95)", border:"1.5px solid var(--blue-neon)", borderRadius:10, fontSize:12 }} cursor={{ fill:"rgba(255,215,0,0.06)" }}/>
                <Bar dataKey="count" fill="var(--gold)" radius={[0,4,4,0]} barSize={11}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding:20 }}>
        <div className="section-title"><Bell size={15} color="var(--gold)"/>Threat alert timeline</div>
        <div className="section-sub">Daily detection count — last 8 days</div>
        <div style={{ height:160, marginTop:12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid stroke="rgba(0,210,255,0.06)" vertical={false}/>
              <XAxis dataKey="date" tick={{ fill:"#8ea0bc", fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:"#8ea0bc", fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:"rgba(8,17,36,0.95)", border:"1.5px solid var(--blue-neon)", borderRadius:10, fontSize:12 }}/>
              <Line type="monotone" dataKey="Threat Alerts" stroke="var(--blue-neon)" strokeWidth={2} dot={{ fill:"var(--blue-neon)", r:3 }} activeDot={{ r:5 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)" }}>
          <div className="section-title"><Bell size={15} color="var(--gold)"/>Recent threats feed</div>
          <div className="section-sub">Latest detections across all pipelines</div>
        </div>
        <table>
          <thead><tr><th>Domain / Entity</th><th>Type</th><th>Risk</th><th>Country</th><th>Detected</th><th>Status</th></tr></thead>
          <tbody>
            {recent.map(r=>(
              <tr key={r.id}>
                <td className="domain-name">{r.domain}</td>
                <td><span className="badge badge-neutral">{r.threatType}</span></td>
                <td>{riskBadge(r.riskLevel)}</td>
                <td style={{ color:"var(--text-dim)" }}>{r.country}</td>
                <td className="font-mono" style={{ color:"var(--text-dim)" }}>{r.detectedDate}</td>
                <td><span className={`badge ${r.status==="Blocked"?"badge-low":r.status==="Active"?"badge-high":"badge-medium"}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   DOMAIN INTELLIGENCE PAGE (from your original)
------------------------------------------------------------------*/
function DomainIntel({ data }: { data: ThreatRecord[] }) {
  const [q, setQ] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState<keyof ThreatRecord>("riskScore");
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState<string|null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const filtered = useMemo(()=>{
    let rows = data.filter(d=>{
      if (q && !d.domain.toLowerCase().includes(q.toLowerCase())) return false;
      if (riskFilter !== "All" && d.riskLevel !== riskFilter) return false;
      if (typeFilter !== "All" && d.threatType !== typeFilter) return false;
      if (statusFilter !== "All" && d.status !== statusFilter) return false;
      return true;
    });
    rows = [...rows].sort((a,b)=>{
      const av=a[sortKey], bv=b[sortKey];
      if (typeof av==="number"&&typeof bv==="number") return sortAsc?(av-bv):(bv-av);
      return sortAsc?String(av).localeCompare(String(bv)):String(bv).localeCompare(String(av));
    });
    return rows;
  },[data,q,riskFilter,typeFilter,statusFilter,sortKey,sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);

  function handleSort(key: keyof ThreatRecord){
    if (sortKey===key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
    setPage(0);
  }

  return (
    <div>
      <div className="card" style={{ padding:16, marginBottom:16, display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ position:"relative" }}>
          <Search size={14} style={{ position:"absolute", left:11, top:11, color:"var(--text-faint)" }}/>
          <input className="search" placeholder="Search domain or URL…" value={q} onChange={e=>{setQ(e.target.value);setPage(0);}}/>
        </div>
        <select className="filter" value={riskFilter} onChange={e=>{setRiskFilter(e.target.value);setPage(0);}}>
          <option>All</option><option>High</option><option>Medium</option><option>Low</option>
        </select>
        <select className="filter" value={typeFilter} onChange={e=>{setTypeFilter(e.target.value);setPage(0);}}>
          <option>All</option>{THREAT_TYPES.map(t=><option key={t}>{t}</option>)}
        </select>
        <select className="filter" value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(0);}}>
          <option>All</option>{STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
        <button className="btn" onClick={()=>{setQ("");setRiskFilter("All");setTypeFilter("All");setStatusFilter("All");setPage(0);}}>
          <X size={13}/>Clear Filters
        </button>
        <div style={{ marginLeft:"auto", fontSize:12, color:"var(--text-dim)", fontFamily:"var(--mono)" }}>
          {filtered.length} of {data.length} domains
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th></th>
              <th className="sortable" onClick={()=>handleSort("domain")}>Domain {sortKey==="domain"?(sortAsc?"↑":"↓"):""}</th>
              <th>Threat type</th>
              <th className="sortable" onClick={()=>handleSort("riskScore")}>Risk score {sortKey==="riskScore"?(sortAsc?"↑":"↓"):""}</th>
              <th className="sortable" onClick={()=>handleSort("ageDays")}>Age {sortKey==="ageDays"?(sortAsc?"↑":"↓"):""}</th>
              <th>SSL</th>
              <th>Country</th>
              <th className="sortable" onClick={()=>handleSort("similarityScore")}>Similarity {sortKey==="similarityScore"?(sortAsc?"↑":"↓"):""}</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(d=>(
              <React.Fragment key={d.id}>
                <tr onClick={()=>setExpanded(expanded===d.id?null:d.id)}>
                  <td style={{ width:20 }}>{expanded===d.id?<ChevronDown size={14} color="var(--text-dim)"/>:<ChevronRight size={14} color="var(--text-dim)"/>}</td>
                  <td className="domain-name">{d.domain}</td>
                  <td><span className="badge badge-neutral">{d.threatType}</span></td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div className="risk-bar-track"><div className="risk-bar-fill" style={{ width:`${d.riskScore}%`, background:RISK_COLOR[d.riskLevel] }}/></div>
                      <span className="font-mono" style={{ fontSize:11.5, color:RISK_COLOR[d.riskLevel] }}>{d.riskScore}</span>
                    </div>
                  </td>
                  <td className="font-mono" style={{ color:"var(--text-dim)" }}>{d.ageDays}d</td>
                  <td>{sslBadge(d.sslStatus)}</td>
                  <td style={{ color:"var(--text-dim)" }}>{d.country}</td>
                  <td className="font-mono" style={{ color:"var(--text-dim)" }}>{d.similarityScore?`${d.similarityScore}%`:"—"}</td>
                  <td><span className={`badge ${d.status==="Blocked"?"badge-low":d.status==="Active"?"badge-high":"badge-medium"}`}>{d.status}</span></td>
                </tr>
                {expanded===d.id && (
                  <tr style={{ cursor:"default" }}>
                    <td colSpan={9} style={{ background:"rgba(15,32,67,0.6)", padding:"16px 30px" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, fontSize:12 }}>
                        <div><div style={{ color:"var(--text-faint)", marginBottom:4 }}>Registration date</div><div className="font-mono">{d.registrationDate}</div></div>
                        <div><div style={{ color:"var(--text-faint)", marginBottom:4 }}>Registrar</div><div>{d.registrar}</div></div>
                        <div><div style={{ color:"var(--text-faint)", marginBottom:4 }}>Detected on</div><div className="font-mono">{d.detectedDate}</div></div>
                        <div><div style={{ color:"var(--text-faint)", marginBottom:4 }}>Data source</div><div>{d.source}</div></div>
                      </div>
                      {d.redFlags?.length>0 && (
                        <div style={{ marginTop:14 }}>
                          <div style={{ color:"var(--text-faint)", marginBottom:6, fontSize:12 }}>Red flags</div>
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            {d.redFlags.map((f,i)=><span key={i} className="flag-chip">{f}</span>)}
                          </div>
                        </div>
                      )}
                      <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:12 }}>
                        <button className="btn" style={{ fontSize:12, padding:"6px 12px" }} onClick={()=>alert(`Investigating: ${d.domain}`)}>
                          <ExternalLink size={12}/>Investigate
                        </button>
                        <button className="btn" style={{ fontSize:12, padding:"6px 12px", color:"var(--red)", borderColor:"rgba(255,42,95,0.35)" }} onClick={()=>alert(`Blocking: ${d.domain}`)}>
                          <X size={12}/>Block Domain
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <div className="empty-state">No domains match those filters.</div>}
        {filtered.length>0 && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderTop:"1px solid var(--border)" }}>
            <span style={{ fontSize:12, color:"var(--text-dim)", fontFamily:"var(--mono)" }}>
              Page {page+1} of {totalPages} &nbsp;·&nbsp; {filtered.length} results
            </span>
            <div style={{ display:"flex", gap:8 }}>
              <button className="pagination-btn" onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}>← Prev</button>
              <button className="pagination-btn" onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   TICKETING FRAUD PAGE (from your original)
------------------------------------------------------------------*/
function TicketingFraud({ data }: { data: ThreatRecord[] }) {
  const tickets = useMemo(()=>data.filter(d=>d.threatType==="Ticket Scam"),[data]);
  const totals = useMemo(()=>({
    portals: tickets.length,
    loss:    tickets.reduce((a,t)=>a+(t.estimatedLoss||0),0),
    victims: tickets.reduce((a,t)=>a+(t.affectedUsers||0),0),
  }),[tickets]);



  const flagFreq=useMemo(()=>{
    const counts:Record<string,number>={};
    tickets.forEach(t=>(t.redFlags||[]).forEach(f=>(counts[f]=(counts[f]||0)+1)));
    return Object.entries(counts).map(([flag,count])=>({flag,count:count as number})).sort((a,b)=>b.count-a.count).slice(0,6);
  },[tickets]);

  // Custom X-axis tick: wraps label at spaces into ≤2 lines, fully visible
  const FlagTick = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) => {
    const text = payload?.value || "";
    const words = text.split(" ");
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(" ");
    const line2 = words.slice(mid).join(" ");
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={22} textAnchor="middle" fill="#8ea0bc" fontSize={10} fontFamily="inherit">
          <tspan x={0} dy={0}>{line1}</tspan>
          {line2 && <tspan x={0} dy={14}>{line2}</tspan>}
        </text>
      </g>
    );
  };

  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"60% 40%", gap:16, marginBottom:16 }}>
        {/* Most common red flags chart — vertical bars (60%) */}
        <div className="card" style={{ padding:20 }}>
          <div className="section-title">Most common red flags</div>
          <div className="section-sub">Across all detected ticketing scams</div>
          <div style={{ height:260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flagFreq} margin={{ top:8, right:16, left:0, bottom:50 }}>
                <CartesianGrid stroke="rgba(0,210,255,0.06)" vertical={false}/>
                <XAxis dataKey="flag" type="category" tick={<FlagTick/>} axisLine={false} tickLine={false} interval={0} height={50}/>
                <YAxis type="number" hide/>
                <Tooltip contentStyle={{ background:"rgba(8,17,36,0.95)", border:"1.5px solid var(--blue-neon)", borderRadius:10, fontSize:12 }} cursor={{ fill:"rgba(255,215,0,0.06)" }}/>
                <Bar dataKey="count" fill="var(--gold)" radius={[4,4,0,0]} barSize={28}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fake portals detected stat card (40%) */}
        {[
          {label:"Fake portals detected", value:totals.portals, icon:Ticket, color:"var(--red)", fmt:(v:number)=>v.toLocaleString()},
        ].map((s,i)=>{
          const Icon=s.icon;
          return (
            <div className="card stat-card" key={i} style={{ display:"flex", flexDirection:"column", justifyContent:"center" }}>
              <div className="scanline"/>
              <div className="stat-icon" style={{ background:`${s.color}18`, border:`1.5px solid ${s.color}40` }}><Icon size={16} color={s.color}/></div>
              <div className="stat-value">{s.fmt(s.value)}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)" }}>
          <div className="section-title">Detected fake ticketing portals</div>
          <div className="section-sub">{tickets.length} portals flagged</div>
        </div>
        <table>
          <thead><tr><th>Domain</th><th>Risk</th><th>Listed price</th><th>Official price</th><th>Red flags</th><th>Est. loss</th><th>Status</th></tr></thead>
          <tbody>
            {tickets.slice(0,40).map(t=>(
              <tr key={t.id}>
                <td className="domain-name">{t.domain}</td>
                <td>{riskBadge(t.riskLevel)}</td>
                <td className="font-mono" style={{ color:"var(--red)" }}>{t.scamPrice?`$${t.scamPrice}`:"—"}</td>
                <td className="font-mono" style={{ color:"var(--text-dim)" }}>{t.officialPrice?`$${t.officialPrice}`:"—"}</td>
                <td>
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap", maxWidth:240 }}>
                    {(t.redFlags||[]).slice(0,2).map((f,i)=><span key={i} className="flag-chip">{f}</span>)}
                    {t.redFlags?.length>2 && <span className="flag-chip">+{t.redFlags.length-2}</span>}
                  </div>
                </td>
                <td className="font-mono">${(t.estimatedLoss||0).toLocaleString()}</td>
                <td><span className={`badge ${t.status==="Blocked"?"badge-low":t.status==="Active"?"badge-high":"badge-medium"}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length===0 && <div className="empty-state">No ticket-scam records in the current dataset.</div>}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------
   SOCIAL & OSINT PAGE
------------------------------------------------------------------*/
function SocialOSINT({ data }: { data: ThreatRecord[] }) {
  const osintStats = useMemo(() => {
    const totalReports = data.reduce((acc, d) => acc + (d.osintReportCount || 0), 0);
    const avgReports = data.length ? Math.round(totalReports / data.length) : 0;
    const countries = [...new Set(data.map(d => d.country))];
    const topCountries = data
      .filter(d => (d.osintReportCount || 0) > 0)
      .reduce((acc: Record<string, number>, d) => {
        acc[d.country] = (acc[d.country] || 0) + (d.osintReportCount || 0);
        return acc;
      }, {});
    const sorted = Object.entries(topCountries).sort((a,b) => b[1] - a[1]).slice(0,5).map(([c,count]) => ({ country:c, count }));
    return { totalReports, avgReports, countries: countries.length, topCountries: sorted };
  }, [data]);

  const blacklistFreq = useMemo(() => {
    const counts: Record<string,number> = {};
    data.forEach(d => { const s = d.blacklistSource || 'Unknown'; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([s,c]) => ({ source:s, count:c })).sort((a,b) => b.count - a.count).slice(0,6);
  }, [data]);

  const socialMentions = useMemo(() => {
    const total = data.reduce((acc,d) => acc + (d.socialMediaMentions || 0), 0);
    return { total, avg: data.length ? Math.round(total / data.length) : 0 };
  }, [data]);

  return (
    <div>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: "rgba(0,210,255,0.1)", border: "1px solid rgba(0,210,255,0.3)" }}>
            <Database size={16} color="var(--blue-neon)" />
          </div>
          <div className="stat-value">{osintStats.totalReports}</div>
          <div className="stat-label">Total OSINT Reports</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: "rgba(255,159,26,0.1)", border: "1px solid rgba(255,159,26,0.3)" }}>
            <Globe2 size={16} color="var(--amber)" />
          </div>
          <div className="stat-value">{osintStats.countries}</div>
          <div className="stat-label">Countries Covered</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: "rgba(255,42,95,0.1)", border: "1px solid rgba(255,42,95,0.3)" }}>
            <Users size={16} color="var(--red)" />
          </div>
          <div className="stat-value">{socialMentions.total}</div>
          <div className="stat-label">Social Media Mentions</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <div className="card" style={{ padding:20 }}>
          <div className="section-title">Top OSINT Sources by Country</div>
          <div className="section-sub">Number of reports per country</div>
          <div style={{ height:190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={osintStats.topCountries} layout="vertical" margin={{ left:0, right:10 }}>
                <CartesianGrid stroke="rgba(0,210,255,0.06)" horizontal={false}/>
                <XAxis type="number" hide/>
                <YAxis dataKey="country" type="category" width={70} tick={{ fill:"#8ea0bc", fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"rgba(8,17,36,0.95)", border:"1.5px solid var(--blue-neon)", borderRadius:10, fontSize:12 }} cursor={{ fill:"rgba(0,210,255,0.06)" }}/>
                <Bar dataKey="count" fill="var(--blue-neon)" radius={[0,4,4,0]} barSize={11}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ padding:20 }}>
          <div className="section-title">Blacklist Sources</div>
          <div className="section-sub">Most frequently reported sources</div>
          <div style={{ height:190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blacklistFreq}>
                <CartesianGrid stroke="rgba(0,210,255,0.06)" vertical={false}/>
                <XAxis dataKey="source" tick={{ fill:"#8ea0bc", fontSize:10 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:"#8ea0bc", fontSize:10 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"rgba(8,17,36,0.95)", border:"1.5px solid var(--blue-neon)", borderRadius:10, fontSize:12 }} cursor={{ fill:"rgba(0,255,210,0.06)" }}/>
                <Bar dataKey="count" fill="var(--gold)" radius={[4,4,0,0]} barSize={14}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)" }}>
          <div className="section-title"><Bell size={15} color="var(--blue-neon)"/>OSINT Feed</div>
          <div className="section-sub">Recent intelligence from OSINT sources</div>
        </div>
        <table>
          <thead><tr><th>Domain</th><th>OSINT Reports</th><th>Social Mentions</th><th>Blacklist Source</th><th>Country</th><th>Risk</th></tr></thead>
          <tbody>
            {data.slice(0,15).map(d=>(
              <tr key={d.id}>
                <td className="domain-name">{d.domain}</td>
                <td className="font-mono">{d.osintReportCount || 0}</td>
                <td className="font-mono">{d.socialMediaMentions || 0}</td>
                <td><span className="badge badge-neutral">{d.blacklistSource || '—'}</span></td>
                <td style={{ color:"var(--text-dim)" }}>{d.country}</td>
                <td>{riskBadge(d.riskLevel)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   STREAMING PIRACY PAGE
------------------------------------------------------------------*/
function StreamingPiracy({ data }: { data: ThreatRecord[] }) {
  const streaming = useMemo(() => data.filter(d => d.threatType === "Streaming Piracy"), [data]);
  const stats = useMemo(() => ({
    total: streaming.length,
    avgRisk: streaming.length ? Math.round(streaming.reduce((a,d) => a + d.riskScore, 0) / streaming.length) : 0,
    countries: [...new Set(streaming.map(d => d.country))].length,
  }), [streaming]);

  const countryDist = useMemo(() => {
    const counts: Record<string,number> = {};
    streaming.forEach(d => counts[d.country] = (counts[d.country] || 0) + 1);
    return Object.entries(counts).map(([c,count]) => ({ country:c, count })).sort((a,b) => b.count - a.count).slice(0,6);
  }, [streaming]);

  return (
    <div>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: "rgba(255,42,95,0.1)", border: "1px solid rgba(255,42,95,0.3)" }}>
            <Radio size={16} color="var(--red)" />
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Illegal Streaming Sites</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)" }}>
            <Shield size={16} color="var(--gold)" />
          </div>
          <div className="stat-value">{stats.avgRisk}</div>
          <div className="stat-label">Average Risk Score</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: "rgba(0,255,210,0.1)", border: "1px solid rgba(0,255,210,0.3)" }}>
            <Globe2 size={16} color="var(--green)" />
          </div>
          <div className="stat-value">{stats.countries}</div>
          <div className="stat-label">Countries Hosting</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <div className="card" style={{ padding:20 }}>
          <div className="section-title">Streaming Sites by Country</div>
          <div className="section-sub">Top hosting countries</div>
          <div style={{ height:190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryDist} layout="vertical" margin={{ left:0, right:10 }}>
                <CartesianGrid stroke="rgba(0,210,255,0.06)" horizontal={false}/>
                <XAxis type="number" hide/>
                <YAxis dataKey="country" type="category" width={70} tick={{ fill:"#8ea0bc", fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"rgba(8,17,36,0.95)", border:"1.5px solid var(--blue-neon)", borderRadius:10, fontSize:12 }} cursor={{ fill:"rgba(255,42,95,0.06)" }}/>
                <Bar dataKey="count" fill="var(--red)" radius={[0,4,4,0]} barSize={11}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ padding:20 }}>
          <div className="section-title">Risk Distribution</div>
          <div className="section-sub">Across streaming sites</div>
          <div style={{ height:190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name:"High", value:streaming.filter(d=>d.riskLevel==="High").length, color:"var(--red)" },
                  { name:"Medium", value:streaming.filter(d=>d.riskLevel==="Medium").length, color:"var(--amber)" },
                  { name:"Low", value:streaming.filter(d=>d.riskLevel==="Low").length, color:"var(--green)" },
                ]} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60} paddingAngle={3}>
                  {[0,1,2].map(i => <Cell key={i} fill={["var(--red)","var(--amber)","var(--green)"][i]} stroke="none"/>)}
                </Pie>
                <Tooltip contentStyle={{ background:"rgba(8,17,36,0.95)", border:"1.5px solid var(--blue-neon)", borderRadius:10, fontSize:12 }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)" }}>
          <div className="section-title">Detected Illegal Streaming Sites</div>
          <div className="section-sub">Sites flagged for piracy</div>
        </div>
        <table>
          <thead><tr><th>Domain</th><th>Risk</th><th>SSL</th><th>Country</th><th>Similarity</th><th>Status</th></tr></thead>
          <tbody>
            {streaming.slice(0,20).map(d=>(
              <tr key={d.id}>
                <td className="domain-name">{d.domain}</td>
                <td>{riskBadge(d.riskLevel)}</td>
                <td>{sslBadge(d.sslStatus)}</td>
                <td style={{ color:"var(--text-dim)" }}>{d.country}</td>
                <td className="font-mono">{d.similarityScore}%</td>
                <td><span className={`badge ${d.status==="Blocked"?"badge-low":d.status==="Active"?"badge-high":"badge-medium"}`}>{d.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {streaming.length===0 && <div className="empty-state">No streaming piracy records found.</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ALERTS PAGE
------------------------------------------------------------------*/
function AlertsPage({ data }: { data: ThreatRecord[] }) {
  const [filter, setFilter] = useState("All");
  const alerts = useMemo(() => {
    return data
      .filter(d => d.riskLevel === "High" || d.riskLevel === "Medium")
      .slice(0,25)
      .map((d, i) => ({
        id: d.id,
        domain: d.domain,
        threatType: d.threatType,
        riskScore: d.riskScore,
        riskLevel: d.riskLevel,
        timestamp: `2026-0${Math.floor(Math.random()*6)+1}-${String(Math.floor(Math.random()*28)+1).padStart(2,"0")} ${String(Math.floor(Math.random()*24)).padStart(2,"0")}:${String(Math.floor(Math.random()*60)).padStart(2,"0")}`,
        status: ["Pending", "Acknowledged", "Blocked"][Math.floor(Math.random()*3)],
      }))
      .filter(a => filter === "All" ? true : a.riskLevel === filter);
  }, [data, filter]);

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <h2 className="font-display" style={{ fontSize:20, fontWeight:600 }}>Threat Alerts</h2>
        <div style={{ display:"flex", gap:8 }}>
          {["All","High","Medium","Low"].map(l => (
            <div key={l} className={`btn ${filter === l ? "btn-gold" : ""}`} onClick={() => setFilter(l)} style={{ padding:"4px 14px", fontSize:12 }}>
              {l}
            </div>
          ))}
        </div>
        <div style={{ marginLeft:"auto", fontSize:12, color:"var(--text-dim)", fontFamily:"var(--mono)" }}>
          {alerts.length} alerts
        </div>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Domain</th><th>Threat Type</th><th>Risk Score</th><th>Severity</th><th>Timestamp</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a.id}>
                <td className="domain-name">{a.domain}</td>
                <td>{a.threatType}</td>
                <td className="font-mono">{a.riskScore}</td>
                <td>{riskBadge(a.riskLevel)}</td>
                <td className="font-mono" style={{ color:"var(--text-dim)" }}>{a.timestamp}</td>
                <td><span className={`badge ${a.status==="Blocked"?"badge-low":a.status==="Acknowledged"?"badge-medium":"badge-high"}`}>{a.status}</span></td>
                <td>
                  <div className="btn" style={{ padding:"2px 10px", fontSize:11 }} onClick={() => alert(`Acknowledge ${a.domain}`)}>
                    Acknowledge
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {alerts.length===0 && <div className="empty-state">No alerts for this filter.</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SETTINGS PAGE
------------------------------------------------------------------*/
function SettingsPage({ user }: { user: string }) {
  const [threshold, setThreshold] = useState(70);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [apiKey, setApiKey] = useState("sk-••••••••••••••••");
  const [theme, setTheme] = useState("dark");

  return (
    <div>
      <h2 className="font-display" style={{ fontSize:20, fontWeight:600, marginBottom:20 }}>Settings</h2>

      <div className="card" style={{ padding:24, marginBottom:16 }}>
        <div className="section-title"><UserPlus size={16} color="var(--gold)"/> User Profile</div>
        <div className="section-sub" style={{ marginBottom:16 }}>Logged in as <span className="font-mono" style={{ color:"var(--gold)" }}>{user}</span></div>
        <div className="btn btn-gold" onClick={() => alert("Edit profile")}>Edit Profile</div>
      </div>

      <div className="card" style={{ padding:24, marginBottom:16 }}>
        <div className="section-title"><Percent size={16} color="var(--gold)"/> Threat Thresholds</div>
        <div className="section-sub">Risk score above which a domain is considered High Risk</div>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginTop:12 }}>
          <input type="range" min="0" max="100" value={threshold} onChange={e => setThreshold(Number(e.target.value))} style={{ flex:1, accentColor:"var(--blue-neon)" }} />
          <span className="font-mono" style={{ fontSize:18, fontWeight:600, color:"var(--blue-neon)" }}>{threshold}</span>
        </div>
      </div>

      <div className="card" style={{ padding:24, marginBottom:16 }}>
        <div className="section-title"><Bell size={16} color="var(--gold)"/> Notifications</div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:12 }}>
          <input type="checkbox" checked={notifyEmail} onChange={() => setNotifyEmail(!notifyEmail)} style={{ width:18, height:18, accentColor:"var(--blue-neon)" }} />
          <span>Email alerts for new critical threats</span>
        </div>
      </div>

      <div className="card" style={{ padding:24 }}>
        <div className="section-title"><Key size={16} color="var(--gold)"/> API Keys</div>
        <div className="section-sub" style={{ marginBottom:12 }}>Your current API key</div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <code className="font-mono" style={{ background:"rgba(0,210,255,0.05)", padding:"6px 12px", borderRadius:6, flex:1, border:"1px solid var(--border)" }}>{apiKey}</code>
          <div className="btn" onClick={() => alert("Backend API not connected: API Key generation must be handled securely on the server.")}>Regenerate</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   LOGIN PAGE
------------------------------------------------------------------*/
function LoginPage({ onLogin, setShowSignup }: { onLogin: (user: string) => void; setShowSignup: (show: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      const user = email.split("@")[0];
      onLogin(user);
    }
  };

  return (
    <div className="stg-root" style={{ justifyContent:"center", alignItems:"center", minHeight:"100vh" }}>
      <div className="hexbg" />
      <div className="auth-container">
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <div className="brand-mark" style={{ width:40, height:40 }}><Shield size={20} color="#030812" /></div>
          <div>
            <div className="font-display" style={{ fontSize:18, fontWeight:700, background:"linear-gradient(135deg,var(--gold),#ff9f1a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CyberPitch-FIFA</div>
            <div style={{ fontSize:10, color:"var(--text-dim)" }}>FIFA THREAT INTEL</div>
          </div>
        </div>
        <h1>Welcome back</h1>
        <div className="sub">Sign in to access the threat intelligence dashboard</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label className="auth-label">Email</label>
            <input type="email" className="auth-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom:16 }}>
            <label className="auth-label">Password</label>
            <div style={{ position:"relative" }}>
              <input type={showPwd ? "text" : "password"} className="auth-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              <div style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", cursor:"pointer" }} onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} color="var(--text-dim)" /> : <Eye size={16} color="var(--text-dim)" />}
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-gold" style={{ width:"100%", justifyContent:"center", padding:12 }}>
            <LogIn size={16} /> Sign In
          </button>
        </form>
        <div style={{ marginTop:16, textAlign:"center", fontSize:14, color:"var(--text-dim)" }}>
          Don't have an account? <span className="auth-link" onClick={() => setShowSignup(true)}>Sign Up</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SIGNUP PAGE
------------------------------------------------------------------*/
function SignupPage({ onLogin, setShowSignup }: { onLogin: (user: string) => void; setShowSignup: (show: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && name) {
      const user = email.split("@")[0];
      onLogin(user);
    }
  };

  return (
    <div className="stg-root" style={{ justifyContent:"center", alignItems:"center", minHeight:"100vh" }}>
      <div className="hexbg" />
      <div className="auth-container">
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <div className="brand-mark" style={{ width:40, height:40 }}><Shield size={20} color="#030812" /></div>
          <div>
            <div className="font-display" style={{ fontSize:18, fontWeight:700, background:"linear-gradient(135deg,var(--gold),#ff9f1a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CyberPitch-FIFA</div>
            <div style={{ fontSize:10, color:"var(--text-dim)" }}>FIFA THREAT INTEL</div>
          </div>
        </div>
        <h1>Create account</h1>
        <div className="sub">Start monitoring FIFA threats today</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label className="auth-label">Full Name</label>
            <input type="text" className="auth-input" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div style={{ marginBottom:16 }}>
            <label className="auth-label">Email</label>
            <input type="email" className="auth-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom:16 }}>
            <label className="auth-label">Password</label>
            <input type="password" className="auth-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-gold" style={{ width:"100%", justifyContent:"center", padding:12 }}>
            <UserPlus size={16} /> Create Account
          </button>
        </form>
        <div style={{ marginTop:16, textAlign:"center", fontSize:14, color:"var(--text-dim)" }}>
          Already have an account? <span className="auth-link" onClick={() => setShowSignup(false)}>Sign In</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ROOT APP
------------------------------------------------------------------*/
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [data, setData] = useState<ThreatRecord[]>(()=>generateMockData(180));
  const [dataSource, setDataSource] = useState("Mock dataset · 180 records");
  const [uploadError, setUploadError] = useState<string|null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dark, setDark] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    setIsLoggedIn(localStorage.getItem('cyberpitch_isLoggedIn') === 'true');
    setUser(localStorage.getItem('cyberpitch_user') || "");
    const savedTheme = localStorage.getItem('cyberpitch_theme');
    if (savedTheme === 'light') {
      setDark(false);
    }
  }, []);

  const handleLogin = (username: string) => {
    setUser(username);
    setIsLoggedIn(true);
    setPage("dashboard");
    if (typeof window !== 'undefined') {
      localStorage.setItem('cyberpitch_user', username);
      localStorage.setItem('cyberpitch_isLoggedIn', 'true');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser("");
    setPage("dashboard");
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cyberpitch_user');
      localStorage.removeItem('cyberpitch_isLoggedIn');
    }
  };

  const handleUpload = useCallback((file: File) => {
    setUploadError(null);
    Papa.parse<Record<string,string>>(file, {
      header: true, skipEmptyLines: true, dynamicTyping: true,
      complete: async (results) => {
        try {
          const raw = results.data as Record<string,string>[];
          const domains = raw.filter(r => !!r.domain).map(r => r.domain);
          if (domains.length === 0) throw new Error("empty");
          
          setDataSource(`Analyzing ${domains.length} domains...`);
          
          const newRecords: ThreatRecord[] = [];
          
          // Process sequentially to not overload the ML backend
          for (let i = 0; i < domains.length; i++) {
            const domain = domains[i];
            try {
              const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain }),
              });
              if (!res.ok) continue;
              const { data: mlResult } = await res.json();
              
              const prob = mlResult["Phishing Probability"] || 0;
              const riskScore = Math.round(prob * 100);
              
              newRecords.push({
                id: `CSV-${1000+i}`,
                domain: domain,
                threatType: mlResult["Malware Signature Match"] ? "Malware" : "Phishing",
                riskScore: riskScore,
                riskLevel: riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low",
                registrationDate: "—",
                ageDays: mlResult["WHOIS Age Days"] || 0,
                registrar: "Unknown",
                country: mlResult["Hosting Country"] || "Unknown",
                sslStatus: mlResult["SSL Status"] || "Unknown",
                similarityScore: Math.round((mlResult["Visual Match"] || 0) * 100),
                detectedDate: new Date().toISOString().split('T')[0],
                status: riskScore >= 70 ? "Blocked" : "Active",
                estimatedLoss: 0, affectedUsers: 0, officialPrice: null, scamPrice: null, redFlags: [], source: "CSV ML Scan"
              });
            } catch (err) {
              console.error(`Failed to analyze ${domain}`, err);
            }
          }
          
          if (newRecords.length > 0) {
            setData(newRecords);
            setDataSource(`${file.name} · ${newRecords.length} records analyzed`);
          } else {
            setUploadError("Failed to analyze any domains from the CSV.");
            setDataSource("Mock dataset");
          }
        } catch { setUploadError("Invalid CSV Format. Please upload a CSV with a single header row containing the exact column 'domain'."); }
      },
      error: (err) => setUploadError(`Error reading file: ${err.message}`),
    });
  }, []);

  const handleScan = useCallback(() => {
    setPage("scan");
  }, []);
  const handleExport = useCallback(()=>{
    const csv = ["id,domain,threatType,riskScore,riskLevel,country,status", ...data.slice(0,50).map(d=>`${d.id},${d.domain},${d.threatType},${d.riskScore},${d.riskLevel},${d.country},${d.status}`)].join("\n");
    const a = document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="cyberpitch-fifa-export.csv"; a.click();
  },[data]);

  const pageTitles: Record<string, [string,string]> = {
    dashboard: ["Threat Overview", "Real-time snapshot across all detection pipelines"],
    scan:      ["Real-time Threat Scanner", "Analyze any domain through the CyberPitch-FIFA pipeline"],
    domains:   ["Domain Threat Intelligence", "Detect & analyze fraudulent FIFA domains"],
    tickets:   ["Ticketing Fraud Monitor", "Fake portals, pricing anomalies & victim impact"],
    social:    ["Social & OSINT Intelligence", "Social mentions, OSINT reports & blacklist feeds"],
    streaming: ["Streaming Piracy Monitor", "Illegal streaming sites & risk assessment"],
    alerts:    ["Threat Alerts", "Live feed of critical and high‑risk threats"],
    settings:  ["Settings", "User preferences, thresholds and API keys"],
  };

  /* ---------------------------------------------------------------
     SCAN VIEW COMPONENT (Neon Styled)
  ------------------------------------------------------------------*/
  function ScanView() {
    const [scanDomain, setScanDomain] = useState("");
    const [scanLoading, setScanLoading] = useState(false);
    const [scanResult, setScanResult] = useState<any>(null);
    const [scanError, setScanError] = useState<string|null>(null);
    const [activeStep, setActiveStep] = useState(0);
    const [batchProgress, setBatchProgress] = useState<{current: number, total: number} | null>(null);
    const [batchResults, setBatchResults] = useState<any[] | null>(null);

    useEffect(() => {
      if (!scanLoading) { setActiveStep(0); return; }
      const int = setInterval(() => setActiveStep(s => s < 5 ? s + 1 : s), 400);
      return () => clearInterval(int);
    }, [scanLoading]);

    const PIPELINE_STEPS = [
      { name: "Lexical & URL Parser", desc: "Analyzing TLD, typosquatting distances, and character patterns", icon: Search },
      { name: "WHOIS Registry Lookup", desc: "Checking domain age, registrar history, and privacy flags", icon: Globe },
      { name: "DNS Resolution Module", desc: "Resolving A, AAAA, MX, and TXT records", icon: Server },
      { name: "SSL Certificate Validation", desc: "Checking issuer trust, expiration, and SAN lists", icon: ShieldCheck },
      { name: "Visual Similarity Match", desc: "Comparing page screenshots against known FIFA templates", icon: Image },
      { name: "ML Threat Scoring", desc: "Aggregating signals into final probability matrix", icon: Cpu }
    ];

    const handleBatchScan = (file: File) => {
      setScanLoading(true);
      setScanError("Batch processing started. This may take a moment...");
      setBatchProgress(null);
      setBatchResults(null);
      setScanResult(null);

      Papa.parse<Record<string,string>>(file, {
        header: true, skipEmptyLines: true, dynamicTyping: true,
        complete: async (results) => {
          try {
            const raw = results.data as Record<string,string>[];
            const domains = raw.filter(r => !!r.domain).map(r => r.domain);
            if (domains.length === 0) throw new Error("empty");
            
            setBatchProgress({ current: 0, total: domains.length });
            const newRecordsObj = [];
            const newRecordsCsv = [];
            
            for (let i = 0; i < domains.length; i++) {
              const domain = domains[i];
              try {
                const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain }) });
                if (!res.ok) continue;
                const { data: mlResult } = await res.json();
                const prob = mlResult["Phishing Probability"] || 0;
                const riskScore = Math.round(prob * 100);
                
                const rec = {
                  id: `CSV-${1000+i}`, domain,
                  threatType: mlResult["Malware Signature Match"] ? "Malware" : "Phishing",
                  riskScore, riskLevel: riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low",
                  country: mlResult["Hosting Country"] || "Unknown", status: riskScore >= 70 ? "Blocked" : "Active"
                };
                newRecordsObj.push(rec);
                newRecordsCsv.push(`${rec.id},${rec.domain},${rec.threatType},${rec.riskScore},${rec.riskLevel},${rec.country},${rec.status}`);
              } catch (err) {}
              setBatchProgress({ current: i + 1, total: domains.length });
            }
            
            if (newRecordsCsv.length > 0) {
              const csv = ["id,domain,threatType,riskScore,riskLevel,country,status", ...newRecordsCsv].join("\n");
              const a = document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="cyberpitch-fifa-batch-results.csv"; a.click();
              setScanError("Batch scan complete. Results downloaded automatically.");
              setBatchResults(newRecordsObj);
            } else {
              setScanError("Failed to analyze any domains from the CSV.");
            }
          } catch { setScanError("Invalid CSV Format. Requires 'domain' column."); }
          finally { setScanLoading(false); setBatchProgress(null); }
        },
        error: (err) => { setScanError(`Error reading file: ${err.message}`); setScanLoading(false); setBatchProgress(null); },
      });
    };

    const runScan = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!scanDomain.trim()) return;
      setScanLoading(true); setScanError(null); setScanResult(null); setBatchResults(null);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: scanDomain.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Scan failed");
        setScanResult(data.data);
      } catch (err: any) {
        setScanError(err.message);
      } finally {
        setScanLoading(false);
      }
    };

    return (
      <div style={{ display:"flex", flexDirection:"column", gap:24, maxWidth: 900 }}>
        <div className="card" style={{ padding:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <ShieldAlert size={24} color="var(--blue-neon)"/> 
            <div>
              <div style={{ fontSize:16, fontWeight:600, color:"var(--text)" }}>Domain Scanner Engine</div>
              <div style={{ fontSize:12, color:"var(--text-dim)" }}>Run a comprehensive analysis through CyberPitch-FIFA's ML pipeline</div>
            </div>
          </div>
            {!scanResult ? (
              <form onSubmit={runScan} style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                <input type="text" className="search" style={{ flex:1, minWidth:250 }} placeholder="Enter domain (e.g. fifa-rewards-claims.com)" value={scanDomain} onChange={e=>setScanDomain(e.target.value)} required />
                <button type="submit" className="btn btn-gold" disabled={scanLoading}>
                  {scanLoading ? <RefreshCw size={14} className="animate-spin" style={{ animation:"spin 1s linear infinite" }}/> : <Play size={14}/>}
                  {scanLoading ? "Scanning..." : "Start Scan"}
                </button>
                <div style={{ color: "var(--text-faint)", fontSize: 12, padding: "0 8px" }}>OR</div>
                <input id="scan-csv-upload" type="file" accept=".csv" style={{ display:"none" }} onChange={(e)=>{ const f=e.target.files?.[0]; if(f) handleBatchScan(f); }}/>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  <button type="button" className="btn" onClick={()=>document.getElementById("scan-csv-upload")?.click()}><Upload size={14}/>Batch CSV Upload</button>
                  <div style={{ fontSize: 9.5, color: "var(--text-faint)", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>Requires 'domain' column</div>
                </div>
              </form>
            ) : null}

            {scanLoading && (
              <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:24 }}>
                {batchProgress && (
                  <div style={{ textAlign:"center", fontSize:14, color:"var(--blue-neon)", fontWeight:600, padding: 12, border: "1px dashed var(--blue-neon)", borderRadius: 8 }}>
                    Batch Processing in Progress: Analyzed {batchProgress.current} out of {batchProgress.total} domains...
                  </div>
                )}
                {PIPELINE_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const status = idx < activeStep ? "success" : idx === activeStep ? "running" : "idle";
                  return (
                    <div key={idx} style={{ 
                      display:"flex", alignItems:"center", gap:16, padding:"12px 16px", borderRadius:8,
                      background: status==="success" ? "rgba(0,255,210,0.05)" : status==="running" ? "rgba(0,210,255,0.08)" : "transparent",
                      border: "1px solid",
                      borderColor: status==="success" ? "rgba(0,255,210,0.2)" : status==="running" ? "var(--blue-neon)" : "transparent",
                      transition: "all 0.3s ease"
                    }}>
                      <div style={{ 
                        width:32, height:32, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center",
                        background: status==="success" ? "var(--green)" : status==="running" ? "var(--blue-neon)" : "rgba(255,255,255,0.05)",
                        color: status==="idle" ? "var(--text-faint)" : "#030812"
                      }}>
                        {status === "success" ? <ShieldCheck size={16}/> : status === "running" ? <RefreshCw size={16} className="animate-spin" style={{ animation:"spin 1s linear infinite" }}/> : <Icon size={16}/>}
                      </div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600, color: status==="idle" ? "var(--text-dim)" : "var(--text)" }}>{step.name}</div>
                        <div style={{ fontSize:12, color:"var(--text-faint)", marginTop:2 }}>{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {batchResults && !scanLoading && (
              <div style={{ marginTop:24 }}>
                <div style={{ fontSize:14, fontWeight:600, color:"var(--text)", marginBottom:12 }}>Recent Batch Classification Results</div>
                <div className="table-container">
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid var(--border)", color:"var(--text-dim)", textAlign:"left" }}>
                        <th style={{ padding:12, fontWeight:500 }}>Domain</th>
                        <th style={{ padding:12, fontWeight:500 }}>Threat Type</th>
                        <th style={{ padding:12, fontWeight:500 }}>Risk Score</th>
                        <th style={{ padding:12, fontWeight:500 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResults.slice(0, 10).map((r, idx) => (
                        <tr key={idx} style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding:12, fontWeight:500, color:"var(--text)" }}>{r.domain}</td>
                          <td style={{ padding:12, color:"var(--text-dim)" }}>{r.threatType}</td>
                          <td style={{ padding:12 }}>
                            <span className="badge badge-neutral" style={{ background: r.riskScore >= 70 ? "rgba(255,42,95,0.15)" : r.riskScore >= 40 ? "rgba(255,159,26,0.15)" : "rgba(0,255,210,0.15)", color: r.riskScore >= 70 ? "var(--red)" : r.riskScore >= 40 ? "var(--amber)" : "var(--green)" }}>
                              {r.riskScore} / 100
                            </span>
                          </td>
                          <td style={{ padding:12 }}>{r.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {batchResults.length > 10 && <div style={{ fontSize:11, color:"var(--text-dim)", textAlign:"center", marginTop:12 }}>Showing first 10 results. See downloaded CSV for full report.</div>}
              </div>
            )}

            {scanResult && !scanLoading && (
              <div style={{ display:"flex", flexDirection:"column", gap:20, marginTop:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:10, color:"var(--text-faint)", letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:600 }}>Analysis Result</div>
                    <div className="font-mono" style={{ fontSize:22, fontWeight:700, color:"var(--text)", marginTop:4 }}>{scanResult["Domain Name"]}</div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {riskBadge(scanResult["Severity"] || "Low")}
                    <span className="badge badge-neutral">{scanResult["Threat Type"]}</span>
                  </div>
                </div>

                {scanError && <div style={{ color:"var(--red)", fontSize:13 }}>{scanError}</div>}

                <div className="stat-grid" style={{ gridTemplateColumns:"repeat(3, 1fr)", gap:12, marginBottom:0 }}>
                  <div className="card" style={{ padding:16, textAlign:"center" }}>
                    <div className="stat-label" style={{ marginTop:0, marginBottom:8 }}>Risk Score</div>
                    <div className="stat-value">{scanResult["Risk Score"]}</div>
                  </div>
                  <div className="card" style={{ padding:16, textAlign:"center" }}>
                    <div className="stat-label" style={{ marginTop:0, marginBottom:8 }}>Phishing Prob.</div>
                    <div className="stat-value" style={{ fontSize:20 }}>{typeof scanResult["Phishing Probability"]==="number" ? (scanResult["Phishing Probability"]*100).toFixed(1)+"%" : "N/A"}</div>
                  </div>
                  <div className="card" style={{ padding:16, textAlign:"center" }}>
                    <div className="stat-label" style={{ marginTop:0, marginBottom:8 }}>Visual Match</div>
                    <div className="stat-value" style={{ fontSize:20 }}>{typeof scanResult["Visual Similarity Score"]==="number" ? (scanResult["Visual Similarity Score"]*100).toFixed(1)+"%" : "N/A"}</div>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div className="card" style={{ padding:14 }}>
                    <div style={{ fontSize:10, color:"var(--text-faint)", fontWeight:600, textTransform:"uppercase" }}>Recommended Action</div>
                    <div style={{ color:"var(--red)", fontSize:13, fontWeight:600, marginTop:4 }}>{scanResult["Recommended Action"] || "Review required."}</div>
                  </div>
                  <div className="card" style={{ padding:14 }}>
                    <div style={{ fontSize:10, color:"var(--text-faint)", fontWeight:600, textTransform:"uppercase" }}>Key Indicators</div>
                    <div style={{ marginTop:4, display:"flex", flexDirection:"column", gap:4 }}>
                      {(scanResult["Explanations"] || []).map((exp: string, idx: number) => (
                        <div key={idx} style={{ display:"flex", alignItems:"flex-start", gap:6, fontSize:12, color:"var(--text-dim)" }}>
                          <AlertTriangle size={12} color="var(--red)" style={{ marginTop:2, flexShrink:0 }}/> {exp}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8 }}>
                  {[{l:"WHOIS Age", v:scanResult["WHOIS Age Days"]!==undefined?scanResult["WHOIS Age Days"]+" d":"Unk"}, {l:"SSL", v:scanResult["SSL Status"]}, {l:"Hosting", v:scanResult["Hosting Country"]}, {l:"Malware", v:scanResult["Malware Signature Match"]?"Yes":"No"}].map((s,i) => (
                    <div key={i} style={{ background:"rgba(0,210,255,0.05)", border:"1px solid var(--border-strong)", borderRadius:8, padding:10, textAlign:"center" }}>
                      <div style={{ fontSize:9, color:"var(--text-faint)", textTransform:"uppercase", fontWeight:600 }}>{s.l}</div>
                      <div style={{ fontSize:12, color:"var(--text)", fontWeight:500, marginTop:2 }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {scanError && !scanResult && <div style={{ color:"var(--red)", fontSize:13 }}>{scanError}</div>}
        </div>
      </div>
    );
  }

  if (!isMounted) return null;

  if (!isLoggedIn) {
    return (
      <>
        <style>{TOKENS}</style>
        {showSignup ? (
          <SignupPage onLogin={handleLogin} setShowSignup={setShowSignup} />
        ) : (
          <LoginPage onLogin={handleLogin} setShowSignup={setShowSignup} />
        )}
      </>
    );
  }

  const [title, subtitle] = pageTitles[page] || pageTitles.dashboard;

  const toggleTheme = (val: boolean) => {
    setDark(val);
    localStorage.setItem('cyberpitch_theme', val ? 'dark' : 'light');
  };

  return (
    <div className={`stg-root ${dark ? 'dark' : 'light'}`}>
      <style>{TOKENS}</style>
      <div className="hexbg"/>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={handleLogout} user={user} onNavigate={(href) => router.push(href)} />
      <div className="main">
        <TopBar title={title} subtitle={subtitle} onUpload={handleUpload} dataSource={dataSource} onScan={handleScan} onExport={handleExport} user={user} dark={dark} setDark={toggleTheme} />
        {uploadError && (
          <div style={{ margin:"14px 28px 0", padding:"10px 14px", background:"rgba(255,42,95,0.1)", border:"1px solid rgba(255,42,95,0.3)", borderRadius:8, fontSize:12.5, color:"var(--red)", display:"flex", alignItems:"center", gap:8 }}>
            <AlertTriangle size={13}/>{uploadError}
            <X size={13} style={{ marginLeft:"auto", cursor:"pointer" }} onClick={()=>setUploadError(null)}/>
          </div>
        )}
        <div className="content">
          {page === "dashboard" && <Dashboard data={data} />}
          {page === "scan" && <ScanView />}
          {page === "domains" && <DomainIntel data={data} />}
          {page === "tickets" && <TicketingFraud data={data} />}
          {page === "social" && <SocialOSINT data={data} />}
          {page === "streaming" && <StreamingPiracy data={data} />}
          {page === "alerts" && <AlertsPage data={data} />}
          {page === "settings" && <SettingsPage user={user} />}
        </div>
        <div style={{ padding:"16px 32px", borderTop:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:11, color:"var(--text-faint)", fontFamily:"var(--mono)" }}>
          <span>CyberPitch-FIFA v2.0.0 · FIFA Cyber Threat Intelligence Platform</span>
          <span>{data.length.toLocaleString()} domains monitored · {new Date().toLocaleString()}</span>
          <span>© 2026 FIFA Cyber Threat Intelligence</span>
        </div>
      </div>
    </div>
  );
}