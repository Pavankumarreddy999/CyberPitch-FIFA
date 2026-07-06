"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Badge } from "@/components/ui/Badge";
import { Bell, ShieldAlert, Zap, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import { getRiskScoreColor, formatDate } from "@/lib/utils";

async function fetchAlerts() {
  const r = await fetch("/api/alerts");
  if (!r.ok) throw new Error("Failed to fetch alerts");
  return r.json();
}

const ACTION_COLORS: Record<string, string> = {
  "Block Domain, Notify Analysts, Generate IOC Report": "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  "Send Takedown Request":  "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  "Investigate":            "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
};

export default function ThreatAlertsPage() {
  const router = useRouter();
  const { data: alerts = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["alerts"],
    queryFn:  fetchAlerts,
    refetchInterval: 20000,
  });

  const critical = alerts.filter((a: any) => a.severity === "Critical");
  const high     = alerts.filter((a: any) => a.severity === "High");

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Bell className="w-8 h-8 text-orange-500" />
                Threat Alerts
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Critical and high-severity threats requiring immediate action
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

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-red-600 rounded-2xl p-5 text-white shadow-lg shadow-red-500/20">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-6 h-6" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-80">Critical</span>
              </div>
              <p className="text-4xl font-black">{critical.length}</p>
              <p className="text-sm opacity-70 mt-1">Immediate action required</p>
            </div>
            <div className="bg-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20">
              <div className="flex items-center gap-3 mb-2">
                <ShieldAlert className="w-6 h-6" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-80">High</span>
              </div>
              <p className="text-4xl font-black">{high.length}</p>
              <p className="text-sm opacity-70 mt-1">Takedown requests pending</p>
            </div>
            <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-80">Total Active</span>
              </div>
              <p className="text-4xl font-black">{alerts.length}</p>
              <p className="text-sm opacity-70 mt-1">Threats flagged in pipeline</p>
            </div>
          </div>

          {/* Alerts list */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Bell className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">No active alerts</p>
              <p className="text-sm mt-1">High-risk domains will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert: any) => {
                const sev = (alert.severity || "high").toLowerCase();
                const sevVariant = sev === "critical" ? "critical" : sev === "high" ? "high" : "medium";
                const actionColor = ACTION_COLORS[alert.recommendedAction] || ACTION_COLORS["Investigate"];

                return (
                  <div
                    key={alert.id}
                    onClick={() => router.push(`/dashboard/domains/${alert.id}`)}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          sev === "critical" ? "bg-red-100 dark:bg-red-950/30" : "bg-orange-100 dark:bg-orange-950/30"
                        }`}>
                          <AlertCircle className={`w-5 h-5 ${sev === "critical" ? "text-red-600" : "text-orange-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant={sevVariant as any}>{alert.severity?.toUpperCase()}</Badge>
                            <span className="font-mono font-semibold text-gray-900 dark:text-white text-sm">{alert.domain}</span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-500">{alert.threatType}</span>
                          </div>

                          {/* Explanations preview */}
                          {alert.explanations?.slice(0, 2).map((exp: string, i: number) => (
                            <p key={i} className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">• {exp}</p>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <span className={`font-black text-2xl ${getRiskScoreColor(alert.riskScore)}`}>{alert.riskScore}</span>
                          <span className="text-xs text-gray-400">/100</span>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${actionColor}`}>
                          {alert.recommendedAction?.split(",")[0]}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(alert.detectedAt)}</span>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 self-center" />
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
