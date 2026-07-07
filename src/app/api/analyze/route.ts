import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { domain } = await request.json();
    if (!domain) {
      return NextResponse.json(
        { error: "Domain name is required" },
        { status: 400 }
      );
    }

    const backendRes = await fetch("http://127.0.0.1:8000/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain }),
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      return NextResponse.json(
        { error: errText || "Failed to scan domain on backend" },
        { status: backendRes.status }
      );
    }

    const result = await backendRes.json();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to connect to backend scanner" },
      { status: 500 }
    );
  }
}
