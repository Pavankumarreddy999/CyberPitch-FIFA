"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Globe, 
  AlertTriangle, 
  Shield, 
  Activity,
  Search,
  Clock,
  ArrowUpRight,
  RefreshCw,
  X,
  CheckCircle,
  HelpCircle,
  FileText,
  Lock,
  Calendar,
  AlertCircle
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ThreatTable } from "@/components/dashboard/ThreatTable";
import { SeverityChart } from "@/components/dashboard/SeverityChart";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { fetchDashboardData, analyzeDomain } from "@/services/api/dashboard";
import { Threat } from "@/lib/types";
import { formatDate, getRiskScoreColor, getSeverityColor } from "@/lib/utils";

export default function DashboardPage() {
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Scan Modal States
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [scanDomainName, setScanDomainName] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<string[]>([]);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    refetchInterval: 30000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Simulate progress logs during analysis to look real-time
  const runProgressSimulation = async () => {
    setScanProgress([]);
    const logs = [
      "🔍 Extracting domain lexical features...",
      "🌐 Resolving DNS records & SPF settings...",
      "🛡️ Analyzing SSL certificate expiration & issuer...",
      "📜 Querying WHOIS age & registration country...",
      "📄 Scraping HTML elements for forms & scripts...",
      "🤖 Evaluating features in Random Forest ML classifier...",
      "✅ Threat intelligence pipeline complete!"
    ];

    for (let i = 0; i < logs.length; i++) {
      setScanProgress(prev => [...prev, logs[i]]);
      await new Promise(resolve => setTimeout(resolve, 550));
    }
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanDomainName) return;

    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      // Run visual progress simulation alongside the api call
      const apiPromise = analyzeDomain(scanDomainName);
      await runProgressSimulation();
      
      const res = await apiPromise;
      if (res.success && res.data) {
        setScanResult(res.data);
        await refetch(); // Reload stats and recent threats
      } else {
        setScanError(res.error || "Analysis failed.");
      }
    } catch (err: any) {
      setScanError(err.message || "An unexpected error occurred during scan.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCloseScan = () => {
    setIsScanOpen(false);
    setScanDomainName("");
    setScanResult(null);
    setScanError(null);
    setScanProgress([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Please check if the FastAPI backend is running on port 8000</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalDomains: 0,
    threatsDetected: 0,
    highRiskDomains: 0,
    activeCampaigns: 0,
    domainsScannedToday: 0,
    averageRiskScore: 0,
  };

  const threats = data?.threats || [];
  const severityData = data?.severityDistribution || { critical: 0, high: 0, medium: 0, low: 0 };
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center tracking-tight">
              <Shield className="w-8 h-8 mr-3 text-blue-600" />
              FIFA Cyber Threat Intelligence Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Real-time monitoring of FIFA-related scams, fraud, and piracy threats via ML predictive pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              onClick={() => setIsScanOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
            >
              <Search className="w-4 h-4" />
              Scan New Domain
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Domains Scanned"
            value={stats.totalDomains.toLocaleString()}
            icon={Globe}
            description={`${stats.domainsScannedToday} scanned today`}
          />
          <StatCard
            title="Threats Detected"
            value={stats.threatsDetected.toLocaleString()}
            icon={AlertTriangle}
            trend={{ value: stats.totalDomains > 0 ? Math.round((stats.threatsDetected / stats.totalDomains) * 100) : 0, isPositive: false }}
            description="Confidence malicious score"
          />
          <StatCard
            title="High Risk Domains"
            value={stats.highRiskDomains.toLocaleString()}
            icon={Shield}
            description="Score >= 70"
          />
          <StatCard
            title="Active Scam Campaigns"
            value={stats.activeCampaigns}
            icon={Activity}
            description="Unique malicious types"
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Threat Severity Distribution</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">Distribution of threats by severity level</CardDescription>
            </CardHeader>
            <CardContent>
              <SeverityChart 
                data={[
                  { name: "Critical", value: severityData.critical },
                  { name: "High", value: severityData.high },
                  { name: "Medium", value: severityData.medium },
                  { name: "Low", value: severityData.low },
                ]} 
              />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Clock className="w-5 h-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">Latest threat intelligence events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No recent scans</p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0">
                      <div className={`w-2.5 h-2.5 mt-1.5 rounded-full ${activity.action.includes("Threat") ? "bg-red-500" : "bg-green-500"} flex-shrink-0`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate font-mono">
                          {activity.domain}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Threat Details Panel (Interactive) */}
        {selectedThreat && (
          <Card className="mb-8 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900/50 relative overflow-hidden">
            <button 
              onClick={() => setSelectedThreat(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant={selectedThreat.severity}>{selectedThreat.severity.toUpperCase()}</Badge>
                <CardTitle className="text-xl text-gray-900 dark:text-white font-mono">{selectedThreat.domain}</CardTitle>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-400">Detailed prediction logs and classifier breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Risk Assessment</span>
                    <span className={`text-3xl font-black ${getRiskScoreColor(selectedThreat.riskScore)} mt-2 block`}>
                      {selectedThreat.riskScore}/100
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1 block">
                      Threat Category: <strong className="text-gray-800 dark:text-gray-200">{selectedThreat.threatType}</strong>
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-[11px] text-gray-400 font-bold uppercase block">Recommended Action</span>
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">
                      {selectedThreat.details?.recommendedAction || "Monitor Traffic"}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 md:col-span-2">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Lexical & Network Features</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="p-2 bg-gray-50 dark:bg-gray-950 rounded">
                      <span className="text-gray-400 block">WHOIS Age</span>
                      <span className="text-gray-800 dark:text-gray-200 font-semibold">{selectedThreat.details?.whoisAge || "Unknown"}</span>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-950 rounded">
                      <span className="text-gray-400 block">SSL Status</span>
                      <span className="text-gray-800 dark:text-gray-200 font-semibold">{selectedThreat.details?.sslStatus || "Unknown"}</span>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-950 rounded">
                      <span className="text-gray-400 block">Visual Similarity</span>
                      <span className="text-gray-800 dark:text-gray-200 font-semibold">{selectedThreat.details?.visualSimilarity || 0}%</span>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-950 rounded">
                      <span className="text-gray-400 block">ML Probability</span>
                      <span className="text-gray-800 dark:text-gray-200 font-semibold">{selectedThreat.details?.phishingProbability || 0}%</span>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-950 rounded col-span-2">
                      <span className="text-gray-400 block">Detected Status</span>
                      <span className="text-gray-800 dark:text-gray-200 font-semibold">{selectedThreat.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Threats Table */}
        <ThreatTable 
          threats={threats}
          onRowClick={(threat) => setSelectedThreat(threat)}
        />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-6">
          <p>
            FIFA Cyber Threat Intelligence Platform v1.0 | 
            Powered by Random Forest ML Classifier | 
            Last scan: {new Date().toLocaleString()}
          </p>
          <p className="mt-1 text-xs">
            © 2026 FIFA Cyber Threat Intelligence | All rights reserved
          </p>
        </div>
      </div>

      {/* SCAN MODAL (Stunning Interactive UI Overlay) */}
      {isScanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <Search className="w-5 h-5 mr-2 text-blue-600 animate-pulse" />
                FIFA Cyber Phishing Domain Scanner
              </h2>
              <button 
                onClick={handleCloseScan}
                disabled={isScanning}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Form Input */}
              <form onSubmit={handleScanSubmit} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter suspicious domain name (e.g. worldcup2026-rewards.site)"
                  value={scanDomainName}
                  onChange={(e) => setScanDomainName(e.target.value)}
                  disabled={isScanning}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <Button 
                  type="submit"
                  disabled={isScanning || !scanDomainName}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isScanning ? "Scanning..." : "Start ML Scan"}
                </Button>
              </form>

              {/* Progress Logs (Scanning mode) */}
              {isScanning && (
                <div className="bg-gray-950 text-green-400 font-mono text-xs p-4 rounded-lg border border-gray-800 space-y-2 max-h-[200px] overflow-y-auto shadow-inner">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-800 text-gray-400">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-t border-b border-green-500"></div>
                    <span>Scanner pipeline running...</span>
                  </div>
                  {scanProgress.map((prog, idx) => (
                    <p key={idx} className="animate-fade-in">
                      {prog}
                    </p>
                  ))}
                </div>
              )}

              {/* Scan Error */}
              {scanError && (
                <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-4 rounded text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-800 dark:text-red-300">Scan Pipeline Error</h4>
                    <p className="text-red-700 dark:text-red-400 mt-1">{scanError}</p>
                  </div>
                </div>
              )}

              {/* Scan Results Display */}
              {scanResult && (
                <div className="space-y-6 animate-fade-in">
                  {/* Summary & circular gauge */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Gauge panel */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block mb-4">Pipeline Risk Assessment</span>
                      <div className="relative flex items-center justify-center">
                        {/* Custom Circular Risk Score */}
                        <div className="w-28 h-28 rounded-full border-8 border-gray-200 dark:border-gray-800 flex items-center justify-center relative">
                          <span className={`text-3xl font-black ${getRiskScoreColor(scanResult["Risk Score"])}`}>
                            {scanResult["Risk Score"]}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Badge variant={scanResult["Severity"].toLowerCase()}>{scanResult["Severity"].toUpperCase()}</Badge>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white block mt-2">
                          Threat: {scanResult["Threat Type"]}
                        </span>
                      </div>
                    </div>

                    {/* Explanations Panel */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 md:col-span-2 flex flex-col justify-between">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block mb-3">ML Classifier Explanation (SHAP Indicators)</span>
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {scanResult["Explanations"] && scanResult["Explanations"].length > 0 ? (
                            scanResult["Explanations"].map((exp: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                                <span className="text-red-500 font-bold mt-0.5">•</span>
                                <p>{exp}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">No high-risk parameters found.</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Recommended Action</span>
                          <span className="text-xs font-semibold text-red-600 dark:text-red-400">{scanResult["Recommended Action"]}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Status</span>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{scanResult["Status"]}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Complete 21 Features Table */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Extracted Aggregated Features (Dataset Columns Map)
                    </h3>
                    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden max-h-[240px] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-xs font-mono">
                        <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left font-bold text-gray-500 uppercase">Dataset Feature Name</th>
                            <th className="px-4 py-2 text-left font-bold text-gray-500 uppercase">Value</th>
                            <th className="px-4 py-2 text-left font-bold text-gray-500 uppercase">Classification Category</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
                          {/* Row mappings */}
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Domain ID</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white font-bold">{scanResult["Domain ID"]}</td>
                            <td className="px-4 py-2 text-gray-400">Identifier</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Domain Name</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Domain Name"]}</td>
                            <td className="px-4 py-2 text-gray-400">Lexical</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">TLD</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["TLD"]}</td>
                            <td className="px-4 py-2 text-gray-400">Lexical</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Domain Length</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Domain Length"]}</td>
                            <td className="px-4 py-2 text-gray-400">Lexical</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Subdomain Count</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Subdomain Count"]}</td>
                            <td className="px-4 py-2 text-gray-400">Lexical</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Hyphen Count</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Hyphen Count"]}</td>
                            <td className="px-4 py-2 text-gray-400">Lexical</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Digit Count</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Digit Count"]}</td>
                            <td className="px-4 py-2 text-gray-400">Lexical</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Contains FIFA Keyword</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Contains FIFA Keyword"] === 1 ? "True" : "False"}</td>
                            <td className="px-4 py-2 text-gray-400">Keyword Check</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Contains Ticket Keyword</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Contains Ticket Keyword"] === 1 ? "True" : "False"}</td>
                            <td className="px-4 py-2 text-gray-400">Keyword Check</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Contains Official Keyword</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Contains Official Keyword"] === 1 ? "True" : "False"}</td>
                            <td className="px-4 py-2 text-gray-400">Keyword Check</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Contains Stream Keyword</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Contains Stream Keyword"] === 1 ? "True" : "False"}</td>
                            <td className="px-4 py-2 text-gray-400">Keyword Check</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Contains Reward Keyword</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Contains Reward Keyword"] === 1 ? "True" : "False"}</td>
                            <td className="px-4 py-2 text-gray-400">Keyword Check</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Typosquat Distance to FIFA</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Typosquat Distance to FIFA"]}</td>
                            <td className="px-4 py-2 text-gray-400">Similarity Distance</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Registrar</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Registrar"]}</td>
                            <td className="px-4 py-2 text-gray-400">WHOIS Records</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">WHOIS Age Days</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["WHOIS Age Days"]} days</td>
                            <td className="px-4 py-2 text-gray-400">WHOIS Records</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Is Privacy Protected</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Is Privacy Protected"] === 1 ? "True" : "False"}</td>
                            <td className="px-4 py-2 text-gray-400">WHOIS Records</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">SSL Status</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white font-bold">{scanResult["SSL Status"]}</td>
                            <td className="px-4 py-2 text-gray-400">SSL Certificate</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">SSL Issuer</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["SSL Issuer"]}</td>
                            <td className="px-4 py-2 text-gray-400">SSL Certificate</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">SSL Valid Days Remaining</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["SSL Valid Days Remaining"]} days</td>
                            <td className="px-4 py-2 text-gray-400">SSL Certificate</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">IP Address</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["IP Address"]}</td>
                            <td className="px-4 py-2 text-gray-400">Network Records</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Hosting Country</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Hosting Country"]}</td>
                            <td className="px-4 py-2 text-gray-400">Network Records</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">ASN Provider</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["ASN Provider"]}</td>
                            <td className="px-4 py-2 text-gray-400">Network Records</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Visual Similarity Score</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Visual Similarity Score"]}%</td>
                            <td className="px-4 py-2 text-gray-400">Heuristics</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Phishing Probability</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white font-bold">{scanResult["Phishing Probability"]}%</td>
                            <td className="px-4 py-2 text-gray-400">ML Classifier Output</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Malware Signature Match</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Malware Signature Match"] === 1 ? "Matched" : "No Match"}</td>
                            <td className="px-4 py-2 text-gray-400">Threat Intelligence API</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Blacklist Source</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white font-bold">{scanResult["Blacklist Source"]}</td>
                            <td className="px-4 py-2 text-gray-400">Threat Intelligence API</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Social Media Mentions</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Social Media Mentions"]}</td>
                            <td className="px-4 py-2 text-gray-400">Heuristics</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">OSINT Report Count</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["OSINT Report Count"]}</td>
                            <td className="px-4 py-2 text-gray-400">Heuristics</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Redirect Chain Length</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Redirect Chain Length"]}</td>
                            <td className="px-4 py-2 text-gray-400">Network Connection</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Has Payment Page</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Has Payment Page"] === 1 ? "True" : "False"}</td>
                            <td className="px-4 py-2 text-gray-400">HTML Scraper</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400">Has Login Form</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{scanResult["Has Login Form"] === 1 ? "True" : "False"}</td>
                            <td className="px-4 py-2 text-gray-400">HTML Scraper</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 gap-2">
              <Button 
                variant="outline" 
                onClick={handleCloseScan}
                disabled={isScanning}
                className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}