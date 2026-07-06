import { DashboardData } from "@/lib/types";

export async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch("/api/dashboard");
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return response.json();
}

export async function fetchThreats() {
  const response = await fetch("/api/threats");
  if (!response.ok) {
    throw new Error("Failed to fetch threats");
  }
  return response.json();
}

export async function analyzeDomain(domain: string) {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ domain }),
  });
  if (!response.ok) {
    let message = "Failed to analyze domain";
    try {
      const err = await response.json();
      message = err.error || message;
    } catch {
      // ignore parse error, use default message
    }
    throw new Error(message);
  }
  return response.json();
}