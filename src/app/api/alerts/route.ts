import { NextResponse } from "next/server";

const BACKEND = "http://localhost:8000";

export async function GET() {
  try {
    const r = await fetch(`${BACKEND}/api/scan/alerts?limit=50`, { cache: "no-store" });
    if (!r.ok) throw new Error(`Backend ${r.status}`);
    return NextResponse.json(await r.json());
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
