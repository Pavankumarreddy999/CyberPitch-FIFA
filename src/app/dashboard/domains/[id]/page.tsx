"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft, Shield, Globe, Lock, Clock, AlertTriangle,
  Activity, FileText, CheckCircle, XCircle, Eye
} from "lucide-react";
import { getRiskScoreColor, formatDate } from "@/lib/utils";

async function fetchDetail(id: string) {
  const r = await fetch(`/api/domains/${id}`);
  if (!r.ok) throw new Error("Not found");
  return r.json();
}

function MetaRow({ label, value, highlight }: { label: string; value: any; highlight?: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-sm font-semibold ${highlight || "text-gray-900 dark:text-white"}`}>{value}</span>
    </div>
  );
}

export default function DomainDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["domain-detail", id],
    queryFn:  () => fetchDetail(id),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !res?.data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
          <AlertTriangle className="w-12 h-12 mb-3 text-red-400" />
          <p className="text-lg font-medium text-gray-800 dark:text-white">Domain not found</p>
          <button onClick={() => router.back()} className="mt-4 text-blue-500 hover:underline text-sm">← Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  const d = res.data;
  const sev = (d["Severity"] || "low").toLowerCase() as any;
  const riskScore = d["Risk Score"] ?? 0;
  const sevVariant = sev === "critical" ? "critical" : sev === "high" ? "high" : sev === "medium" ? "medium" : "low";

  // Risk gauge: radial approximation via conic-gradient
  const gaugeColor = riskScore >= 80 ? "#ef4444" : riskScore >= 60 ? "#f97316" : riskScore >= 40 ? "#eab308" : "#22c55e";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-6xl mx-auto">

          {/* Back + Header */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Flagged Domains
          </button>

          <div className="flex flex-wrap items-start gap-4 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={sevVariant}>{d["Severity"]?.toUpperCase()}</Badge>
                <h1 className="text-2xl font-bold font-mono text-gray-900 dark:text-white">{d["Domain Name"]}</h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                Threat Type: <strong className="text-gray-800 dark:text-gray-200">{d["Threat Type"]}</strong>
                &nbsp;·&nbsp; Scanned: {formatDate(d["Detection Timestamp"] || d.created_at_db)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Risk Score Gauge */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center">
              <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-5">Risk Assessment</p>
              <div
                className="w-36 h-36 rounded-full flex items-center justify-center border-8"
                style={{ borderColor: gaugeColor, boxShadow: `0 0 24px ${gaugeColor}44` }}
              >
                <div className="text-center">
                  <span className={`text-4xl font-black ${getRiskScoreColor(riskScore)}`}>{riskScore}</span>
                  <span className="block text-xs text-gray-400">/100</span>
                </div>
              </div>
              <div className="mt-5 text-center space-y-2 w-full">
                <p className="text-xs text-gray-400 uppercase font-bold">Recommended Action</p>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">{d["Recommended Action"]}</p>
                <p className="text-xs text-gray-400 uppercase font-bold mt-3">Status</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{d["Status"]}</p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* WHOIS */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Domain Intelligence</h3>
                </div>
                <MetaRow label="WHOIS Age"         value={`${d["WHOIS Age Days"]} days`} highlight={d["WHOIS Age Days"] < 90 ? "text-red-500" : undefined} />
                <MetaRow label="Registrar"         value={d["Registrar"] || "Unknown"} />
                <MetaRow label="Hosting Country"   value={d["Hosting Country"] || "Unknown"} />
                <MetaRow label="IP Address"        value={d["IP Address"] || "N/A"} />
                <MetaRow label="Privacy Protected" value={d["Is Privacy Protected"] ? "Yes" : "No"} highlight={d["Is Privacy Protected"] ? "text-orange-500" : undefined} />
              </div>

              {/* SSL */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">SSL Certificate</h3>
                </div>
                <MetaRow label="SSL Status"        value={d["SSL Status"]} highlight={d["SSL Status"] !== "Valid" ? "text-red-500" : "text-green-600"} />
                <MetaRow label="SSL Issuer"        value={d["SSL Issuer"] || "None"} />
                <MetaRow label="Days Remaining"    value={`${d["SSL Valid Days Remaining"]} days`} highlight={d["SSL Valid Days Remaining"] < 30 ? "text-orange-500" : undefined} />
              </div>

              {/* ML / Heuristics */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">ML & Heuristics</h3>
                </div>

                <MetaRow label="Typosquat Distance"   value={d["Typosquat Distance to FIFA"]} highlight={d["Typosquat Distance to FIFA"] <= 1 ? "text-red-500" : undefined} />
                <MetaRow label="OSINT Reports"        value={d["OSINT Report Count"]} highlight={d["OSINT Report Count"] > 0 ? "text-orange-500" : undefined} />
                <MetaRow label="Malware Match"        value={d["Malware Signature Match"] ? "Yes ⚠️" : "No"} highlight={d["Malware Signature Match"] ? "text-red-600" : undefined} />
              </div>

              {/* OSINT / Social */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">OSINT & Network</h3>
                </div>
                <MetaRow label="Blacklist Source"    value={d["Blacklist Source"] || "None"} highlight={d["Blacklist Source"] && d["Blacklist Source"] !== "None" ? "text-red-600" : undefined} />
                <MetaRow label="Social Mentions"     value={d["Social Media Mentions"]} />
                <MetaRow label="Redirect Chains"     value={d["Redirect Chain Length"]} highlight={d["Redirect Chain Length"] >= 2 ? "text-orange-500" : undefined} />
                <MetaRow label="Has Login Form"      value={d["Has Login Form"] ? "Yes" : "No"} highlight={d["Has Login Form"] ? "text-orange-500" : undefined} />
                <MetaRow label="Has Payment Page"    value={d["Has Payment Page"] ? "Yes" : "No"} highlight={d["Has Payment Page"] ? "text-orange-500" : undefined} />
              </div>
            </div>
          </div>

          {/* SHAP Explanations */}
          {d["Explanations"] && d["Explanations"].length > 0 && (
            <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">ML Classifier Explanations (SHAP Indicators)</h3>
              </div>
              <ul className="space-y-2">
                {d["Explanations"].map((exp: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    {exp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Keyword flags */}
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Keyword Detection</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "FIFA Keyword",     flag: d["Contains FIFA Keyword"] },
                { label: "Ticket Keyword",   flag: d["Contains Ticket Keyword"] },
                { label: "Official Keyword", flag: d["Contains Official Keyword"] },
                { label: "Stream Keyword",   flag: d["Contains Stream Keyword"] },
                { label: "Reward Keyword",   flag: d["Contains Reward Keyword"] },
              ].map(({ label, flag }) => (
                <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                  flag
                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                    : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                }`}>
                  {flag ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {label}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
