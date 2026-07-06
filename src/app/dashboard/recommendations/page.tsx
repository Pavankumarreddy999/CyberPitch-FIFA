"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Badge } from "@/components/ui/Badge";
import {
  BookOpen, ShieldCheck, ShieldAlert, ArrowRight, RefreshCw,
  Info, AlertTriangle, FileSpreadsheet, Send, HelpCircle
} from "lucide-react";
import { getRiskScoreColor, formatDate } from "@/lib/utils";

async function fetchRecommendations() {
  const r = await fetch("/api/recommendations");
  if (!r.ok) throw new Error("Failed to fetch recommendations");
  return r.json();
}

const ACTION_DESCRIPTIONS: Record<string, string> = {
  "Block Domain, Notify Analysts, Generate IOC Report": "Highly malicious. Block via DNS gateway, notify SOC teams, and assemble indicators of compromise (IOCs) for registry registry reports.",
  "Send Takedown Request": "Clear brand impersonation or fraudulent ticketing. Dispatch automated takedown letters to registries (ICANN, Domain Registrar) and hosting providers.",
  "Investigate": "Moderate heuristic score or typosquat matches. Dispatch manual review to verify login parameters or payment redirection targets.",
  "Monitor Traffic": "Low-to-medium probability indicators. Flag in passive dns query logging and evaluate visual components periodically.",
};

const ACTION_BADGES: Record<string, string> = {
  "Block Domain, Notify Analysts, Generate IOC Report": "critical",
  "Send Takedown Request": "high",
  "Investigate": "medium",
  "Monitor Traffic": "low",
};

export default function RecommendationsPage() {
  const router = useRouter();
  const { data: groups = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["recommendations"],
    queryFn:  fetchRecommendations,
    refetchInterval: 25000,
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                Response Recommendations
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Automated response strategies compiled from machine learning classifier predictions
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ShieldCheck className="w-12 h-12 mb-3 opacity-30 text-green-500" />
              <p className="text-lg font-medium">No actionable alerts</p>
              <p className="text-sm mt-1">No domains currently require defensive actions.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((g: any, index: number) => {
                const badge = ACTION_BADGES[g.action] || "medium";
                const desc = ACTION_DESCRIPTIONS[g.action] || "Investigate suspicious indicators on the platform.";
                
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
                  >
                    {/* Action Title */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <Badge variant={badge as any}>{badge.toUpperCase()}</Badge>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                            {g.action}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {desc}
                        </p>
                      </div>
                      <span className="text-2xl font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 w-12 h-12 rounded-xl flex items-center justify-center">
                        {g.count}
                      </span>
                    </div>

                    {/* Domains list for action */}
                    <div className="mt-6">
                      <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Impacted Domains</p>
                      <div className="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-xl">
                        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                          <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Domain</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Threat Vector</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Risk</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">First Seen</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                            {g.domains.map((d: any, idx: number) => (
                              <tr
                                key={idx}
                                onClick={() => router.push(`/dashboard/domains/${d.id || idx}`)}
                                className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 cursor-pointer transition-colors"
                              >
                                <td className="px-4 py-2.5 font-mono font-semibold text-gray-900 dark:text-white">
                                  {d.domain}
                                </td>
                                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">
                                  {d.threatType}
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className={`font-bold ${getRiskScoreColor(d.riskScore)}`}>{d.riskScore}</span>
                                  <span className="text-gray-400 text-[10px]">/100</span>
                                </td>
                                <td className="px-4 py-2.5 text-gray-400">
                                  {formatDate(d.detectedAt).split(",")[0]}
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 inline-block" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
