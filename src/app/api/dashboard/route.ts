import { NextResponse } from "next/server";

// Helper to create date with proper format
const createDate = (dateString: string) => {
  return new Date(dateString).toISOString();
};

// Mock data with proper date formatting
const mockDashboardData = {
  stats: {
    totalDomains: 15847,
    threatsDetected: 2341,
    highRiskDomains: 487,
    activeCampaigns: 23,
    domainsScannedToday: 127,
    averageRiskScore: 68,
  },
  threats: [
    {
      id: "1",
      domain: "fifa-tickets-24.net",
      threatType: "Fake Ticketing",
      riskScore: 93,
      severity: "critical" as const,
      status: "pending block" as const,
      createdAt: createDate("2026-07-04T10:30:00"),
      updatedAt: createDate("2026-07-04T10:30:00"),
      details: {
        whoisAge: "3 days",
        sslStatus: "Invalid",
        visualSimilarity: 98,
        phishingProbability: 96,
        recommendedAction: "Block Domain",
      },
    },
    {
      id: "2",
      domain: "worldcup.streamhd.xyz",
      threatType: "Illegal Streaming",
      riskScore: 85,
      severity: "critical" as const,
      status: "blocked" as const,
      createdAt: createDate("2026-07-04T09:15:00"),
      updatedAt: createDate("2026-07-04T11:00:00"),
      details: {
        whoisAge: "1 month",
        sslStatus: "Valid",
        visualSimilarity: 92,
        phishingProbability: 45,
        recommendedAction: "Monitor Traffic",
      },
    },
    {
      id: "3",
      domain: "fifa-rewards.info",
      threatType: "Phishing",
      riskScore: 78,
      severity: "high" as const,
      status: "notified" as const,
      createdAt: createDate("2026-07-04T08:00:00"),
      updatedAt: createDate("2026-07-04T08:30:00"),
      details: {
        whoisAge: "2 weeks",
        sslStatus: "Valid",
        visualSimilarity: 85,
        phishingProbability: 92,
        recommendedAction: "Send Takedown Request",
      },
    },
    {
      id: "4",
      domain: "official-fifa-site.com",
      threatType: "Impersonation",
      riskScore: 65,
      severity: "medium" as const,
      status: "under review" as const,
      createdAt: createDate("2026-07-03T14:45:00"),
      updatedAt: createDate("2026-07-04T07:00:00"),
      details: {
        whoisAge: "2 months",
        sslStatus: "Valid",
        visualSimilarity: 95,
        phishingProbability: 70,
        recommendedAction: "Investigate",
      },
    },
    {
      id: "5",
      domain: "fifa26-news.org",
      threatType: "Malware",
      riskScore: 88,
      severity: "critical" as const,
      status: "pending block" as const,
      createdAt: createDate("2026-07-04T06:20:00"),
      updatedAt: createDate("2026-07-04T06:20:00"),
      details: {
        whoisAge: "5 days",
        sslStatus: "Invalid",
        visualSimilarity: 78,
        phishingProbability: 60,
        recommendedAction: "Block Domain & Extract IOCs",
      },
    },
    {
      id: "6",
      domain: "fifa-ticket-2026.com",
      threatType: "Fake Ticketing",
      riskScore: 95,
      severity: "critical" as const,
      status: "pending block" as const,
      createdAt: createDate("2026-07-04T12:00:00"),
      updatedAt: createDate("2026-07-04T12:00:00"),
      details: {
        whoisAge: "1 day",
        sslStatus: "Invalid",
        visualSimilarity: 99,
        phishingProbability: 98,
        recommendedAction: "Block Domain, Notify Analysts, Generate IOC Report",
      },
    },
  ],
  severityDistribution: {
    critical: 45,
    high: 78,
    medium: 23,
    low: 12,
  },
  recentActivity: [
    { timestamp: createDate("2026-07-04T12:05:00"), action: "New Threat Detected", domain: "fifa-ticket-2026.com" },
    { timestamp: createDate("2026-07-04T11:30:00"), action: "Domain Blocked", domain: "worldcup.streamhd.xyz" },
    { timestamp: createDate("2026-07-04T10:45:00"), action: "Alert Notified", domain: "fifa-rewards.info" },
    { timestamp: createDate("2026-07-04T09:20:00"), action: "New Scan Started", domain: "multiple domains" },
  ],
};

export async function GET() {
  return NextResponse.json(mockDashboardData);
}