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
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ThreatTable } from "@/components/dashboard/ThreatTable";
import { SeverityChart } from "@/components/dashboard/SeverityChart";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { fetchDashboardData } from "@/services/api/dashboard";
import { Threat } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
          <p className="text-gray-600 dark:text-gray-400 mt-2">Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh Page
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Shield className="w-8 h-8 mr-3 text-blue-600" />
              FIFA Cyber Threat Intelligence Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Real-time monitoring of FIFA-related scams, fraud, and piracy threats
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button className="flex items-center gap-2">
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
            trend={{ value: 12, isPositive: false }}
            description="Last 24 hours"
          />
          <StatCard
            title="High Risk Domains"
            value={stats.highRiskDomains.toLocaleString()}
            icon={Shield}
            trend={{ value: 5, isPositive: false }}
            description="Critical & High severity"
          />
          <StatCard
            title="Active Scam Campaigns"
            value={stats.activeCampaigns}
            icon={Activity}
            trend={{ value: 3, isPositive: true }}
            description="Currently active"
          />
        </div>

        {/* Charts and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Threat Severity Distribution</CardTitle>
              <CardDescription>Distribution of threats by severity level</CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest threat intelligence events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[320px] overflow-y-auto">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {activity.domain}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-l-4 border-red-500">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="critical">CRITICAL</Badge>
                    <span className="text-xs text-red-600 dark:text-red-300">New Alert</span>
                  </div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mt-2">
                    New Critical Threat Detected!
                  </h3>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                    <strong>Domain:</strong> fifa-ticket-2026.com
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300">
                    <strong>Category:</strong> Fake Ticket Portal
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300">
                    <strong>Risk Score:</strong> 95/100
                  </p>
                  <p className="text-xs text-red-500 mt-2">
                    <strong>Recommended Action:</strong> Block Domain, Notify Analysts, Generate IOC Report
                  </p>
                </div>
                <Button size="sm" variant="destructive" className="flex-shrink-0">
                  Take Action
                </Button>
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-l-4 border-orange-500">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="high">HIGH</Badge>
                    <span className="text-xs text-orange-600 dark:text-orange-300">Updated</span>
                  </div>
                  <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mt-2">
                    High Severity Alert - Domain Under Attack
                  </h3>
                  <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                    <strong>Domain:</strong> worldcup-free.stream
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-300">
                    <strong>Category:</strong> Illegal Streaming
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-300">
                    <strong>Risk Score:</strong> 82/100
                  </p>
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0">
                  Investigate
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Threats Table */}
        <ThreatTable 
          threats={threats}
          onRowClick={(threat) => setSelectedThreat(threat)}
        />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-6">
          <p>
            FIFA Cyber Threat Intelligence Platform v1.0 | 
            Data updated in near real-time | 
            Last scan: {new Date().toLocaleString()}
          </p>
          <p className="mt-1 text-xs">
            © 2026 FIFA Cyber Threat Intelligence | All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}