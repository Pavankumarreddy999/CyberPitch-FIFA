import { NextResponse } from "next/server";

export async function GET() {
  try {
    const statsRes = await fetch("http://127.0.0.1:8000/api/scan/stats", {
      cache: "no-store"
    });
    
    if (!statsRes.ok) {
      throw new Error(`Failed to fetch stats from backend: ${statsRes.status}`);
    }
    const statsData = await statsRes.json();

    const historyRes = await fetch("http://127.0.0.1:8000/api/scan/history?limit=30", {
      cache: "no-store"
    });
    
    let threats = [];
    if (historyRes.ok) {
      const historyData = await historyRes.json();
      threats = historyData.map((item: any) => ({
        id: String(item.id),
        domain: item["Domain Name"],
        threatType: item["Threat Type"],
        riskScore: item["Risk Score"],
        severity: item["Severity"].toLowerCase(),
        status: item["Status"].toLowerCase(),
        createdAt: item["created_at_db"] || item["Detection Timestamp"],
        updatedAt: item["created_at_db"] || item["Detection Timestamp"],
        details: {
          whoisAge: `${item["WHOIS Age Days"]} days`,
          sslStatus: item["SSL Status"],
          recommendedAction: item["Recommended Action"],
        },
      }));
    }

    return NextResponse.json({
      stats: statsData.stats,
      threats: threats,
      severityDistribution: statsData.severityDistribution,
      recentActivity: statsData.recentActivity,
    });
  } catch (error: any) {
    console.error("Dashboard backend fetch failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
