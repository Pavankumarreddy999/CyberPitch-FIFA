import { NextResponse } from "next/server";

// GET /api/threats - Get all threats from backend
export async function GET() {
  try {
    const historyRes = await fetch("http://localhost:8000/api/scan/history?limit=100", {
      cache: "no-store"
    });
    
    if (!historyRes.ok) {
      throw new Error(`Failed to fetch history from backend: ${historyRes.status}`);
    }
    
    const historyData = await historyRes.json();
    const threats = historyData.map((item: any) => ({
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
        visualSimilarity: item["Visual Similarity Score"],
        phishingProbability: item["Phishing Probability"],
        recommendedAction: item["Recommended Action"],
      },
    }));

    return NextResponse.json(threats);
  } catch (error: any) {
    console.error("Threats GET fetch failed:", error);
    return NextResponse.json({ error: error.message || "Failed to load threats" }, { status: 500 });
  }
}

// POST /api/threats - Submit a new threat (can map directly to backend scan)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.domain) {
      return NextResponse.json(
        { error: "domain is required" },
        { status: 400 }
      );
    }

    const scanRes = await fetch("http://localhost:8000/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain: body.domain }),
    });

    if (!scanRes.ok) {
      const errText = await scanRes.text();
      throw new Error(errText || "Backend scan failed");
    }

    const result = await scanRes.json();
    return NextResponse.json({ 
      success: true, 
      data: result.data,
      message: "Threat submitted and scanned successfully" 
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Invalid request body or backend communication error" },
      { status: 400 }
    );
  }
}

// DELETE /api/threats - Delete a threat (can add backend delete if needed, but not critical)
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Threat ID is required" },
      { status: 400 }
    );
  }

  try {
    const backendRes = await fetch(`http://localhost:8000/api/scan/${id}`, {
      method: "DELETE",
    });

    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      throw new Error(errorText || "Failed to delete from backend");
    }

    return NextResponse.json({ 
      success: true, 
      message: `Threat with ID ${id} deleted successfully` 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Backend communication error" },
      { status: 500 }
    );
  }
}