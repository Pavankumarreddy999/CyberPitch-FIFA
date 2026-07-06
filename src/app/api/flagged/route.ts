import { NextResponse } from "next/server";

const BACKEND = "http://localhost:8000";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const severity = url.searchParams.get("severity") || "";
    const threat_type = url.searchParams.get("threat_type") || "";
    const qs = new URLSearchParams();
    if (severity) qs.set("severity", severity);
    if (threat_type) qs.set("threat_type", threat_type);
    qs.set("limit", "100");
    const r = await fetch(`${BACKEND}/api/scan/flagged?${qs}`, { cache: "no-store" });
    if (!r.ok) throw new Error(`Backend ${r.status}`);
    return NextResponse.json(await r.json());
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
