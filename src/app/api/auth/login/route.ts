import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const res = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: body.username, password: body.password }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.detail || "Login failed" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      return NextResponse.json(
        { error: "Backend server is currently offline. Please ensure the Python backend is running on port 8000." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Backend communication error" },
      { status: 500 }
    );
  }
}
