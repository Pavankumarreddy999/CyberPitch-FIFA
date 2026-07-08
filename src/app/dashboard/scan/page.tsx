"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { analyzeDomain } from "@/services/api/dashboard";
import { Badge } from "@/components/ui/Badge";
import {
  Search, Shield, AlertTriangle, CheckCircle, XCircle, Play,
  RefreshCw, Globe, Server, Code, FileText, Lock, Activity, Eye
} from "lucide-react";
import { getRiskScoreColor } from "@/lib/utils";

interface PipelineStep {
  name: string;
  desc: string;
  status: "idle" | "running" | "success" | "error";
  icon: any;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { name: "Lexical & URL Parser", desc: "Analyzing TLD, typosquatting distances, and character patterns", status: "idle", icon: Search },
  { name: "WHOIS Registry Lookup", desc: "Checking domain age, registrar history, and privacy flags", status: "idle", icon: Globe },
  { name: "DNS Resolution Module", desc: "Resolving A, AAAA, MX, and TXT records", status: "idle", icon: Server },
  { name: "SSL Certificate Validation", desc: "Verifying certificate authority, validity, and expiry", status: "idle", icon: Lock },
  { name: "HTML Scraping Engine", desc: "Scanning page DOM for login forms, payment links, and brands", status: "idle", icon: Code },
  { name: "OSINT Campaign Intelligence", desc: "Querying threat feeds and social scam indicators", status: "idle", icon: Eye },
  { name: "Visual Similarity Matcher", desc: "Comparing layout with official portals", status: "idle", icon: FileText },
  { name: "ML Decision Engine", desc: "Fusing all inputs through Random Forest + HGB Pipeline", status: "idle", icon: Activity },
];

export default function ScanPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [steps, setSteps] = useState<PipelineStep[]>(PIPELINE_STEPS);
  const [currentStepIdx, setCurrentStepIdx] = useState<number | null>(null);

  // Animate the pipeline steps when scanning
  useEffect(() => {
    if (!loading || currentStepIdx === null) return;
    if (currentStepIdx >= steps.length) return;

    const timer = setTimeout(() => {
      setSteps(prev => prev.map((step, idx) => {
        if (idx === currentStepIdx) return { ...step, status: "success" };
        if (idx === currentStepIdx + 1) return { ...step, status: "running" };
        return step;
      }));
      setCurrentStepIdx(idx => (idx !== null ? idx + 1 : null));
    }, 1100);

    return () => clearTimeout(timer);
  }, [loading, currentStepIdx, steps.length]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStepIdx(0);

    // Initialize steps states
    setSteps(PIPELINE_STEPS.map((s, idx) => ({
      ...s,
      status: idx === 0 ? "running" : "idle"
    })));

    try {
      const response = await analyzeDomain(domain.trim());
      // Wait for animation to finish
      await new Promise(resolve => setTimeout(resolve, PIPELINE_STEPS.length * 1150));

      if (response && response.success && response.data) {
        setResult(response.data);
      } else {
        throw new Error("Scan completed, but returned invalid response format.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during domain threat scanning.");
      // Mark active steps as failed
      setSteps(prev => prev.map(s => s.status === "running" ? { ...s, status: "error" } : s));
    } finally {
      setLoading(false);
      setCurrentStepIdx(null);
    }
  };

  const riskScore = result?.["Risk Score"] ?? 0;
  const sev = (result?.["Severity"] || "low").toLowerCase();
  const sevVariant = sev === "critical" ? "critical" : sev === "high" ? "high" : sev === "medium" ? "medium" : "low";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              Real-time Threat Scanner
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Submit any domain or URL to dispatch the complete 8-stage cyber threat intelligence pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Input & Progress Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Form */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <form onSubmit={handleScan} className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Target Domain / URL
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-950 focus-within:border-blue-500 transition-colors">
                      <Search className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g. fifa-rewards-claims.com"
                        value={domain}
                        onChange={e => setDomain(e.target.value)}
                        disabled={loading}
                        className="bg-transparent text-gray-900 dark:text-white outline-none w-full text-base font-medium placeholder-gray-400 disabled:opacity-55"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !domain.trim()}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors disabled:cursor-not-allowed shadow-md shadow-blue-500/10"
                    >
                      {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                      {loading ? "Scanning..." : "Scan Domain"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Pipeline Status */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
                  Pipeline Execution Pipeline
                </h3>

                <div className="relative border-l border-gray-200 dark:border-gray-800 ml-4 pl-8 space-y-6">
                  {steps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div key={idx} className="relative group">
                        {/* Bullet Icon */}
                        <div className={`absolute -left-12 top-0.5 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                          step.status === "success" ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20" :
                          step.status === "running" ? "bg-blue-600 border-blue-600 text-white animate-pulse shadow-lg shadow-blue-500/20" :
                          step.status === "error" ? "bg-red-500 border-red-500 text-white" :
                          "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400"
                        }`}>
                          {step.status === "success" ? <CheckCircle className="w-4 h-4" /> :
                           step.status === "error" ? <XCircle className="w-4 h-4" /> :
                           <Icon className="w-4 h-4" />}
                        </div>

                        {/* Text */}
                        <div>
                          <h4 className={`font-semibold text-sm transition-colors ${
                            step.status === "running" ? "text-blue-600 dark:text-blue-400" :
                            step.status === "success" ? "text-gray-950 dark:text-gray-100" :
                            "text-gray-400"
                          }`}>
                            Stage {idx + 1}: {step.name}
                          </h4>
                          <p className={`text-xs mt-0.5 transition-colors ${
                            step.status === "running" ? "text-blue-500" :
                            step.status === "success" ? "text-gray-500 dark:text-gray-400" :
                            "text-gray-400/80"
                          }`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Results Sidebar Column */}
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 text-red-700 dark:text-red-400">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-semibold text-sm">Scan Engine Error</h3>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">{error}</p>
                </div>
              )}

              {result && !loading ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6 animate-fade-in">
                  
                  {/* Title */}
                  <div className="text-center">
                    <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Analysis Result</p>
                    <h2 className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-1 break-all">
                      {result["Domain Name"]}
                    </h2>
                    <div className="flex justify-center gap-2 mt-2">
                      <Badge variant={sevVariant as any}>{result["Severity"]?.toUpperCase()}</Badge>
                      <span className="text-xs text-gray-500 flex items-center">
                        {result["Threat Type"]}
                      </span>
                    </div>
                  </div>

                  {/* Risk Gauge */}
                  <div className="flex flex-col items-center py-4 border-t border-b border-gray-100 dark:border-gray-800">
                    <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-dashed border-gray-100 dark:border-gray-800">
                      <div className="text-center">
                        <span className={`text-3xl font-black ${getRiskScoreColor(riskScore)}`}>{riskScore}</span>
                        <span className="block text-xs text-gray-400">Risk Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Explanations */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Recommended Action</h4>
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400 leading-relaxed">
                        {result["Recommended Action"]}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1.5">Key Indicators</h4>
                      <div className="space-y-2">
                        {result["Explanations"]?.map((exp: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>{exp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Threat Calculations */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Engine Calculations & Features</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                      {[
                        { label: "WHOIS Age", val: result["WHOIS Age Days"] !== undefined ? `${result["WHOIS Age Days"]} Days` : "Unknown" },
                        { label: "SSL Status", val: result["SSL Status"] || "Unknown" },
                        { label: "Hosting", val: result["Hosting Country"] || "Unknown" },
                        { label: "Domain Len", val: result["Domain Length"] ?? 0 },
                        { label: "Subdomains", val: result["Subdomain Count"] ?? 0 },
                        { label: "Typosquat Dist", val: result["Typosquat Distance to FIFA"] ?? "N/A" },
                        { label: "Malware Match", val: result["Malware Signature Match"] ? "Yes" : "No" }
                      ].map((stat, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-200/60 dark:border-gray-800 flex flex-col justify-center">
                          <span className="block text-[9px] uppercase font-bold text-gray-400">{stat.label}</span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5 block">{stat.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : !loading ? (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 p-8 text-center text-gray-400">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Ready for scan</p>
                  <p className="text-xs mt-1">Enter a domain name to trigger the pipeline detection stages.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">Executing Pipeline Stages...</p>
                  <p className="text-xs text-gray-500 mt-1">Collecting WHOIS age, checking similarity scores, and running model inference.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
