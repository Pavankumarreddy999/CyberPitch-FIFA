import { NextResponse } from "next/server";

const BACKEND = "http://localhost:8000";

export async function GET(
  _req: Request,
  context: { params: any }
) {
  try {
    const params = await context.params;
    const r = await fetch(`${BACKEND}/api/scan/${params.id}`, { cache: "no-store" });
    if (!r.ok) throw new Error(`Backend ${r.status}`);
    return NextResponse.json(await r.json());
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
