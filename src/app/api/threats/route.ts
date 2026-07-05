import { NextResponse } from "next/server";

// Mock threat data
const threatsData = [
  {
    id: "1",
    domain: "fifa-tickets-24.net",
    threatType: "Fake Ticketing",
    riskScore: 93,
    severity: "critical",
    status: "pending block",
    createdAt: new Date("2026-07-04T10:30:00").toISOString(),
    updatedAt: new Date("2026-07-04T10:30:00").toISOString(),
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
    severity: "critical",
    status: "blocked",
    createdAt: new Date("2026-07-04T09:15:00").toISOString(),
    updatedAt: new Date("2026-07-04T11:00:00").toISOString(),
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
    severity: "high",
    status: "notified",
    createdAt: new Date("2026-07-04T08:00:00").toISOString(),
    updatedAt: new Date("2026-07-04T08:30:00").toISOString(),
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
    severity: "medium",
    status: "under review",
    createdAt: new Date("2026-07-03T14:45:00").toISOString(),
    updatedAt: new Date("2026-07-04T07:00:00").toISOString(),
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
    severity: "critical",
    status: "pending block",
    createdAt: new Date("2026-07-04T06:20:00").toISOString(),
    updatedAt: new Date("2026-07-04T06:20:00").toISOString(),
    details: {
      whoisAge: "5 days",
      sslStatus: "Invalid",
      visualSimilarity: 78,
      phishingProbability: 60,
      recommendedAction: "Block Domain & Extract IOCs",
    },
  },
];

// GET /api/threats - Get all threats
export async function GET() {
  return NextResponse.json(threatsData);
}

// GET /api/threats?severity=critical - Get threats by severity
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    if (!body.domain || !body.threatType) {
      return NextResponse.json(
        { error: "Missing required fields: domain and threatType are required" },
        { status: 400 }
      );
    }

    // Create a new threat
    const newThreat = {
      id: Date.now().toString(),
      domain: body.domain,
      threatType: body.threatType,
      riskScore: body.riskScore || 50,
      severity: body.severity || "medium",
      status: body.status || "under review",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      details: body.details || {
        whoisAge: "Unknown",
        sslStatus: "Unknown",
        visualSimilarity: 0,
        phishingProbability: 0,
        recommendedAction: "Investigate",
      },
    };

    // In a real app, you would save this to a database
    // For now, we'll just return the created threat
    return NextResponse.json({ 
      success: true, 
      data: newThreat,
      message: "Threat submitted successfully" 
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// DELETE /api/threats?id=1 - Delete a threat
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Threat ID is required" },
      { status: 400 }
    );
  }

  // In a real app, you would delete from database
  return NextResponse.json({ 
    success: true, 
    message: `Threat with ID ${id} deleted successfully` 
  });
}