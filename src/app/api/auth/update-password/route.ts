import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.username || !body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: "Username, current password, and new password are required" },
        { status: 400 }
      );
    }

    const res = await fetch("http://127.0.0.1:8000/auth/update-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: body.username,
        current_password: body.currentPassword,
        new_password: body.newPassword
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.detail || "Password update failed" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      return NextResponse.json(
        { error: "Backend server is currently offline." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Backend communication error" },
      { status: 500 }
    );
  }
}
