'use client';

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Papa from "papaparse";
import {
  Shield, AlertTriangle, Globe2, Ticket, Radio, Users, Bell, Settings,
  LayoutDashboard, TrendingUp, TrendingDown, Search, Upload, ChevronDown,
  ChevronRight, ChevronLeft, ExternalLink, Lock, Unlock, ShieldAlert, ShieldCheck,
  CircleDot, X, Info, RefreshCw, Download, HelpCircle, LogOut,
  MessageSquare, Hash, Eye, Wifi, Server, Cpu, HardDrive,
  Activity, Zap, FileText, Share2, BarChart3, Filter, Calendar,
  CheckCircle2, XCircle, Clock, Star, Target, Flame, Waves, Monitor,
  Sun, Moon,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   THEME STYLE SYSTEM (SUPPORTING DARK & LIGHT MODES)
═══════════════════════════════════════════════════════════════ */
const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  /* Light theme: clean light canvas, but cards are gorgeous corporate blue */
  .stg-root.theme-light {
    --bg: #f1f4f9;
    --surface: #ffffff;
    --surface-hover: #e6eef5;
    --border: #d2dbe5;
    --border-strong: #94a7be;
    --indigo: #4f46e5;
    --indigo-bg: #eef2ff;
    --violet: #8b5cf6;
    --emerald: #10b981;
    --rose: #f43f5e;
    --amber: #f59e0b;
    --text: #1e293b;
    --text-secondary: #475569;
    --text-muted: #64748b;
    --text-faint: #94a3b8;
    --shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.03);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.05);
    --shadow-glow: 0 0 20px rgba(79,70,229,0.1);
  }

  /* Dark theme: classic high-tech cyber operations room */
  .stg-root.theme-dark {
    --bg: #050b16;
    --surface: #0a1628;
    --surface-hover: #0f2038;
    --border: rgba(0, 194, 255, 0.12);
    --border-strong: rgba(0, 194, 255, 0.28);
    --indigo: #6366f1;
    --indigo-bg: rgba(99, 102, 241, 0.12);
    --violet: #a78bfa;
    --emerald: #00ffd2;
    --rose: #ff2a5f;
    --amber: #ff9f1a;
    --text: #f0f5fc;
    --text-secondary: #a5b7d0;
    --text-muted: #677b96;
    --text-faint: #3b4d66;
    --shadow: 0 4px 20px rgba(0,0,0,0.4);
    --shadow-lg: 0 12px 30px rgba(0,0,0,0.6);
    --shadow-glow: 0 0 20px rgba(99,102,241,0.18);
  }

  * { box-sizing: border-box; }

  .stg-root {
    background: var(--bg);
    color: var(--text);
    font-family: var(--body);
    min-height: 100vh;
    display: flex;
    position: relative;
    overflow-x: hidden;
    transition: background 0.3s ease, color 0.3s ease;
  }

  /* Decorative bg blobs */
  .bg-decor {
    position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
  }
  .bg-decor::before {
    content: ''; position: absolute; top: -200px; right: -200px;
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%);
  }

  .font-display { font-family: var(--grotesk); letter-spacing: -0.02em; }
  .font-mono { font-family: var(--mono); }

  /* ── Sidebar ── */
  .sidebar {
    width: 260px; flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: relative; z-index: 2;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s;
  }
  .sidebar.collapsed { width: 72px; }
  .brand { padding: 24px 20px; border-bottom: 1px solid var(--border); }
  .brand-mark {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, var(--indigo), var(--violet));
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    flex-shrink: 0;
  }
  .navgroup { padding: 16px 12px; flex: 1; overflow-y: auto; }
  .navlabel {
    font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
    color: var(--text-muted); text-transform: uppercase; padding: 14px 12px 8px;
  }
  .navitem {
    display: flex; align-items: center; gap: 12px; padding: 10px 14px;
    border-radius: 10px; color: var(--text-secondary); font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.2s ease;
    border: 1px solid transparent; margin-bottom: 2px;
  }
  .navitem:hover { background: var(--indigo-bg); color: var(--indigo); }
  .navitem.active {
    background: linear-gradient(135deg, var(--indigo-bg), rgba(99, 102, 241, 0.08));
    color: var(--indigo); font-weight: 600;
    border-color: var(--border-strong);
    box-shadow: var(--shadow-glow);
  }
  .navitem.disabled { opacity: 0.45; cursor: default; }
  .navitem.disabled:hover { background: transparent; color: var(--text-secondary); }
  .soon-badge {
    margin-left: auto; font-size: 9px; font-weight: 700; padding: 2px 7px;
    border-radius: 6px; background: var(--indigo-bg); color: var(--indigo);
    letter-spacing: 0.06em; border: 1px solid var(--border-strong);
  }

  /* ── Layout ── */
  .main { flex: 1; position: relative; z-index: 1; min-width: 0; display: flex; flex-direction: column; }
  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 32px; border-bottom: 1px solid var(--border);
    background: var(--surface);
    position: sticky; top: 0; z-index: 5;
    transition: background 0.3s;
  }
  .content { padding: 28px 32px; flex: 1; }

  /* ── Live dot ── */
  .pulse-dot {
    width: 8px; height: 8px; border-radius: 50%; background: var(--emerald);
    position: relative; display: inline-block;
  }
  .pulse-dot::after {
    content: ''; position: absolute; inset: -3px; border-radius: 50%;
    border: 1.5px solid var(--emerald);
    animation: pulse 2s ease-out infinite;
  }
  @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(2.2); opacity: 0; } }

  .status-pill {
    display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--indigo);
    font-weight: 600; font-family: var(--mono); padding: 6px 14px;
    border: 1px solid var(--border-strong); border-radius: 20px;
    background: var(--indigo-bg);
  }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600;
    padding: 8px 16px; border-radius: 10px; cursor: pointer;
    border: 1px solid var(--border-strong); background: var(--surface);
    color: var(--text); transition: all 0.2s ease; white-space: nowrap;
  }
  .btn:hover { border-color: var(--indigo); color: var(--indigo); box-shadow: var(--shadow-glow); }
  .btn-primary {
    background: linear-gradient(135deg, var(--indigo), var(--violet));
    color: #fff; border: none;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }
  .btn-primary:hover { filter: brightness(1.08); color: #fff; box-shadow: 0 6px 18px rgba(99,102,241,0.4); transform: translateY(-1px); }
  .btn-danger { color: var(--rose); border-color: rgba(244,63,94,0.3); }
  .btn-danger:hover { background: var(--rose-bg); border-color: var(--rose); }

  /* ── Cards ── */
  .card {
    border-radius: 16px;
    position: relative; overflow: hidden;
    transition: all 0.3s ease;
  }

  /* In Dark Theme, cards are dark */
  .stg-root.theme-dark .card {
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
  }
  .stg-root.theme-dark .card:hover {
    border-color: rgba(99,102,241,0.25);
    box-shadow: var(--shadow-lg), var(--shadow-glow);
    transform: translateY(-1px);
  }

  /* In Light Theme, cards are gorgeous deep royal/navy blue */
  .stg-root.theme-light .card {
    background: linear-gradient(135deg, #0f1c3f, #182e5c);
    border: 1px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 4px 20px rgba(15, 28, 63, 0.15);
    color: #ffffff;
  }
  .stg-root.theme-light .card:hover {
    border-color: rgba(99, 102, 241, 0.45);
    box-shadow: 0 10px 25px rgba(15, 28, 63, 0.25), var(--shadow-glow);
    transform: translateY(-1px);
  }

  /* Text overrides inside Blue Cards for Light Theme */
  .stg-root.theme-light .card .section-title,
  .stg-root.theme-light .card .stat-value {
    color: #ffffff !important;
  }
  .stg-root.theme-light .card .section-sub,
  .stg-root.theme-light .card .stat-label {
    color: #a5b7d0 !important;
  }
  .stg-root.theme-light .card table {
    color: #ffffff;
  }
  .stg-root.theme-light .card thead th {
    background: #112240;
    color: #a5b7d0;
    border-bottom-color: rgba(255,255,255,0.08);
  }
  .stg-root.theme-light .card tbody td {
    border-bottom-color: rgba(255,255,255,0.08);
  }
  .stg-root.theme-light .card tbody tr:hover {
    background: rgba(255,255,255,0.05);
  }
  .stg-root.theme-light .card .domain-name {
    color: #ffffff;
  }
  .stg-root.theme-light .card .activity-item {
    background: #122548;
    color: #ffffff;
    border-color: rgba(99,102,241,0.2);
  }
  .stg-root.theme-light .card .activity-item:hover {
    background: #1a3262;
  }
  .stg-root.theme-light .card .flag-chip {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.15);
    color: #a5b7d0;
  }
  .stg-root.theme-light .card .flag-chip:hover {
    border-color: #ffffff;
    color: #ffffff;
    background: rgba(255,255,255,0.1);
  }
  .stg-root.theme-light .card .pagination-btn {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.15);
    color: #ffffff;
  }
  .stg-root.theme-light .card .pagination-btn:hover {
    border-color: #ffffff;
  }

  .accent-line {
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--indigo), var(--violet), var(--sky));
    opacity: 0; transition: opacity 0.3s;
  }
  .card:hover .accent-line { opacity: 1; }

  /* ── Stat grid ── */
  .stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
  @media (max-width: 1200px) { .stat-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 800px)  { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
  .stat-card { padding: 24px; cursor: default; }
  .stat-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
  }
  .stat-value {
    font-family: var(--mono); font-size: 28px; font-weight: 800; line-height: 1;
  }
  .stat-label { font-size: 13px; margin-top: 6px; font-weight: 500; }
  
  .trend {
    display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600;
    font-family: var(--mono); margin-top: 12px; padding: 4px 10px; border-radius: 8px;
    width: fit-content;
  }
  .trend-up { color: var(--rose); background: var(--rose-bg); }
  .trend-down { color: var(--emerald); background: var(--emerald-bg); }
  .stg-root.theme-light .trend-up { color: #ff8a9f; background: rgba(244, 63, 94, 0.15); }
  .stg-root.theme-light .trend-down { color: #5effc4; background: rgba(16, 185, 129, 0.15); }

  /* ── Section titles ── */
  .section-title {
    font-family: var(--grotesk); font-size: 16px; font-weight: 700;
    display: flex; align-items: center; gap: 10px;
  }
  .section-sub { font-size: 13px; margin-top: 2px; }

  /* ── Badges ── */
  .badge {
    font-size: 11px; font-weight: 600; font-family: var(--mono); padding: 3px 10px;
    border-radius: 8px; display: inline-flex; align-items: center; gap: 5px;
    letter-spacing: 0.02em; white-space: nowrap;
  }
  .badge-high   { background: var(--rose-bg);   color: var(--rose);   border: 1px solid rgba(244,63,94,0.2); }
  .badge-medium { background: var(--amber-bg);  color: var(--amber);  border: 1px solid rgba(245,158,11,0.2); }
  .badge-low    { background: var(--emerald-bg); color: var(--emerald); border: 1px solid rgba(16,185,129,0.2); }
  .badge-neutral { background: var(--indigo-bg); color: var(--indigo); border: 1px solid rgba(99,102,241,0.15); }
  .badge-info   { background: var(--sky-bg);    color: var(--sky);    border: 1px solid rgba(14,165,233,0.2); }

  /* ── Table ── */
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead th {
    text-align: left; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--text-muted); font-weight: 600; padding: 14px 18px;
    border-bottom: 2px solid var(--border);
    position: sticky; top: 0; background: var(--surface);
  }
  thead th.sortable { cursor: pointer; user-select: none; }
  thead th.sortable:hover { color: var(--indigo); }
  tbody td { padding: 14px 18px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  tbody tr { cursor: pointer; transition: all 0.15s ease; }
  tbody tr:hover { background: var(--surface-hover); }
  .domain-name { font-family: var(--mono); font-size: 13px; color: var(--text); font-weight: 600; }

  /* ── Inputs ── */
  input.search {
    background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px;
    padding: 10px 14px 10px 38px; font-size: 14px; color: var(--text); width: 280px; outline: none;
    transition: all 0.25s ease;
  }
  input.search::placeholder { color: var(--text-muted); }
  input.search:focus { border-color: var(--indigo); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
  
  select.filter {
    background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px;
    padding: 9px 14px; font-size: 13px; color: var(--text-secondary); outline: none; cursor: pointer;
  }
  select.filter:focus, select.filter:hover { border-color: var(--indigo); }
  select.filter option {
    background: var(--surface) !important;
    color: var(--text) !important;
  }

  /* Specific overrides when inside the dark-blue cards in Light Theme */
  .stg-root.theme-light .card input.search {
    background: rgba(255, 255, 255, 0.08) !important;
    color: #ffffff !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
  }
  .stg-root.theme-light .card input.search::placeholder {
    color: rgba(255, 255, 255, 0.55) !important;
  }
  .stg-root.theme-light .card select.filter {
    background: rgba(255, 255, 255, 0.08) !important;
    color: #ffffff !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
  }
  .stg-root.theme-light .card select.filter option {
    background: #112240 !important;
    color: #ffffff !important;
  }

  /* ── Risk bar ── */
  .risk-bar-track { width: 70px; height: 6px; border-radius: 4px; background: rgba(255,255,255,0.15); overflow: hidden; }
  .stg-root.theme-dark .risk-bar-track { background: var(--border); }
  .risk-bar-fill { height: 100%; border-radius: 4px; }

  .flag-chip {
    font-size: 11px; padding: 4px 10px; border-radius: 8px;
    background: var(--bg); border: 1px solid var(--border); color: var(--text-secondary);
    transition: all 0.15s;
  }
  .flag-chip:hover { border-color: var(--indigo); color: var(--indigo); background: var(--indigo-bg); }

  .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }

  .pagination-btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px;
    border-radius: 8px; font-size: 12.5px; font-weight: 600; cursor: pointer;
    border: 1px solid var(--border); background: var(--surface); color: var(--text);
    transition: all 0.15s;
  }
  .pagination-btn:hover { border-color: var(--indigo); color: var(--indigo); }
  .pagination-btn:disabled { opacity: 0.35; cursor: default; }

  /* ── Activity item ── */
  .activity-item {
    padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border);
    background: var(--bg); transition: all 0.2s; cursor: pointer;
  }
  .activity-item:hover { background: var(--indigo-bg); border-color: rgba(99,102,241,0.2); transform: translateX(4px); }

  /* ── Health indicator ── */
  .health-bar {
    height: 8px; border-radius: 4px; background: rgba(255,255,255,0.12); overflow: hidden;
  }
  .stg-root.theme-dark .health-bar { background: var(--border); }
  .health-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }

  /* ── Settings toggle ── */
  .toggle {
    width: 44px; height: 24px; border-radius: 12px; background: var(--border);
    position: relative; cursor: pointer; transition: background 0.2s;
  }
  .toggle.on { background: var(--indigo); }
  .toggle-knob {
    width: 20px; height: 20px; border-radius: 50%; background: white;
    position: absolute; top: 2px; left: 2px; transition: transform 0.2s;
    box-shadow: var(--shadow);
  }
  .toggle.on .toggle-knob { transform: translateX(20px); }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 6px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
  ::-webkit-scrollbar-track { background: transparent; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.4s ease forwards; }
  .fade-in-1 { animation-delay: 0.05s; opacity: 0; }
  .fade-in-2 { animation-delay: 0.1s; opacity: 0; }
  .fade-in-3 { animation-delay: 0.15s; opacity: 0; }
  .fade-in-4 { animation-delay: 0.2s; opacity: 0; }
  .fade-in-5 { animation-delay: 0.25s; opacity: 0; }
`;

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const THREAT_TYPES = ["Ticket Scam","Phishing","Malware","Streaming Piracy"];
const COUNTRIES = ["Russia","Nigeria","Vietnam","Brazil","India","Ukraine","Indonesia","China","Philippines","USA"];
const REGISTRARS = ["NameCheap Inc.","GoDaddy.com LLC","PDR Ltd.","Alibaba Cloud","REG.RU","Dynadot LLC"];
const SSL_STATES = ["Invalid","Expired","None","Valid"];
const STATUSES = ["Active","Under Review","Blocked"];
const RED_FLAG_POOL = [
  "Price 60-80% below official","Domain registered <30 days ago","No SSL / self-signed cert",
  "Spoofed FIFA branding","Offshore hosting","No refund policy listed",
  "Unofficial payment gateway","No verifiable physical address","WHOIS privacy shield active",
];

function seededRandom(seed: number) { let s=seed; return ()=>{ s=(s*9301+49297)%233280; return s/233280; }; }

function generateMockData(count=180) {
  const rnd=seededRandom(42); const rows=[];
  for (let i=0;i<count;i++) {
    const threatType=THREAT_TYPES[Math.floor(rnd()*THREAT_TYPES.length)];
    const riskScore=Math.round(rnd()*100);
    const ageDays=Math.floor(rnd()*900)+1;
    const isTicket=threatType==="Ticket Scam";
    const officialPrice=[80,120,250,400][Math.floor(rnd()*4)];
    const flagCount=2+Math.floor(rnd()*4);
    const flags=[...RED_FLAG_POOL].sort(()=>rnd()-0.5).slice(0,flagCount);
    rows.push({
      id:`TH-${1000+i}`, threatType, riskScore, ageDays,
      domain:`fifa-${["worldcup","tickets2026","official","matchday","livepass","fanzone","goldpass"][Math.floor(rnd()*7)]}-${Math.floor(rnd()*999)}.${["com","net","info","xyz","ru","top"][Math.floor(rnd()*6)]}`,
      riskLevel:riskScore>=70?"High":riskScore>=40?"Medium":"Low",
      registrationDate:`2025-${String(Math.floor(rnd()*12)+1).padStart(2,"0")}-${String(Math.floor(rnd()*28)+1).padStart(2,"0")}`,
      registrar:REGISTRARS[Math.floor(rnd()*REGISTRARS.length)],
      country:COUNTRIES[Math.floor(rnd()*COUNTRIES.length)],
      sslStatus:SSL_STATES[Math.floor(rnd()*SSL_STATES.length)],
      similarityScore:Math.round(40+rnd()*60),
      detectedDate:`2026-0${Math.floor(rnd()*6)+1}-${String(Math.floor(rnd()*28)+1).padStart(2,"0")}`,
      status:STATUSES[Math.floor(rnd()*STATUSES.length)],
      estimatedLoss:isTicket?Math.round(rnd()*45000):Math.round(rnd()*8000),
      affectedUsers:isTicket?Math.floor(rnd()*900):Math.floor(rnd()*200),
      officialPrice:isTicket?officialPrice:null,
      scamPrice:isTicket?Math.round(officialPrice*(0.15+rnd()*0.35)):null,
      redFlags:flags, source:rnd()>0.4?"Synthetic":"Real (FBI/IC3-linked)",
    });
  }
  return rows;
}

const CSV_FIELD_MAP: Record<string,string[]> = {
  domain:["domain","url","domain_name"], threatType:["threat_type","threattype","category","type"],
  riskScore:["risk_score","riskscore","score"], registrationDate:["registration_date","reg_date","created_date"],
  ageDays:["age_days","domain_age","age"], registrar:["registrar","whois_registrar"],
  country:["country","whois_country","registrant_country"], sslStatus:["ssl_status","ssl","certificate_status"],
  similarityScore:["similarity_score","visual_similarity","similarity"], detectedDate:["detected_date","detection_date","date_detected"],
  status:["status","state"], estimatedLoss:["estimated_loss","financial_loss","loss_usd"],
  affectedUsers:["affected_users","victims","num_victims"], source:["source","data_source"],
};
function findKey(row:Record<string,string>,aliases:string[]):string|null {
  for (const a of aliases) { const m=Object.keys(row).find(k=>k.toLowerCase().replace(/\s+/g,"_")===a); if(m) return m; } return null;
}
function normalizeCSVRow(row:Record<string,string>,idx:number) {
  const get=(f:string,fb:string)=>{ const k=findKey(row,CSV_FIELD_MAP[f]||[]); return k&&row[k]?row[k]:fb; };
  const rs=Math.min(100,Math.max(0,Number(get("riskScore",String(Math.round(Math.random()*100))))||0));
  const tt=get("threatType","Phishing");
  return {
    id:`CSV-${1000+idx}`, domain:get("domain","unknown.com"), threatType:THREAT_TYPES.includes(tt)?tt:"Phishing",
    riskScore:rs, riskLevel:rs>=70?"High":rs>=40?"Medium":"Low", registrationDate:get("registrationDate","—"),
    ageDays:Number(get("ageDays","0"))||0, registrar:get("registrar","Unknown"), country:get("country","Unknown"),
    sslStatus:get("sslStatus","Unknown"), similarityScore:Number(get("similarityScore","0"))||0,
    detectedDate:get("detectedDate","—"), status:get("status","Active"),
    estimatedLoss:Number(get("estimatedLoss","0"))||0, affectedUsers:Number(get("affectedUsers","0"))||0,
    officialPrice:null as number|null, scamPrice:null as number|null,
    redFlags:[] as string[], source:get("source","Uploaded CSV"),
  };
}

interface ThreatRecord {
  id:string; domain:string; threatType:string; riskScore:number; riskLevel:string;
  registrationDate:string; ageDays:number; registrar:string; country:string;
  sslStatus:string; similarityScore:number; detectedDate:string; status:string;
  estimatedLoss:number; affectedUsers:number; officialPrice:number|null;
  scamPrice:number|null; redFlags:string[]; source:string;
}

const RISK_COLOR:Record<string,string> = {High:"var(--rose)",Medium:"var(--amber)",Low:"var(--emerald)"};
function riskBadge(l:string) { return <span className={`badge ${l==="High"?"badge-high":l==="Medium"?"badge-medium":"badge-low"}`}>{l}</span>; }
function sslBadge(s:string) {
  if(s==="Valid") return <span className="badge badge-low"><Lock size={10}/>Valid</span>;
  if(s==="Unknown") return <span className="badge badge-neutral">Unknown</span>;
  return <span className="badge badge-high"><Unlock size={10}/>{s}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   RISK GAUGE SVG
═══════════════════════════════════════════════════════════════ */
function RiskGauge({value}:{value:number}) {
  const angle=(value/100)*180;
  const color=value>=70?"var(--rose)":value>=40?"var(--amber)":"var(--emerald)";
  const r=70,cx=90,cy=80,rad=(Math.PI*(180-angle))/180;
  const x=cx+r*Math.cos(rad), y=cy-r*Math.sin(rad);
  return (
    <svg width="180" height="105" viewBox="0 0 180 105">
      <path d="M 20 80 A 70 70 0 0 1 160 80" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="14" strokeLinecap="round"/>
      <path d={`M 20 80 A 70 70 0 0 1 ${x} ${y}`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"/>
      <text x="90" y="72" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="30" fontWeight="800" fill="currentColor">{value}</text>
      <text x="90" y="92" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fill="currentColor" opacity="0.6">/ 100</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════════ */
interface SidebarProps { page:string; setPage:(p:string)=>void; collapsed:boolean; setCollapsed:(c:boolean)=>void; userName?: string; onLogout?: () => void; }
function Sidebar({page,setPage,collapsed,setCollapsed,userName,onLogout}:SidebarProps) {
  const items=[
    {key:"dashboard",label:"Dashboard",icon:LayoutDashboard,enabled:true},
    {key:"domains",label:"Domain Intelligence",icon:Globe2,enabled:true,subItems:["Search & Filters","Active Blocks","WHOIS Records"]},
    {key:"tickets",label:"Ticketing Fraud",icon:Ticket,enabled:true,subItems:["Pricing Scams","Est. Losses"]},
    {key:"social",label:"Social & OSINT",icon:MessageSquare,enabled:true,subItems:["Mentions","Sentiment","Hashtags"]},
    {key:"streaming",label:"Streaming Piracy",icon:Monitor,enabled:true,subItems:["Active Streams","Geo-blocks"]},
    {key:"alerts",label:"Alerts Center",icon:Bell,enabled:true},
    {key:"settings",label:"Settings",icon:Settings,enabled:true},
  ];
  const displayName = userName || "Abhinav Kumar";
  const initials = displayName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"AK";

  return (
    <div className={`sidebar${collapsed?" collapsed":""}`}>
      <div className="brand" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:collapsed?0:12}}>
          <div className="brand-mark"><Shield size={18} color="#fff" strokeWidth={2.5}/></div>
          {!collapsed&&<div>
            <div className="font-display" style={{fontSize:15,fontWeight:800,color:"var(--text)"}}>SENTINEL/7</div>
            <div style={{fontSize:10,color:"var(--text-muted)",letterSpacing:"0.06em",fontWeight:500}}>FIFA THREAT INTEL</div>
          </div>}
        </div>
        <button onClick={()=>setCollapsed(!collapsed)} style={{background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",display:"flex",alignItems:"center",padding:4,borderRadius:6}} title={collapsed?"Expand":"Collapse"}>
          {collapsed?<ChevronRight size={16}/>:<ChevronLeft size={16}/>}
        </button>
      </div>
      <div className="navgroup" style={{padding:"12px 10px"}}>
        <div className="navlabel" style={{display:collapsed?"none":"block"}}>Navigation</div>
        {items.map(it=>{
          const Icon=it.icon; const isActive=page===it.key;
          return (
            <React.Fragment key={it.key}>
              <div className={`navitem${isActive?" active":""}${!it.enabled?" disabled":""}`} onClick={()=>it.enabled&&setPage(it.key)} style={{padding:collapsed?"10px 0":"10px 14px",justifyContent:collapsed?"center":"flex-start"}}>
                <Icon size={18}/>{!collapsed&&<span>{it.label}</span>}
                {!it.enabled&&!collapsed&&<span className="soon-badge">SOON</span>}
              </div>
              {!collapsed&&isActive&&it.subItems&&(
                <div style={{paddingLeft:32,marginBottom:6,display:"flex",flexDirection:"column",gap:4}}>
                  {it.subItems.map((sub,si)=>(
                    <div key={si} className="sub-menu-item" style={{fontSize:12,color:"var(--text-muted)",cursor:"pointer",padding:"3px 0",fontWeight:500}}>• {sub}</div>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{marginTop:"auto",padding:collapsed?"12px 8px":"16px",borderTop:"1px solid var(--border)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:collapsed?"center":"flex-start"}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,var(--indigo),var(--violet))",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13,flexShrink:0}}>{initials}</div>
          {!collapsed&&<div style={{minWidth:0,flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{displayName}</div>
            <div style={{fontSize:11,color:"var(--text-muted)"}}>Analyst Level 3</div>
          </div>}
        </div>
        {!collapsed && onLogout && (
          <button onClick={onLogout} style={{marginTop:10,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"7px 0",background:"rgba(244,63,94,0.08)",border:"1px solid rgba(244,63,94,0.2)",borderRadius:8,color:"var(--rose)",fontSize:12,fontWeight:600,cursor:"pointer"}}><LogOut size={13}/>Sign Out</button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOPBAR
═══════════════════════════════════════════════════════════════ */
interface TopBarProps {
  title:string; subtitle:string; onUpload:(f:File)=>void; dataSource:string;
  onScan:()=>void; onExport:()=>void; isDark:boolean; onToggleTheme:()=>void;
}
function TopBar({title,subtitle,onUpload,dataSource,onScan,onExport,isDark,onToggleTheme}:TopBarProps) {
  const fileRef=React.useRef<HTMLInputElement>(null);
  const [showBell,setShowBell]=useState(false);
  const [showProfile,setShowProfile]=useState(false);
  const notifs=[
    {type:"Critical",text:"Fake ticket domain: fifa2026-store.xyz",time:"2m ago"},
    {type:"Warning",text:"High traffic on pipeline #4",time:"15m ago"},
    {type:"Info",text:"Threat database refreshed",time:"1h ago"},
  ];
  return (
    <div className="topbar">
      <div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="font-display" style={{fontSize:20,fontWeight:800,color:"var(--text)"}}>{title}</div>
          <span className="pulse-dot" title="Live"/>
          <span style={{fontSize:11,color:"var(--emerald)",fontFamily:"var(--mono)",fontWeight:600}}>LIVE</span>
        </div>
        <div className="section-sub" style={{marginTop:2}}>{subtitle}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div className="status-pill" style={{fontSize:11}}><Info size={12}/>{dataSource}</div>
        <button className="btn" onClick={onScan}><RefreshCw size={13}/>Scan Now</button>
        <button className="btn" onClick={onExport}><Download size={13}/>Export</button>
        <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)onUpload(f);}}/>
        <button className="btn btn-primary" onClick={()=>fileRef.current?.click()}><Upload size={14}/>Upload CSV</button>
        <div style={{width:1,height:24,background:"var(--border)",margin:"0 2px"}}/>

        {/* Dynamic Dark / Light theme toggle */}
        <button onClick={onToggleTheme} style={{background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",padding:6,borderRadius:8,display:"flex",alignItems:"center"}} title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          {isDark ? <Sun size={17} color="var(--amber)" /> : <Moon size={17} />}
        </button>

        <button onClick={()=>alert("Help: Upload a CSV, filter domains, or scan for new threats.")} style={{background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",padding:4}} title="Help"><HelpCircle size={17}/></button>
        
        {/* Bell */}
        <div style={{position:"relative"}}>
          <button onClick={()=>{setShowBell(!showBell);setShowProfile(false);}} style={{background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",position:"relative",padding:4}}>
            <Bell size={17}/>
            <span style={{position:"absolute",top:0,right:0,width:14,height:14,borderRadius:"50%",background:"var(--rose)",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>3</span>
          </button>
          {showBell&&(
            <div style={{position:"absolute",top:36,right:-10,width:340,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:14,zIndex:10,boxShadow:"var(--shadow-xl)"}}>
              <div style={{fontSize:12,fontWeight:700,borderBottom:"1px solid var(--border)",paddingBottom:8,marginBottom:10,display:"flex",justifyContent:"space-between",color:"var(--text)"}}>
                <span>Notifications</span><span style={{color:"var(--indigo)",cursor:"pointer",fontWeight:600}} onClick={()=>setShowBell(false)}>Clear all</span>
              </div>
              {notifs.map((n,i)=>(
                <div key={i} style={{fontSize:12,borderBottom:"1px solid var(--border)",paddingBottom:8,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontWeight:600,color:n.type==="Critical"?"var(--rose)":n.type==="Warning"?"var(--amber)":"var(--emerald)"}}>{n.type}</span>
                    <span style={{color:"var(--text-muted)",fontSize:11}}>{n.time}</span>
                  </div>
                  <div style={{color:"var(--text-secondary)"}}>{n.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Profile */}
        <div style={{position:"relative"}}>
          <div onClick={()=>{setShowProfile(!showProfile);setShowBell(false);}} style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,var(--indigo),var(--violet))",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:"#fff"}}>AK</div>
          {showProfile&&(
            <div style={{position:"absolute",top:38,right:0,width:170,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:6,zIndex:10,boxShadow:"var(--shadow-xl)"}}>
              {[{label:"My Profile",action:"Profile"},{label:"Security Log",action:"Security"}].map((m,i)=>(
                <div key={i} style={{fontSize:13,padding:"8px 12px",cursor:"pointer",color:"var(--text)",borderRadius:8,fontWeight:500}} onClick={()=>alert(m.action)} onMouseEnter={e=>e.currentTarget.style.background="var(--surface-hover)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{m.label}</div>
              ))}
              <div style={{borderTop:"1px solid var(--border)",marginTop:4,paddingTop:4}}>
                <div style={{fontSize:13,padding:"8px 12px",cursor:"pointer",color:"var(--rose)",borderRadius:8,fontWeight:500,display:"flex",alignItems:"center",gap:6}} onClick={()=>alert("Logged Out")} onMouseEnter={e=>e.currentTarget.style.background="var(--rose-bg)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><LogOut size={14}/>Log Out</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: DASHBOARD
═══════════════════════════════════════════════════════════════ */
function Dashboard({data,isDark}:{data:ThreatRecord[];isDark:boolean}) {
  const stats=useMemo(()=>{const bt=(t:string)=>data.filter(d=>d.threatType===t).length;return{total:data.length,tickets:bt("Ticket Scam"),phishing:bt("Phishing"),streaming:bt("Streaming Piracy"),malware:bt("Malware")};},[data]);
  const avgRisk=useMemo(()=>data.length?Math.round(data.reduce((a,d)=>a+d.riskScore,0)/data.length):0,[data]);
  const riskDist=useMemo(()=>{const c:Record<string,number>={High:0,Medium:0,Low:0};data.forEach(d=>(c[d.riskLevel]=(c[d.riskLevel]||0)+1));return [{name:"High",value:c.High,color:"#f43f5e"},{name:"Medium",value:c.Medium,color:"#f59e0b"},{name:"Low",value:c.Low,color:"#10b981"}];},[data]);
  const countryDist=useMemo(()=>{const c:Record<string,number>={};data.forEach(d=>(c[d.country]=(c[d.country]||0)+1));return Object.entries(c).map(([country,count])=>({country,count:count as number})).sort((a,b)=>b.count-a.count).slice(0,6);},[data]);
  const timelineData=useMemo(()=>["06-29","06-30","07-01","07-02","07-03","07-04","07-05","07-06"].map((d,i)=>({date:d,threats:data.filter(item=>item.detectedDate?.endsWith(d)).length||(12+(i*3)%7)})),[data]);
  const recent=useMemo(()=>[...data].sort((a,b)=>(b.detectedDate||"").localeCompare(a.detectedDate||"")).slice(0,6),[data]);

  const sparklines=["M0,18 Q15,4 30,14 T60,2 T90,16 L100,8","M0,15 Q15,22 30,5 T60,19 T90,2 L100,12","M0,8 Q15,18 30,3 T60,12 T90,18 L100,5","M0,20 Q15,8 30,16 T60,4 T90,22 L100,15","M0,5 Q15,15 30,8 T60,22 T90,4 L100,18"];
  const statCards=[
    {label:"Total threats detected",value:stats.total,icon:ShieldAlert,color:"var(--indigo)",bg:"var(--indigo-bg)",trend:"+12.4%",up:true,spark:sparklines[0]},
    {label:"Fake ticketing portals",value:stats.tickets,icon:Ticket,color:"var(--rose)",bg:"var(--rose-bg)",trend:"+8.1%",up:true,spark:sparklines[1]},
    {label:"Phishing campaigns",value:stats.phishing,icon:AlertTriangle,color:"var(--amber)",bg:"var(--amber-bg)",trend:"+3.6%",up:true,spark:sparklines[2]},
    {label:"Illegal streaming",value:stats.streaming,icon:Radio,color:"var(--sky)",bg:"var(--sky-bg)",trend:"-2.0%",up:false,spark:sparklines[3]},
    {label:"Malware detected",value:stats.malware,icon:ShieldCheck,color:"var(--emerald)",bg:"var(--emerald-bg)",trend:"+5.9%",up:true,spark:sparklines[4]},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div className="stat-grid">
        {statCards.map((s,i)=>{const Icon=s.icon;return(
          <div className={`card stat-card fade-in fade-in-${i+1}`} key={i}>
            <div className="accent-line"/>
            <div className="stat-icon" style={{background:s.bg}}><Icon size={20} color={s.color}/></div>
            <div className="stat-value">{s.value.toLocaleString()}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{height:26,marginTop:12,marginBottom:4}}>
              <svg viewBox="0 0 100 25" width="100%" height="100%" preserveAspectRatio="none">
                <path d={s.spark} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
              </svg>
            </div>
            <div className={`trend ${s.up?"trend-up":"trend-down"}`}>
              {s.up?<TrendingUp size={12}/>:<TrendingDown size={12}/>}{s.trend} vs last week
            </div>
          </div>
        );})}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.2fr",gap:16}}>
        <div className="card" style={{padding:24}}><div className="section-title"><Target size={16} color="var(--indigo)"/>Risk Score</div><div className="section-sub">Average across all domains</div><div style={{display:"flex",justifyContent:"center",padding:"16px 0"}}><RiskGauge value={avgRisk}/></div></div>
        <div className="card" style={{padding:24}}>
          <div className="section-title"><CircleDot size={16} color="var(--indigo)"/>Severity Distribution</div><div className="section-sub">{data.length} records</div>
          <div style={{height:180}}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={riskDist} dataKey="value" nameKey="name" innerRadius={52} outerRadius={70} paddingAngle={4}>{riskDist.map((e,i)=><Cell key={i} fill={e.color} stroke="none"/>)}</Pie><Tooltip contentStyle={{background:isDark?"#0a1628":"#112240",border:"1px solid var(--border)",borderRadius:10,fontSize:12,boxShadow:"var(--shadow-lg)"}}/></PieChart></ResponsiveContainer></div>
          <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:-4}}>{riskDist.map(r=>(<div key={r.name} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:isDark?"var(--text-secondary)":"#a5b7d0"}}><span style={{width:8,height:8,borderRadius:"50%",background:r.color,display:"inline-block"}}/>{r.name} ({r.value})</div>))}</div>
        </div>
        <div className="card" style={{padding:24}}>
          <div className="section-title"><Globe2 size={16} color="var(--indigo)"/>Top Countries</div><div className="section-sub">By registrant location</div>
          <div style={{height:200}}><ResponsiveContainer width="100%" height="100%"><BarChart data={countryDist} layout="vertical" margin={{left:0,right:10}}><CartesianGrid stroke={isDark?"rgba(0,194,255,0.08)":"rgba(255,255,255,0.08)"} horizontal={false}/><XAxis type="number" hide/><YAxis dataKey="country" type="category" width={72} tick={{fill:isDark?"#a5b7d0":"#ffffff",fontSize:12}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:isDark?"#0a1628":"#112240",border:"1px solid var(--border)",borderRadius:10,fontSize:12,boxShadow:"var(--shadow-lg)"}}/><Bar dataKey="count" fill="var(--indigo)" radius={[0,6,6,0]} barSize={14}/></BarChart></ResponsiveContainer></div>
        </div>
      </div>

      <div className="card" style={{padding:24}}>
        <div className="section-title"><Activity size={16} color="var(--indigo)"/>Threat Timeline</div><div className="section-sub">Daily detection count — last 8 days</div>
        <div style={{height:180,marginTop:16}}><ResponsiveContainer width="100%" height="100%"><AreaChart data={timelineData}><defs><linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--indigo)" stopOpacity={0.25}/><stop offset="100%" stopColor="var(--indigo)" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke={isDark?"rgba(0,194,255,0.08)":"rgba(255,255,255,0.08)"} vertical={false}/><XAxis dataKey="date" tick={{fill:isDark?"#a5b7d0":"#ffffff",fontSize:12}} axisLine={false} tickLine={false}/><YAxis tick={{fill:isDark?"#677b96":"#a5b7d0",fontSize:12}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:isDark?"#0a1628":"#112240",border:"1px solid var(--border)",borderRadius:10,fontSize:12,boxShadow:"var(--shadow-lg)"}}/><Area type="monotone" dataKey="threats" stroke="var(--indigo)" strokeWidth={2.5} fill="url(#fillGrad)" dot={{fill:"var(--indigo)",r:3,strokeWidth:0}} activeDot={{r:5}}/></AreaChart></ResponsiveContainer></div>
      </div>

      <div className="card">
        <div style={{padding:"18px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div className="section-title"><Flame size={16} color="var(--rose)"/>Recent Threats</div><div className="section-sub">Latest detections</div></div>
        </div>
        <table><thead><tr><th>Domain</th><th>Type</th><th>Risk</th><th>Country</th><th>Detected</th><th>Status</th></tr></thead>
        <tbody>{recent.map(r=>(<tr key={r.id}><td className="domain-name">{r.domain}</td><td><span className="badge badge-neutral">{r.threatType}</span></td><td>{riskBadge(r.riskLevel)}</td><td style={{color:isDark?"var(--text-secondary)":"#a5b7d0"}}>{r.country}</td><td className="font-mono" style={{color:isDark?"var(--text-muted)":"#cbd5e1",fontSize:12}}>{r.detectedDate}</td><td><span className={`badge ${r.status==="Blocked"?"badge-low":r.status==="Active"?"badge-high":"badge-medium"}`}>{r.status}</span></td></tr>))}</tbody></table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: DOMAIN INTELLIGENCE
═══════════════════════════════════════════════════════════════ */
function DomainIntel({data}:{data:ThreatRecord[]}) {
  const [q,setQ]=useState(""); const [riskF,setRiskF]=useState("All"); const [typeF,setTypeF]=useState("All"); const [statusF,setStatusF]=useState("All");
  const [sortKey,setSortKey]=useState<keyof ThreatRecord>("riskScore"); const [sortAsc,setSortAsc]=useState(false);
  const [expanded,setExpanded]=useState<string|null>(null); const [pg,setPg]=useState(0); const PS=10;

  const filtered=useMemo(()=>{
    let r=data.filter(d=>{if(q&&!d.domain.toLowerCase().includes(q.toLowerCase()))return false;if(riskF!=="All"&&d.riskLevel!==riskF)return false;if(typeF!=="All"&&d.threatType!==typeF)return false;if(statusF!=="All"&&d.status!==statusF)return false;return true;});
    r=[...r].sort((a,b)=>{const av=a[sortKey],bv=b[sortKey];if(typeof av==="number"&&typeof bv==="number")return sortAsc?(av-bv):(bv-av);return sortAsc?String(av).localeCompare(String(bv)):String(bv).localeCompare(String(av));});
    return r;
  },[data,q,riskF,typeF,statusF,sortKey,sortAsc]);
  const totalPg=Math.ceil(filtered.length/PS); const paginated=filtered.slice(pg*PS,(pg+1)*PS);
  function handleSort(k:keyof ThreatRecord){if(sortKey===k)setSortAsc(!sortAsc);else{setSortKey(k);setSortAsc(false);}setPg(0);}

  return (<div>
    <div className="card" style={{padding:16,marginBottom:16,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
      <div style={{position:"relative"}}><Search size={15} style={{position:"absolute",left:12,top:11,color:"var(--text-muted)"}}/><input className="search" placeholder="Search domain…" value={q} onChange={e=>{setQ(e.target.value);setPg(0);}}/></div>
      <select className="filter" value={riskF} onChange={e=>{setRiskF(e.target.value);setPg(0);}}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select>
      <select className="filter" value={typeF} onChange={e=>{setTypeF(e.target.value);setPg(0);}}><option>All</option>{THREAT_TYPES.map(t=><option key={t}>{t}</option>)}</select>
      <select className="filter" value={statusF} onChange={e=>{setStatusF(e.target.value);setPg(0);}}><option>All</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
      <button className="btn" onClick={()=>{setQ("");setRiskF("All");setTypeF("All");setStatusF("All");setPg(0);}}><X size={13}/>Clear</button>
      <div style={{marginLeft:"auto",fontSize:12,color:"var(--text-muted)",fontFamily:"var(--mono)"}}>{filtered.length} of {data.length}</div>
    </div>
    <div className="card">
      <table><thead><tr><th></th><th className="sortable" onClick={()=>handleSort("domain")}>Domain {sortKey==="domain"?(sortAsc?"↑":"↓"):""}</th><th>Type</th><th className="sortable" onClick={()=>handleSort("riskScore")}>Risk {sortKey==="riskScore"?(sortAsc?"↑":"↓"):""}</th><th className="sortable" onClick={()=>handleSort("ageDays")}>Age {sortKey==="ageDays"?(sortAsc?"↑":"↓"):""}</th><th>SSL</th><th>Country</th><th>Similarity</th><th>Status</th></tr></thead>
      <tbody>{paginated.map(d=>(
        <React.Fragment key={d.id}>
          <tr onClick={()=>setExpanded(expanded===d.id?null:d.id)}><td style={{width:20}}>{expanded===d.id?<ChevronDown size={14} color="var(--text-muted)"/>:<ChevronRight size={14} color="var(--text-muted)"/>}</td><td className="domain-name">{d.domain}</td><td><span className="badge badge-neutral">{d.threatType}</span></td><td><div style={{display:"flex",alignItems:"center",gap:8}}><div className="risk-bar-track" style={{background:"rgba(255,255,255,0.12)"}}><div className="risk-bar-fill" style={{width:`${d.riskScore}%`,background:RISK_COLOR[d.riskLevel]}}/></div><span className="font-mono" style={{fontSize:12,color:RISK_COLOR[d.riskLevel],fontWeight:600}}>{d.riskScore}</span></div></td><td className="font-mono" style={{color:"var(--text-muted)",fontSize:12}}>{d.ageDays}d</td><td>{sslBadge(d.sslStatus)}</td><td style={{color:"var(--text-secondary)",fontSize:13}}>{d.country}</td><td className="font-mono" style={{color:"var(--text-muted)",fontSize:12}}>{d.similarityScore?`${d.similarityScore}%`:"—"}</td><td><span className={`badge ${d.status==="Blocked"?"badge-low":d.status==="Active"?"badge-high":"badge-medium"}`}>{d.status}</span></td></tr>
          {expanded===d.id&&(<tr style={{cursor:"default"}}><td colSpan={9} style={{background:"rgba(255,255,255,0.04)",padding:"20px 32px",borderBottom:"2px solid var(--indigo-bg)"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,fontSize:13}}>
              <div><div style={{color:"var(--text-muted)",marginBottom:4,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Registered</div><div className="font-mono" style={{fontWeight:600}}>{d.registrationDate}</div></div>
              <div><div style={{color:"var(--text-muted)",marginBottom:4,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Registrar</div><div style={{fontWeight:500}}>{d.registrar}</div></div>
              <div><div style={{color:"var(--text-muted)",marginBottom:4,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Detected</div><div className="font-mono" style={{fontWeight:600}}>{d.detectedDate}</div></div>
              <div><div style={{color:"var(--text-muted)",marginBottom:4,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Source</div><div style={{fontWeight:500}}>{d.source}</div></div>
            </div>
            {d.redFlags?.length>0&&<div style={{marginTop:16}}><div style={{color:"var(--text-muted)",marginBottom:8,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Red Flags</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{d.redFlags.map((f,i)=><span key={i} className="flag-chip">{f}</span>)}</div></div>}
            <div style={{marginTop:16,display:"flex",gap:10}}><button className="btn" style={{fontSize:12}} onClick={()=>alert(`Investigating: ${d.domain}`)}><ExternalLink size={13}/>Investigate</button><button className="btn btn-danger" style={{fontSize:12}} onClick={()=>alert(`Blocking: ${d.domain}`)}><X size={13}/>Block Domain</button></div>
          </td></tr>)}
        </React.Fragment>
      ))}</tbody></table>
      {filtered.length===0&&<div className="empty-state">No domains match those filters.</div>}
      {filtered.length>0&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderTop:"1px solid var(--border)"}}>
        <span style={{fontSize:12,color:"var(--text-muted)",fontFamily:"var(--mono)"}}>Page {pg+1} of {totalPg} · {filtered.length} results</span>
        <div style={{display:"flex",gap:8}}><button className="pagination-btn" onClick={()=>setPg(p=>Math.max(0,p-1))} disabled={pg===0}>← Prev</button><button className="pagination-btn" onClick={()=>setPg(p=>Math.min(totalPg-1,p+1))} disabled={pg>=totalPg-1}>Next →</button></div>
      </div>}
    </div>
  </div>);
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: TICKETING FRAUD
═══════════════════════════════════════════════════════════════ */
function TicketingFraud({data,isDark}:{data:ThreatRecord[];isDark:boolean}) {
  const tickets=useMemo(()=>data.filter(d=>d.threatType==="Ticket Scam"),[data]);
  const totals=useMemo(()=>({portals:tickets.length,loss:tickets.reduce((a,t)=>a+(t.estimatedLoss||0),0),victims:tickets.reduce((a,t)=>a+(t.affectedUsers||0),0)}),[tickets]);
  const priceComp=useMemo(()=>{const b:Record<string,{tier:string;off:number;scam:number;n:number}>={};tickets.forEach(t=>{if(!t.officialPrice)return;const k=`$${t.officialPrice}`;if(!b[k])b[k]={tier:k,off:t.officialPrice,scam:0,n:0};b[k].scam+=(t.scamPrice??0);b[k].n+=1;});return Object.values(b).map(x=>({tier:x.tier,Official:x.off,"Scam avg":Math.round(x.scam/x.n)}));},[tickets]);
  const flagFreq=useMemo(()=>{const c:Record<string,number>={};tickets.forEach(t=>(t.redFlags||[]).forEach(f=>(c[f]=(c[f]||0)+1)));return Object.entries(c).map(([f,n])=>({flag:f,count:n as number})).sort((a,b)=>b.count-a.count).slice(0,6);},[tickets]);

  return (<div>
    <div className="stat-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
      {[{l:"Fake portals",v:totals.portals,icon:Ticket,color:"var(--rose)",bg:"var(--rose-bg)",fmt:(n:number)=>String(n)},{l:"Estimated losses",v:totals.loss,icon:AlertTriangle,color:"var(--amber)",bg:"var(--amber-bg)",fmt:(n:number)=>`$${n.toLocaleString()}`},{l:"Affected users",v:totals.victims,icon:Users,color:"var(--emerald)",bg:"var(--emerald-bg)",fmt:(n:number)=>n.toLocaleString()}].map((s,i)=>{const Icon=s.icon;return(
        <div className="card stat-card" key={i}><div className="accent-line"/><div className="stat-icon" style={{background:s.bg}}><Icon size={20} color={s.color}/></div><div className="stat-value">{s.fmt(s.v)}</div><div className="stat-label">{s.l}</div></div>
      );})}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      <div className="card" style={{padding:24}}><div className="section-title">Official vs Scam Pricing</div><div className="section-sub">By ticket tier</div><div style={{height:220,marginTop:12}}><ResponsiveContainer width="100%" height="100%"><BarChart data={priceComp}><CartesianGrid stroke={isDark?"rgba(0,194,255,0.08)":"rgba(255,255,255,0.08)"} vertical={false}/><XAxis dataKey="tier" tick={{fill:isDark?"#a5b7d0":"#ffffff",fontSize:12}} axisLine={false} tickLine={false}/><YAxis tick={{fill:isDark?"#677b96":"#a5b7d0",fontSize:12}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:isDark?"#0a1628":"#112240",border:"1px solid var(--border)",borderRadius:10,fontSize:12,boxShadow:"var(--shadow-lg)"}}/><Bar dataKey="Official" fill="var(--emerald)" radius={[6,6,0,0]} barSize={18}/><Bar dataKey="Scam avg" fill="var(--rose)" radius={[6,6,0,0]} barSize={18}/></BarChart></ResponsiveContainer></div></div>
      <div className="card" style={{padding:24}}><div className="section-title">Common Red Flags</div><div className="section-sub">Across ticketing scams</div><div style={{height:220,marginTop:12}}><ResponsiveContainer width="100%" height="100%"><BarChart data={flagFreq} layout="vertical" margin={{left:0,right:16}}><CartesianGrid stroke={isDark?"rgba(0,194,255,0.08)":"rgba(255,255,255,0.08)"} horizontal={false}/><XAxis type="number" hide/><YAxis dataKey="flag" type="category" width={155} tick={{fill:isDark?"#a5b7d0":"#ffffff",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:isDark?"#0a1628":"#112240",border:"1px solid var(--border)",borderRadius:10,fontSize:12,boxShadow:"var(--shadow-lg)"}}/><Bar dataKey="count" fill="var(--indigo)" radius={[0,6,6,0]} barSize={14}/></BarChart></ResponsiveContainer></div></div>
    </div>
    <div className="card"><div style={{padding:"18px 24px",borderBottom:"1px solid var(--border)"}}><div className="section-title">Detected Fake Portals</div><div className="section-sub">{tickets.length} flagged</div></div>
    <table><thead><tr><th>Domain</th><th>Risk</th><th>Scam Price</th><th>Official</th><th>Red Flags</th><th>Est. Loss</th><th>Status</th></tr></thead>
    <tbody>{tickets.slice(0,30).map(t=>(<tr key={t.id}><td className="domain-name">{t.domain}</td><td>{riskBadge(t.riskLevel)}</td><td className="font-mono" style={{color:"var(--rose)",fontWeight:600}}>{t.scamPrice?`$${t.scamPrice}`:"—"}</td><td className="font-mono" style={{color:"var(--text-muted)"}}>{t.officialPrice?`$${t.officialPrice}`:"—"}</td><td><div style={{display:"flex",gap:4,flexWrap:"wrap",maxWidth:200}}>{(t.redFlags||[]).slice(0,2).map((f,i)=><span key={i} className="flag-chip">{f}</span>)}{t.redFlags?.length>2&&<span className="flag-chip">+{t.redFlags.length-2}</span>}</div></td><td className="font-mono" style={{fontWeight:600}}>${(t.estimatedLoss||0).toLocaleString()}</td><td><span className={`badge ${t.status==="Blocked"?"badge-low":t.status==="Active"?"badge-high":"badge-medium"}`}>{t.status}</span></td></tr>))}</tbody></table>
    {tickets.length===0&&<div className="empty-state">No ticket scams found.</div>}</div>
  </div>);
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: SOCIAL & OSINT
═══════════════════════════════════════════════════════════════ */
function SocialOSINT({data,isDark}:{data:ThreatRecord[];isDark:boolean}) {
  const mentions=useMemo(()=>[
    {platform:"Twitter/X",mentions:2847,sentiment:"Negative",change:"+34%",color:"var(--sky)"},
    {platform:"Telegram",mentions:1523,sentiment:"Critical",change:"+67%",color:"var(--rose)"},
    {platform:"Reddit",mentions:892,sentiment:"Mixed",change:"+12%",color:"var(--amber)"},
    {platform:"Dark Web Forums",mentions:341,sentiment:"Critical",change:"+89%",color:"var(--violet)"},
    {platform:"Facebook",mentions:1204,sentiment:"Negative",change:"+21%",color:"var(--indigo)"},
  ],[]);
  const hashtags=useMemo(()=>[
    {tag:"#FIFAtickets",volume:12400,trend:"+45%"},{tag:"#WorldCup2026",volume:89200,trend:"+12%"},
    {tag:"#FIFAscam",volume:3420,trend:"+134%"},{tag:"#cheaptickets",volume:5600,trend:"+67%"},
    {tag:"#fifa2026free",volume:2100,trend:"+200%"},{tag:"#worldcupstream",volume:8900,trend:"+56%"},
  ],[]);
  const sentimentData=useMemo(()=>[
    {date:"Jun 30",positive:120,negative:340,neutral:200},{date:"Jul 1",positive:100,negative:420,neutral:180},
    {date:"Jul 2",positive:90,negative:380,neutral:210},{date:"Jul 3",positive:130,negative:510,neutral:190},
    {date:"Jul 4",positive:110,negative:480,neutral:220},{date:"Jul 5",positive:95,negative:560,neutral:200},
    {date:"Jul 6",positive:80,negative:620,neutral:185},
  ],[]);
  const totalMentions=mentions.reduce((a,m)=>a+m.mentions,0);

  return (<div style={{display:"flex",flexDirection:"column",gap:20}}>
    <div className="stat-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
      <div className="card stat-card"><div className="accent-line"/><div className="stat-icon" style={{background:"var(--sky-bg)"}}><MessageSquare size={20} color="var(--sky)"/></div><div className="stat-value">{totalMentions.toLocaleString()}</div><div className="stat-label">Total Social Mentions</div><div className="trend trend-up"><TrendingUp size={12}/>+34% this week</div></div>
      <div className="card stat-card"><div className="accent-line"/><div className="stat-icon" style={{background:"var(--rose-bg)"}}><AlertTriangle size={20} color="var(--rose)"/></div><div className="stat-value">78%</div><div className="stat-label">Negative Sentiment</div><div className="trend trend-up"><TrendingUp size={12}/>+12% increase</div></div>
      <div className="card stat-card"><div className="accent-line"/><div className="stat-icon" style={{background:"var(--amber-bg)"}}><Hash size={20} color="var(--amber)"/></div><div className="stat-value">{hashtags.length}</div><div className="stat-label">Tracked Hashtags</div><div className="trend trend-up"><TrendingUp size={12}/>3 new this week</div></div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:16}}>
      <div className="card" style={{padding:24}}>
        <div className="section-title"><Activity size={16} color="var(--indigo)"/>Sentiment Trend</div><div className="section-sub">Last 7 days across all platforms</div>
        <div style={{height:220,marginTop:16}}><ResponsiveContainer width="100%" height="100%"><AreaChart data={sentimentData}><defs><linearGradient id="negG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--rose)" stopOpacity={0.2}/><stop offset="100%" stopColor="var(--rose)" stopOpacity={0}/></linearGradient><linearGradient id="posG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--emerald)" stopOpacity={0.2}/><stop offset="100%" stopColor="var(--emerald)" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke={isDark?"rgba(0,194,255,0.08)":"rgba(255,255,255,0.08)"} vertical={false}/><XAxis dataKey="date" tick={{fill:isDark?"#a5b7d0":"#ffffff",fontSize:12}} axisLine={false} tickLine={false}/><YAxis tick={{fill:isDark?"#677b96":"#a5b7d0",fontSize:12}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:isDark?"#0a1628":"#112240",border:"1px solid var(--border)",borderRadius:10,fontSize:12,boxShadow:"var(--shadow-lg)"}}/><Area type="monotone" dataKey="negative" stroke="var(--rose)" strokeWidth={2} fill="url(#negG)"/><Area type="monotone" dataKey="positive" stroke="var(--emerald)" strokeWidth={2} fill="url(#posG)"/><Area type="monotone" dataKey="neutral" stroke="var(--text-muted)" strokeWidth={1.5} fill="none" strokeDasharray="4 4"/></AreaChart></ResponsiveContainer></div>
      </div>
      <div className="card" style={{padding:24}}>
        <div className="section-title"><Hash size={16} color="var(--amber)"/>Trending Hashtags</div><div className="section-sub">FIFA-related scam indicators</div>
        <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:10}}>
          {hashtags.map((h,i)=>(<div key={i} className="activity-item" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:10,transition:"all 0.15s"}}>
            <div><div style={{fontFamily:"var(--mono)",fontSize:13,fontWeight:600,color:"var(--indigo)"}}>{h.tag}</div><div style={{fontSize:11,color:"inherit",opacity:0.6,marginTop:2}}>{h.volume.toLocaleString()} posts</div></div>
            <span className="trend trend-up" style={{fontSize:11}}><TrendingUp size={11}/>{h.trend}</span>
          </div>))}
        </div>
      </div>
    </div>

    <div className="card"><div style={{padding:"18px 24px",borderBottom:"1px solid var(--border)"}}><div className="section-title"><Globe2 size={16} color="var(--indigo)"/>Platform Breakdown</div><div className="section-sub">Mentions by source</div></div>
    <table><thead><tr><th>Platform</th><th>Mentions</th><th>Sentiment</th><th>Change</th></tr></thead>
    <tbody>{mentions.map((m,i)=>(<tr key={i}><td style={{fontWeight:600,color:"var(--text)"}}>{m.platform}</td><td className="font-mono" style={{fontWeight:600}}>{m.mentions.toLocaleString()}</td><td><span className={`badge ${m.sentiment==="Critical"?"badge-high":m.sentiment==="Negative"?"badge-medium":"badge-neutral"}`}>{m.sentiment}</span></td><td><span className="trend trend-up" style={{fontSize:11}}><TrendingUp size={11}/>{m.change}</span></td></tr>))}</tbody></table></div>
  </div>);
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: STREAMING PIRACY
═══════════════════════════════════════════════════════════════ */
function StreamingPiracy({data,isDark}:{data:ThreatRecord[];isDark:boolean}) {
  const streams=useMemo(()=>data.filter(d=>d.threatType==="Streaming Piracy"),[data]);
  const streamData=useMemo(()=>[
    {domain:"worldcup-free.stream",quality:"1080p",viewers:45200,geoBlocked:false,status:"Active",uptime:"99.2%"},
    {domain:"fifa-live-hd.xyz",quality:"720p",viewers:23100,geoBlocked:true,status:"Active",uptime:"94.5%"},
    {domain:"soccer-stream.top",quality:"480p",viewers:12800,geoBlocked:false,status:"Under Review",uptime:"87.3%"},
    {domain:"matchday-free.net",quality:"1080p",viewers:38400,geoBlocked:false,status:"Active",uptime:"96.8%"},
    {domain:"free-worldcup.ru",quality:"720p",viewers:18900,geoBlocked:true,status:"Blocked",uptime:"0%"},
    {domain:"fifa26-stream.info",quality:"4K",viewers:67300,geoBlocked:false,status:"Active",uptime:"98.1%"},
    {domain:"livefootball-hd.com",quality:"1080p",viewers:29700,geoBlocked:false,status:"Under Review",uptime:"91.4%"},
  ],[]);
  const totalViewers=streamData.reduce((a,s)=>a+s.viewers,0);
  const activeStreams=streamData.filter(s=>s.status==="Active").length;
  const viewersByQuality=useMemo(()=>[{quality:"4K",viewers:67300},{quality:"1080p",viewers:113300},{quality:"720p",viewers:42000},{quality:"480p",viewers:12800}],[]);

  return (<div style={{display:"flex",flexDirection:"column",gap:20}}>
    <div className="stat-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
      {[{l:"Active Streams",v:activeStreams,icon:Wifi,color:"var(--rose)",bg:"var(--rose-bg)",fmt:(n:number)=>String(n)},{l:"Total Viewers",v:totalViewers,icon:Eye,color:"var(--violet)",bg:"rgba(139,92,246,0.08)",fmt:(n:number)=>n.toLocaleString()},{l:"Pirate Domains",v:streams.length,icon:Globe2,color:"var(--amber)",bg:"var(--amber-bg)",fmt:(n:number)=>String(n)},{l:"Est. Revenue Loss",v:2340000,icon:Zap,color:"var(--indigo)",bg:"var(--indigo-bg)",fmt:(n:number)=>`$${(n/1000000).toFixed(1)}M`}].map((s,i)=>{const Icon=s.icon;return(
        <div className="card stat-card" key={i}><div className="accent-line"/><div className="stat-icon" style={{background:s.bg}}><Icon size={20} color={s.color}/></div><div className="stat-value">{s.fmt(s.v)}</div><div className="stat-label">{s.l}</div></div>
      );})}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div className="card" style={{padding:24}}><div className="section-title"><BarChart3 size={16} color="var(--indigo)"/>Viewers by Quality</div><div className="section-sub">Stream resolution distribution</div><div style={{height:200,marginTop:16}}><ResponsiveContainer width="100%" height="100%"><BarChart data={viewersByQuality}><CartesianGrid stroke={isDark?"rgba(0,194,255,0.08)":"rgba(255,255,255,0.08)"} vertical={false}/><XAxis dataKey="quality" tick={{fill:isDark?"#a5b7d0":"#ffffff",fontSize:12}} axisLine={false} tickLine={false}/><YAxis tick={{fill:isDark?"#677b96":"#a5b7d0",fontSize:12}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:isDark?"#0a1628":"#112240",border:"1px solid var(--border)",borderRadius:10,fontSize:12,boxShadow:"var(--shadow-lg)"}}/><Bar dataKey="viewers" fill="var(--violet)" radius={[8,8,0,0]} barSize={32}/></BarChart></ResponsiveContainer></div></div>
      <div className="card" style={{padding:24}}><div className="section-title"><Waves size={16} color="var(--sky)"/>Viewership Trend</div><div className="section-sub">Last 7 days concurrent viewers</div><div style={{height:200,marginTop:16}}><ResponsiveContainer width="100%" height="100%"><LineChart data={[{d:"Jun 30",v:45000},{d:"Jul 1",v:52000},{d:"Jul 2",v:48000},{d:"Jul 3",v:89000},{d:"Jul 4",v:125000},{d:"Jul 5",v:110000},{d:"Jul 6",v:135000}]}><CartesianGrid stroke={isDark?"rgba(0,194,255,0.08)":"rgba(255,255,255,0.08)"} vertical={false}/><XAxis dataKey="d" tick={{fill:isDark?"#a5b7d0":"#ffffff",fontSize:12}} axisLine={false} tickLine={false}/><YAxis tick={{fill:isDark?"#677b96":"#a5b7d0",fontSize:12}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:isDark?"#0a1628":"#112240",border:"1px solid var(--border)",borderRadius:10,fontSize:12,boxShadow:"var(--shadow-lg)"}}/><Line type="monotone" dataKey="v" stroke="var(--sky)" strokeWidth={2.5} dot={{fill:"var(--sky)",r:4,strokeWidth:0}}/></LineChart></ResponsiveContainer></div></div>
    </div>
    <div className="card"><div style={{padding:"18px 24px",borderBottom:"1px solid var(--border)"}}><div className="section-title"><Monitor size={16} color="var(--rose)"/>Active Pirate Streams</div><div className="section-sub">{streamData.length} streams tracked</div></div>
    <table><thead><tr><th>Domain</th><th>Quality</th><th>Est. Viewers</th><th>Geo-Blocked</th><th>Uptime</th><th>Status</th></tr></thead>
    <tbody>{streamData.map((s,i)=>(<tr key={i}><td className="domain-name">{s.domain}</td><td><span className="badge badge-info">{s.quality}</span></td><td className="font-mono" style={{fontWeight:600}}>{s.viewers.toLocaleString()}</td><td>{s.geoBlocked?<span className="badge badge-low"><CheckCircle2 size={10}/>Yes</span>:<span className="badge badge-high"><XCircle size={10}/>No</span>}</td><td className="font-mono" style={{color:parseFloat(s.uptime)>90?"var(--emerald)":parseFloat(s.uptime)>0?"var(--amber)":"var(--text-muted)",fontWeight:600}}>{s.uptime}</td><td><span className={`badge ${s.status==="Blocked"?"badge-low":s.status==="Active"?"badge-high":"badge-medium"}`}>{s.status}</span></td></tr>))}</tbody></table></div>
  </div>);
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: ALERTS CENTER
═══════════════════════════════════════════════════════════════ */
function AlertsCenter() {
  const alerts=useMemo(()=>[
    {id:"A-001",severity:"Critical",title:"New fake ticket portal detected",domain:"fifa-ticket-2026.com",time:"2 min ago",resolved:false,desc:"Domain registered 24h ago with 99% visual similarity to FIFA.com. Actively selling fake tickets."},
    {id:"A-002",severity:"Critical",title:"Malware payload detected",domain:"fifa26-news.org",time:"15 min ago",resolved:false,desc:"JavaScript-based credential harvester identified in page source. Targeting FIFA account logins."},
    {id:"A-003",severity:"High",title:"Streaming piracy surge",domain:"worldcup-free.stream",time:"1 hour ago",resolved:false,desc:"67,000+ concurrent viewers detected. Stream rebroadcasting official FIFA feed without authorization."},
    {id:"A-004",severity:"High",title:"Phishing campaign escalation",domain:"fifa-rewards.info",time:"3 hours ago",resolved:false,desc:"Email campaign volume increased 340% in last 24 hours. Spoofing FIFA official communications."},
    {id:"A-005",severity:"Medium",title:"Suspicious domain cluster",domain:"Multiple (12 domains)",time:"5 hours ago",resolved:true,desc:"12 domains registered through same registrar within 2-hour window. Pattern consistent with coordinated scam."},
    {id:"A-006",severity:"Low",title:"SSL certificate expiring",domain:"fifa-monitor.net",time:"12 hours ago",resolved:true,desc:"Monitored domain SSL certificate expires in 7 days. May indicate abandoned scam infrastructure."},
    {id:"A-007",severity:"Medium",title:"Social media scam ads",domain:"facebook.com/ads",time:"1 day ago",resolved:true,desc:"23 Facebook ad campaigns detected promoting fake FIFA ticket deals. Reports filed."},
  ],[]);
  const [filter,setFilter]=useState("All");
  const shown=filter==="All"?alerts:alerts.filter(a=>a.severity===filter);

  return (<div style={{display:"flex",flexDirection:"column",gap:20}}>
    <div className="stat-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
      {[{l:"Critical",v:alerts.filter(a=>a.severity==="Critical").length,color:"var(--rose)",bg:"var(--rose-bg)"},{l:"High",v:alerts.filter(a=>a.severity==="High").length,color:"var(--amber)",bg:"var(--amber-bg)"},{l:"Medium",v:alerts.filter(a=>a.severity==="Medium").length,color:"var(--sky)",bg:"var(--sky-bg)"},{l:"Resolved",v:alerts.filter(a=>a.resolved).length,color:"var(--emerald)",bg:"var(--emerald-bg)"}].map((s,i)=>(
        <div className="card stat-card" key={i}><div className="accent-line"/><div className="stat-icon" style={{background:s.bg}}><Bell size={20} color={s.color}/></div><div className="stat-value">{s.v}</div><div className="stat-label">{s.l} Alerts</div></div>
      ))}
    </div>
    <div className="card" style={{padding:16,display:"flex",gap:8,alignItems:"center"}}>
      <Filter size={15} color="var(--text-muted)"/>
      {["All","Critical","High","Medium","Low"].map(f=>(<button key={f} className="btn" style={{padding:"6px 14px",fontSize:12,background:filter===f?"var(--indigo-bg)":"var(--surface)",color:filter===f?"var(--indigo)":"var(--text-secondary)",borderColor:filter===f?"rgba(99,102,241,0.3)":"var(--border)"}} onClick={()=>setFilter(f)}>{f}</button>))}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {shown.map(a=>(<div key={a.id} className="card" style={{padding:20,borderLeft:`4px solid ${a.severity==="Critical"?"var(--rose)":a.severity==="High"?"var(--amber)":a.severity==="Medium"?"var(--sky)":"var(--emerald)"}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span className={`badge ${a.severity==="Critical"?"badge-high":a.severity==="High"?"badge-medium":a.severity==="Medium"?"badge-info":"badge-low"}`}>{a.severity.toUpperCase()}</span>
              {a.resolved&&<span className="badge badge-low"><CheckCircle2 size={10}/>Resolved</span>}
              <span style={{fontSize:11,color:"var(--text-muted)",marginLeft:"auto",fontFamily:"var(--mono)"}}><Clock size={11} style={{verticalAlign:"middle",marginRight:4}}/>{a.time}</span>
            </div>
            <div style={{fontSize:15,fontWeight:700,color:"inherit",marginBottom:4}}>{a.title}</div>
            <div style={{fontSize:12,color:"var(--text-muted)",fontFamily:"var(--mono)",marginBottom:8}}>{a.domain}</div>
            <div style={{fontSize:13,color:"inherit",opacity:0.8,lineHeight:1.6}}>{a.desc}</div>
          </div>
          {!a.resolved&&<div style={{display:"flex",gap:8,flexShrink:0}}>
            <button className="btn" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>alert(`Investigating: ${a.domain}`)}><ExternalLink size={12}/>Investigate</button>
            <button className="btn btn-danger" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>alert(`Action on: ${a.id}`)}><Zap size={12}/>Take Action</button>
          </div>}
        </div>
      </div>))}
    </div>
  </div>);
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: SETTINGS
═══════════════════════════════════════════════════════════════ */
function SettingsPage({isDark}:{isDark:boolean}) {
  const [autoRefresh,setAutoRefresh]=useState(true);
  const [emailAlerts,setEmailAlerts]=useState(true);
  const [slackAlerts,setSlackAlerts]=useState(false);
  const [scanInterval,setScanInterval]=useState("10");

  const healthItems=useMemo(()=>[
    {name:"Threat Detection Engine",status:"Healthy",uptime:99.8,color:"var(--emerald)"},
    {name:"Domain Scanner",status:"Healthy",uptime:98.5,color:"var(--emerald)"},
    {name:"OSINT Collector",status:"Degraded",uptime:87.2,color:"var(--amber)"},
    {name:"Streaming Monitor",status:"Healthy",uptime:99.1,color:"var(--emerald)"},
    {name:"ML Risk Scorer",status:"Healthy",uptime:97.9,color:"var(--emerald)"},
  ],[]);

  const Toggle=({on,toggle}:{on:boolean;toggle:()=>void})=>(<div className={`toggle${on?" on":""}`} onClick={toggle}><div className="toggle-knob"/></div>);

  return (<div style={{display:"flex",flexDirection:"column",gap:24}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <div className="card" style={{padding:28}}>
        <div className="section-title" style={{marginBottom:20}}><Settings size={16} color="var(--indigo)"/>General Settings</div>
        {[{label:"Auto-refresh dashboard",desc:"Refresh data every scan interval",on:autoRefresh,toggle:()=>setAutoRefresh(!autoRefresh)},{label:"Email alerts",desc:"Send critical alerts to your email",on:emailAlerts,toggle:()=>setEmailAlerts(!emailAlerts)},{label:"Slack notifications",desc:"Post alerts to #security-ops channel",on:slackAlerts,toggle:()=>setSlackAlerts(!slackAlerts)}].map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:i<2?`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"}`:"none"}}>
            <div><div style={{fontSize:14,fontWeight:600,color:"inherit"}}>{s.label}</div><div style={{fontSize:12,color:"inherit",opacity:0.7,marginTop:2}}>{s.desc}</div></div>
            <Toggle on={s.on} toggle={s.toggle}/>
          </div>
        ))}
        <div style={{marginTop:20}}>
          <div style={{fontSize:14,fontWeight:600,color:"inherit",marginBottom:8}}>Scan Interval</div>
          <select className="filter" value={scanInterval} onChange={e=>setScanInterval(e.target.value)} style={{width:"100%"}}>
            <option value="5">Every 5 seconds</option><option value="10">Every 10 seconds</option><option value="30">Every 30 seconds</option><option value="60">Every 60 seconds</option>
          </select>
        </div>
      </div>
      <div className="card" style={{padding:28}}>
        <div className="section-title" style={{marginBottom:20}}><Server size={16} color="var(--indigo)"/>System Health</div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {healthItems.map((h,i)=>(<div key={i}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:13,fontWeight:600,color:"inherit"}}>{h.name}</span>
              <span className={`badge ${h.status==="Healthy"?"badge-low":"badge-medium"}`}>{h.status}</span>
            </div>
            <div className="health-bar"><div className="health-fill" style={{width:`${h.uptime}%`,background:h.color}}/></div>
            <div style={{fontSize:11,color:"inherit",opacity:0.6,marginTop:4,fontFamily:"var(--mono)"}}>{h.uptime}% uptime</div>
          </div>))}
        </div>
      </div>
    </div>
    <div className="card" style={{padding:28}}>
      <div className="section-title" style={{marginBottom:20}}><FileText size={16} color="var(--indigo)"/>About</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,fontSize:13}}>
        <div><div style={{color:"inherit",opacity:0.6,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Version</div><div className="font-mono" style={{fontWeight:700}}>v2.0.0</div></div>
        <div><div style={{color:"inherit",opacity:0.6,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Build</div><div className="font-mono" style={{fontWeight:700}}>2026.07.06</div></div>
        <div><div style={{color:"inherit",opacity:0.6,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>License</div><div style={{fontWeight:700}}>Enterprise</div></div>
      </div>
    </div>
  </div>);
}

/* ═══════════════════════════════════════════════════════════════
   AUTH SYSTEM — Login / Sign Up / Forgot Password
═══════════════════════════════════════════════════════════════ */
const AUTH_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  .auth-root {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #050b16; position: relative; overflow: hidden;
    font-family: 'Inter', sans-serif;
  }
  .auth-bg {
    position: absolute; inset: 0; z-index: 0;
    background-image:
      radial-gradient(circle at 15% 25%, rgba(99,102,241,0.14) 0%, transparent 50%),
      radial-gradient(circle at 85% 75%, rgba(167,139,250,0.11) 0%, transparent 50%),
      radial-gradient(circle at 50% 10%, rgba(0,194,255,0.06) 0%, transparent 45%);
  }
  .auth-bg::before {
    content: ''; position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52'%3E%3Cpolygon points='30,2 58,17 58,35 30,50 2,35 2,17' fill='none' stroke='rgba(99,102,241,0.055)' stroke-width='1'/%3E%3C/svg%3E");
    background-size: 60px 52px;
    animation: authHexMove 40s linear infinite;
  }
  @keyframes authHexMove { from{background-position:0 0} to{background-position:120px 104px} }

  .auth-orb {
    position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; animation: authOrbFloat 9s ease-in-out infinite;
  }
  .auth-orb-1 { width: 450px; height: 450px; top:-120px; left:-120px; background:rgba(99,102,241,0.16); animation-delay:0s; }
  .auth-orb-2 { width: 320px; height: 320px; bottom:-90px; right:-90px; background:rgba(167,139,250,0.13); animation-delay:-4s; }
  .auth-orb-3 { width: 220px; height: 220px; top:45%; right:15%; background:rgba(0,255,210,0.07); animation-delay:-7s; }
  @keyframes authOrbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-22px) scale(1.06)} }

  /* Scanline overlay */
  .auth-scanlines {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
  }

  .auth-card {
    position: relative; z-index: 2; width: 440px;
    padding: 40px 40px 32px;
    background: rgba(8,18,36,0.90);
    border-radius: 24px;
    border: 1px solid rgba(0,194,255,0.13);
    box-shadow: 0 30px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04);
    backdrop-filter: blur(24px);
    animation: authCardIn 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes authCardIn { from{opacity:0;transform:translateY(28px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }

  .auth-input-wrap { position: relative; }
  .auth-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #4a5e7a; }
  .auth-input {
    width: 100%; padding: 12px 42px 12px 42px; border-radius: 12px; font-size: 14px;
    background: rgba(255,255,255,0.04); border: 1.5px solid rgba(99,102,241,0.14);
    color: #f0f5fc; outline: none; transition: all 0.22s ease;
    font-family: inherit;
  }
  .auth-input::placeholder { color: rgba(100,120,150,0.65); }
  .auth-input:focus { border-color: #6366f1; background: rgba(99,102,241,0.07); box-shadow: 0 0 0 3px rgba(99,102,241,0.13); }
  .auth-input.error-field { border-color: rgba(255,42,95,0.5); }
  .auth-input.success-field { border-color: rgba(0,255,210,0.4); }

  .auth-btn-primary {
    width: 100%; padding: 13px; border-radius: 12px; font-size: 15px; font-weight: 700;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%);
    color: #fff; border: none; cursor: pointer; letter-spacing: 0.02em;
    box-shadow: 0 4px 22px rgba(99,102,241,0.42);
    transition: all 0.22s ease; position: relative; overflow: hidden;
    font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .auth-btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    transform: translateX(-100%); transition: transform 0.5s ease;
  }
  .auth-btn-primary:hover::after { transform: translateX(100%); }
  .auth-btn-primary:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(99,102,241,0.55); }
  .auth-btn-primary:active { transform: translateY(0); }
  .auth-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .auth-btn-secondary {
    width: 100%; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600;
    background: rgba(99,102,241,0.08); border: 1.5px solid rgba(99,102,241,0.2);
    color: #a5b7d0; cursor: pointer; transition: all 0.2s ease;
    font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .auth-btn-secondary:hover { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.4); color: #f0f5fc; }

  .auth-link {
    background: none; border: none; cursor: pointer; font-family: inherit;
    font-size: 13px; font-weight: 600; color: #6366f1; text-decoration: underline;
    text-underline-offset: 3px; padding: 0; transition: color 0.15s;
  }
  .auth-link:hover { color: #a78bfa; }

  .auth-error {
    background: rgba(255,42,95,0.09); border: 1px solid rgba(255,42,95,0.28);
    border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #ff5575;
    display: flex; align-items: center; gap: 8px;
    animation: authShake 0.38s ease;
  }
  @keyframes authShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 60%{transform:translateX(7px)} 80%{transform:translateX(-4px)} }

  .auth-success {
    background: rgba(0,255,210,0.08); border: 1px solid rgba(0,255,210,0.25);
    border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #00ffd2;
    display: flex; align-items: center; gap: 8px;
  }

  .auth-divider { display:flex; align-items:center; gap:12; margin:18px 0; }
  .auth-divider-line { flex:1; height:1px; background:rgba(255,255,255,0.07); }
  .auth-divider-label { font-size:11px; color:#3b4d66; font-weight:600; letter-spacing:0.06em; white-space:nowrap; }

  .strength-bar { height: 4px; border-radius: 4px; transition: width 0.4s ease, background 0.4s ease; }

  .auth-tabs { display:flex; gap:4; background:rgba(255,255,255,0.04); padding:4px; border-radius:12px; margin-bottom:24px; }
  .auth-tab {
    flex:1; padding:8px; border-radius:9px; border:none; font-family:inherit;
    font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s;
    color:#677b96; background:transparent;
  }
  .auth-tab.active { background:rgba(99,102,241,0.18); color:#a5b7d0; box-shadow:0 2px 8px rgba(0,0,0,0.2); }

  .field-label { font-size:12px; font-weight:600; color:#677b96; margin-bottom:6px; letter-spacing:0.04em; text-transform:uppercase; }
  .field-hint { font-size:11px; color:#3b4d66; margin-top:5px; }

  @keyframes authSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .spinning { animation: authSpin 1s linear infinite; }
`;

/* ── helpers ── */
function pwStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  const map: [string, string][] = [
    ["Too short", "#ff2a5f"], ["Weak", "#ff6b35"], ["Fair", "#f59e0b"],
    ["Good", "#6366f1"], ["Strong", "#00ffd2"],
  ];
  const [label, color] = map[Math.min(score, 4)];
  return { score, label, color };
}

interface AuthAccount { name: string; email: string; password: string; }
interface AuthPageProps { onLogin: (name: string) => void; }

/* ═══════════════════════════════════════════════════════════════
   AUTH SYSTEM — Fixed Input Handling
═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   AUTH SYSTEM — COMPLETELY FIXED INPUT HANDLING
═══════════════════════════════════════════════════════════════ */
function AuthPage({ onLogin }: AuthPageProps) {
  /* ─── view: "signin" | "signup" | "forgot" ─── */
  const [view, setView] = useState<"signin" | "signup" | "forgot">("signin");

  /* ─── shared fields ─── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* ─── sign-up only fields ─── */
  const [fullName, setFullName] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  /* ─── local account store ─── */
  const [accounts] = useState<AuthAccount[]>([
    { name: "Abhinav Kumar", email: "analyst@sentinel7.io", password: "FIFA2026#" },
  ]);

  const strength = pwStrength(password);

  /* ── clear state on view switch ── */
  const switchView = (v: "signin" | "signup" | "forgot") => {
    setView(v); setError(null); setSuccess(null);
    setEmail(""); setPassword(""); setConfirmPwd(""); setFullName("");
    setShowPwd(false); setShowConfirm(false);
  };

  /* ── Sign In ── */
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password) { setError("Please enter your password."); return; }
    setLoading(true);
    setTimeout(() => {
      const acc = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
      if (!acc) { setLoading(false); setError("No account found with that email. Create one below!"); return; }
      if (acc.password !== password) { setLoading(false); setError("Wrong password. Try again or reset it."); return; }
      setLoading(false);
      onLogin(acc.name);
    }, 900);
  };

  /* ── Sign Up ── */
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!fullName.trim()) { setError("Please enter your full name."); return; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPwd) { setError("Passwords do not match. Please check and try again."); return; }
    if (accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase())) {
      setError("An account with this email already exists. Sign in instead."); return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(fullName.trim());
    }, 1000);
  };

  /* ── Forgot Password ── */
  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSuccess(null);
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const acc = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
      if (acc) {
        setSuccess(`Password reset link sent to ${email}.`);
      } else {
        setError("No account found with that email address.");
      }
    }, 1000);
  };

  /* ──────── LOGO ──────── */
  const Logo = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
      <div style={{ width: 46, height: 46, borderRadius: 13, background: "linear-gradient(135deg,#6366f1,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.45)", flexShrink: 0 }}>
        <Shield size={20} color="#fff" strokeWidth={2.5} />
      </div>
      <div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 800, color: "#f0f5fc", letterSpacing: "-0.02em" }}>SENTINEL/7</div>
        <div style={{ fontSize: 10, color: "#4a5e7a", letterSpacing: "0.1em", fontWeight: 600 }}>FIFA CYBER THREAT INTEL</div>
      </div>
    </div>
  );

  const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle}
      style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#4a5e7a", display: "flex", padding: 0, zIndex: 5 }}>
      <Eye size={15} />
    </button>
  );

  return (
    <div className="auth-root">
      <style>{AUTH_STYLE}</style>
      <div className="auth-bg" />
      <div className="auth-scanlines" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <div className="auth-card" key={view}>

        <Logo />

        {/* ═══ SIGN IN VIEW ═══ */}
        {view === "signin" && (
          <>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f5fc", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.02em", marginBottom: 4 }}>Welcome back</div>
              <div style={{ fontSize: 13, color: "#677b96" }}>Sign in to your analyst account</div>
            </div>

            <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Email Field */}
              <div>
                <div className="field-label">Email Address</div>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Users size={15} /></span>
                  <input 
                    type="email" 
                    className="auth-input" 
                    placeholder="analyst@sentinel7.io"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={{ width: "100%", paddingLeft: "42px" }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div className="field-label" style={{ margin: 0 }}>Password</div>
                  <button type="button" className="auth-link" style={{ fontSize: 12 }} onClick={() => switchView("forgot")}>Forgot password?</button>
                </div>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Lock size={15} /></span>
                  <input 
                    type={showPwd ? "text" : "password"} 
                    className="auth-input" 
                    placeholder="Enter your password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={{ width: "100%", paddingLeft: "42px" }}
                  />
                  <EyeBtn show={showPwd} toggle={() => setShowPwd(v => !v)} />
                </div>
              </div>

              {error && <div className="auth-error"><AlertTriangle size={14} />{error}</div>}

              <button type="submit" className="auth-btn-primary" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? <><RefreshCw size={15} className="spinning" />Signing in…</> : <><Shield size={15} />Sign In to Dashboard</>}
              </button>
            </form>

            <div className="auth-divider"><div className="auth-divider-line" /><span className="auth-divider-label">New to Sentinel/7?</span><div className="auth-divider-line" /></div>

            <button type="button" className="auth-btn-secondary" onClick={() => switchView("signup")}>
              <Users size={15} />Create a free account
            </button>

            {/* Demo credentials */}
            <div style={{ marginTop: 18, padding: "10px 14px", background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 10, cursor: "pointer" }}
              onClick={() => { setEmail("analyst@sentinel7.io"); setPassword("FIFA2026#"); setError(null); }}>
              <div style={{ fontSize: 11, color: "#4a5e7a", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 5 }}>⚡ DEMO CREDENTIALS — click to fill</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#a5b7d0" }}>analyst@sentinel7.io</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#6366f1" }}>FIFA2026#</span>
              </div>
            </div>
          </>
        )}

        {/* ═══ SIGN UP VIEW ═══ */}
        {view === "signup" && (
          <>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f5fc", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.02em", marginBottom: 4 }}>Create account</div>
              <div style={{ fontSize: 13, color: "#677b96" }}>Join the FIFA Threat Intelligence platform</div>
            </div>

            <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {/* Full Name */}
              <div>
                <div className="field-label">Full Name</div>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Users size={15} /></span>
                  <input 
                    type="text" 
                    className="auth-input" 
                    placeholder="e.g. Abhinav Kumar"
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    style={{ width: "100%", paddingLeft: "42px" }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <div className="field-label">Email Address</div>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Activity size={15} /></span>
                  <input 
                    type="email" 
                    className="auth-input" 
                    placeholder="you@organisation.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={{ width: "100%", paddingLeft: "42px" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="field-label">Password</div>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Lock size={15} /></span>
                  <input 
                    type={showPwd ? "text" : "password"} 
                    className={`auth-input${password && password.length < 8 ? " error-field" : password.length >= 8 ? " success-field" : ""}`}
                    placeholder="Minimum 8 characters"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={{ width: "100%", paddingLeft: "42px" }}
                  />
                  <EyeBtn show={showPwd} toggle={() => setShowPwd(v => !v)} />
                </div>
                {password.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                      {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className="strength-bar" style={{ flex: 1, background: i < strength.score ? strength.color : "rgba(255,255,255,0.08)" }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>Strength: {strength.label}</div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="field-label">Confirm Password</div>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Lock size={15} /></span>
                  <input 
                    type={showConfirm ? "text" : "password"} 
                    className={`auth-input${confirmPwd.length > 0 ? (confirmPwd === password ? " success-field" : " error-field") : ""}`}
                    placeholder="Repeat your password"
                    value={confirmPwd} 
                    onChange={(e) => setConfirmPwd(e.target.value)} 
                    style={{ width: "100%", paddingLeft: "42px" }}
                  />
                  <EyeBtn show={showConfirm} toggle={() => setShowConfirm(v => !v)} />
                </div>
                {confirmPwd.length > 0 && confirmPwd !== password && (
                  <div className="field-hint" style={{ color: "#ff5575" }}>Passwords don't match</div>
                )}
                {confirmPwd.length > 0 && confirmPwd === password && (
                  <div className="field-hint" style={{ color: "#00ffd2" }}>✓ Passwords match</div>
                )}
              </div>

              {error && <div className="auth-error"><AlertTriangle size={14} />{error}</div>}

              <button type="submit" className="auth-btn-primary" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? <><RefreshCw size={15} className="spinning" />Creating account…</> : <><Shield size={15} />Create Account</>}
              </button>
            </form>

            <div className="auth-divider"><div className="auth-divider-line" /><span className="auth-divider-label">Already have an account?</span><div className="auth-divider-line" /></div>

            <button type="button" className="auth-btn-secondary" onClick={() => switchView("signin")}>
              <Lock size={15} />Back to Sign In
            </button>
          </>
        )}

        {/* ═══ FORGOT PASSWORD VIEW ═══ */}
        {view === "forgot" && (
          <>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f5fc", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.02em", marginBottom: 4 }}>Reset Password</div>
              <div style={{ fontSize: 13, color: "#677b96" }}>Enter your email and we'll send you a reset link</div>
            </div>

            <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div className="field-label">Email Address</div>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Users size={15} /></span>
                  <input 
                    type="email" 
                    className="auth-input" 
                    placeholder="your@email.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={{ width: "100%", paddingLeft: "42px" }}
                  />
                </div>
              </div>

              {error && <div className="auth-error"><AlertTriangle size={14} />{error}</div>}
              {success && <div className="auth-success"><CheckCircle2 size={14} />{success}</div>}

              <button type="submit" className="auth-btn-primary" disabled={loading || !!success} style={{ marginTop: 4 }}>
                {loading ? <><RefreshCw size={15} className="spinning" />Sending link…</> : <><Zap size={15} />Send Reset Link</>}
              </button>
            </form>

            <div className="auth-divider"><div className="auth-divider-line" /><span className="auth-divider-label">Remember your password?</span><div className="auth-divider-line" /></div>

            <button type="button" className="auth-btn-secondary" onClick={() => switchView("signin")}>
              <Lock size={15} />Back to Sign In
            </button>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <span style={{ fontSize: 13, color: "#677b96" }}>No account? </span>
              <button type="button" className="auth-link" onClick={() => switchView("signup")}>Create one now</button>
            </div>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 22, fontSize: 11, color: "#2a3a52" }}>
          Protected by SENTINEL/7 · v2.0 · FIFA Threat Intelligence Platform
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [data, setData] = useState<ThreatRecord[]>(() => generateMockData(180));
  const [dataSource, setDataSource] = useState("Mock dataset · 180 records");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpload = useCallback((file: File) => {
    setUploadError(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const n: ThreatRecord[] = (results.data as Record<string, string>[])
            .filter((r) => r.domain)
            .map((r, i) => normalizeCSVRow(r, i));
          if (!n.length) throw new Error("empty");
          setData(n);
          setDataSource(`${file.name} · ${n.length} records`);
        } catch {
          setUploadError("Couldn't parse CSV — check it has a header row.");
        }
      },
      error: () => setUploadError("Failed to read the CSV file."),
    });
  }, []);

  const handleScan = useCallback(() => alert("Initiating live threat scan across all pipelines…"), []);
  const handleExport = useCallback(() => {
    const csv = [
      "id,domain,threatType,riskScore,riskLevel,country,status",
      ...data.slice(0, 50).map(
        (d) =>
          `${d.id},${d.domain},${d.threatType},${d.riskScore},${d.riskLevel},${d.country},${d.status}`
      ),
    ].join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "sentinel7-export.csv";
    a.click();
  }, [data]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUserName("");
  }, []);

  type PK = "dashboard" | "domains" | "tickets" | "social" | "streaming" | "alerts" | "settings";
  const titles: Record<PK, [string, string]> = {
    dashboard: ["Threat Overview", "Real-time snapshot across all detection pipelines"],
    domains: ["Domain Intelligence", "Detect & analyze fraudulent FIFA domains"],
    tickets: ["Ticketing Fraud Monitor", "Fake portals, pricing anomalies & victim impact"],
    social: ["Social & OSINT", "Social media mentions, sentiment analysis & trending indicators"],
    streaming: ["Streaming Piracy", "Illegal stream monitoring, geo-blocking & viewership estimates"],
    alerts: ["Alerts Center", "Critical notifications & incident response"],
    settings: ["Settings", "System configuration, health monitoring & preferences"],
  };
  const [t0, t1] = titles[page as PK] ?? ["Dashboard", ""];

  if (!mounted) return null;

  /* ── Auth gate ── */
  if (!isLoggedIn) return <AuthPage onLogin={(name) => { setUserName(name); setIsLoggedIn(true); }} />;

  return (
    <div className={`stg-root ${isDark ? "theme-dark" : "theme-light"}`}>
      <style>{TOKENS}</style>
      <div className="bg-decor" />
      
      {/* Sidebar Component */}
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} userName={userName} onLogout={handleLogout} />
      
      <div className="main">
        <TopBar
          title={t0}
          subtitle={t1}
          onUpload={handleUpload}
          dataSource={dataSource}
          onScan={handleScan}
          onExport={handleExport}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
        {uploadError && (
          <div
            style={{
              margin: "14px 28px 0",
              padding: "12px 16px",
              background: "var(--rose-bg)",
              border: "1px solid rgba(244,63,94,0.2)",
              borderRadius: 10,
              fontSize: 13,
              color: "var(--rose)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 500,
            }}
          >
            <AlertTriangle size={14} />
            {uploadError}
            <X size={14} style={{ marginLeft: "auto", cursor: "pointer" }} onClick={() => setUploadError(null)} />
          </div>
        )}
        <div className="content">
          {page === "dashboard" && <Dashboard data={data} isDark={isDark} />}
          {page === "domains" && <DomainIntel data={data} />}
          {page === "tickets" && <TicketingFraud data={data} isDark={isDark} />}
          {page === "social" && <SocialOSINT data={data} isDark={isDark} />}
          {page === "streaming" && <StreamingPiracy data={data} isDark={isDark} />}
          {page === "alerts" && <AlertsCenter />}
          {page === "settings" && <SettingsPage isDark={isDark} />}
        </div>
        
        {/* Footer */}
        <div
          style={{
            padding: "16px 32px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          <span style={{ fontFamily: "var(--mono)", fontWeight: 500 }}>
            SENTINEL/7 v2.0 · FIFA Cyber Threat Intelligence
          </span>
          <span style={{ fontFamily: "var(--mono)" }}>
            {data.length.toLocaleString()} domains · {mounted ? new Date().toLocaleDateString() : ""}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            © 2026 FIFA Threat Intel
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "1px solid rgba(244,63,94,0.25)",
                color: "var(--rose)",
                borderRadius: 6,
                padding: "2px 10px",
                fontSize: 11,
                cursor: "pointer",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <LogOut size={10} />
              Logout
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}