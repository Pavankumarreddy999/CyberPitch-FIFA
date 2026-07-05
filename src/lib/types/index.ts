export interface Threat {
  id: string;
  domain: string;
  threatType: "Fake Ticketing" | "Phishing" | "Malware" | "Impersonation" | "Illegal Streaming" | "Other";
  riskScore: number;
  severity: "critical" | "high" | "medium" | "low";
  status: "pending block" | "blocked" | "notified" | "under review";
  createdAt: Date;
  updatedAt: Date;
  details?: {
    whoisAge?: string;
    sslStatus?: string;
    visualSimilarity?: number;
    phishingProbability?: number;
    recommendedAction?: string;
  };
}

export interface DashboardStats {
  totalDomains: number;
  threatsDetected: number;
  highRiskDomains: number;
  activeCampaigns: number;
  domainsScannedToday: number;
  averageRiskScore: number;
}

export interface DashboardData {
  stats: DashboardStats;
  threats: Threat[];
  severityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recentActivity: {
    timestamp: Date;
    action: string;
    domain: string;
  }[];
}

export interface DomainAnalysisRequest {
  domain: string;
}

export interface DomainAnalysisResponse {
  domain: string;
  riskScore: number;
  threatType: string;
  isMalicious: boolean;
  details: {
    whoisAge: string;
    sslValid: boolean;
    visualSimilarity: number;
    phishingProbability: number;
    recommendedAction: string;
  };
}