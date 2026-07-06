"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Badge } from "@/components/ui/Badge";
import { Flag, Filter, Search, ChevronRight, AlertTriangle, ShieldAlert, RefreshCw } from "lucide-react";
import { getRiskScoreColor, formatDate } from "@/lib/utils";

const THREAT_TYPES = ["All", "Phishing", "Fake Ticketing", "Malware", "Brand Impersonation", "Illegal Streaming"];
const SEVERITIES   = ["All", "critical", "high", "medium"];

async function fetchFlagged(severity: string, threatType: string) {
  const qs = new URLSearchParams();
  if (severity !== "All")   qs.set("severity",    severity.toLowerCase());
  if (threatType !== "All") qs.set("threat_type", threatType);
  const r = await fetch(`/api/flagged?${qs}`);
  if (!r.ok) throw new Error("Failed to fetch");
  return r.json();
}

export default function FlaggedDomainsPage() {
  const router = useRouter();
  const [severity,   setSeverity]   = useState("All");
  const [threatType, setThreatType] = useState("All");
  const [search,     setSearch]     = useState("");

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ["flagged", severity, threatType],
    queryFn:  () => fetchFlagged(severity, threatType),
    refetchInterval: 30000,
  });

  const filtered = data.filter((d: any) =>
    !search || d.domain.toLowerCase().includes(search.toLowerCase())
  );

  const sevVariant = (s: string) => (
    s === "critical" ? "critical" : s === "high" ? "high" : s === "medium" ? "medium" : "low"
  ) as any;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Flag className="w-8 h-8 text-red-500" />
                Flagged Domains
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Complete list of suspicious domains detected by the threat intelligence pipeline
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <Filter className="w-4 h-4" />
              Filters:
            </div>
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search domain..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-gray-900 dark:text-white outline-none w-full"
              />
            </div>
            {/* Severity */}
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
            >
              {SEVERITIES.map(s => <option key={s}>{s}</option>)}
            </select>
            {/* Threat type */}
            <select
              value={threatType}
              onChange={e => setThreatType(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
            >
              {THREAT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <span className="text-xs text-gray-400 ml-auto">{filtered.length} domains</span>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ShieldAlert className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-lg font-medium">No flagged domains found</p>
              <p className="text-sm mt-1">Scan domains to see results here</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      {["Domain", "Threat Type", "Risk Score", "Severity", "Status", "SSL", "Detected", ""].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filtered.map((d: any) => (
                      <tr
                        key={d.id}
                        onClick={() => router.push(`/dashboard/domains/${d.id}`)}
                        className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3.5 text-sm font-mono font-semibold text-gray-900 dark:text-white">
                          {d.domain}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">
                          {d.threatType}
                        </td>
                        <td className="px-5 py-3.5 text-sm">
                          <span className={`font-bold ${getRiskScoreColor(d.riskScore)}`}>{d.riskScore}</span>
                          <span className="text-gray-400 text-xs">/100</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={sevVariant(d.severity)}>{d.severity.toUpperCase()}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {d.status}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                          {d.sslStatus}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400">
                          {formatDate(d.detectedAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
