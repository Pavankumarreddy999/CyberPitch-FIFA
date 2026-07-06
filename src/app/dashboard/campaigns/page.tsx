"use client";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Badge } from "@/components/ui/Badge";
import {
  Activity, ShieldAlert, Calendar, Server, Users, ArrowUpRight,
  TrendingUp, RefreshCw, Layers
} from "lucide-react";
import { getRiskScoreColor, formatDate } from "@/lib/utils";

async function fetchCampaigns() {
  const r = await fetch("/api/campaigns");
  if (!r.ok) throw new Error("Failed to fetch campaigns");
  return r.json();
}

export default function CampaignsPage() {
  const { data: campaigns = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["campaigns"],
    queryFn:  fetchCampaigns,
    refetchInterval: 25000,
  });

  const totalCampaigns = campaigns.length;
  const totalDomains = campaigns.reduce((acc: number, c: any) => acc + c.count, 0);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
                Active Phishing Campaigns
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Aggregated phishing campaigns targeting FIFA 2026 ticketing and official brands
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

          {/* Aggregated Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <div className="flex items-center gap-2.5 text-gray-400 mb-2">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Active Campaigns</span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{totalCampaigns}</p>
              <span className="text-xs text-green-500 font-semibold flex items-center gap-0.5 mt-1">
                <TrendingUp className="w-3 h-3" /> Grouped by threat vector
              </span>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <div className="flex items-center gap-2.5 text-gray-400 mb-2">
                <Server className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Flagged Infrastructure</span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{totalDomains}</p>
              <span className="text-xs text-gray-400 mt-1 block">Total malicious domains grouped</span>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <div className="flex items-center gap-2.5 text-gray-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Lures Identified</span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">5 Categories</p>
              <span className="text-xs text-orange-500 font-semibold mt-1 block">Targeting Tickets & Streaming</span>
            </div>
          </div>

          {/* Campaigns lists */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Activity className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">No active campaign trends detected</p>
              <p className="text-sm mt-1">Add threats to group them into active campaign vectors</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map((camp: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{camp.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Detected campaign involving multiple registered endpoints
                        </p>
                      </div>
                      <Badge variant="destructive">{camp.count} Domains</Badge>
                    </div>

                    {/* Breakdown badges */}
                    <div className="flex gap-2 flex-wrap mb-5">
                      <span className="text-[10px] uppercase font-bold bg-red-50 dark:bg-red-950/20 text-red-700 border border-red-100 dark:border-red-900 px-2 py-0.5 rounded">
                        {camp.criticalCount} Critical
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-orange-50 dark:bg-orange-950/20 text-orange-700 border border-orange-100 dark:border-orange-900 px-2 py-0.5 rounded">
                        {camp.highCount} High
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 border border-yellow-100 dark:border-yellow-900 px-2 py-0.5 rounded">
                        {camp.mediumCount} Medium
                      </span>
                    </div>

                    {/* Domains sublist */}
                    <div className="space-y-2 mb-6">
                      <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Targets List</p>
                      <div className="max-h-36 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-1">
                        {camp.timeline.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center py-2 text-xs">
                            <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{item.domain}</span>
                            <div className="flex items-center gap-2">
                              <span className={getRiskScoreColor(item.riskScore)}>{item.riskScore} Risk</span>
                              <span className="text-gray-400 text-[10px]">{formatDate(item.date).split(",")[0]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> First seen: {formatDate(camp.timeline[0]?.date).split(",")[0]}
                    </span>
                    <span className="flex items-center gap-0.5 text-blue-600 font-semibold cursor-pointer hover:underline">
                      View details <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
