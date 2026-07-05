import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This is the main export that's missing - cn function for merging class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  // If date is a string, convert it to Date object
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: "bg-red-100 text-red-800 border-red-300",
    high: "bg-orange-100 text-orange-800 border-orange-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    low: "bg-green-100 text-green-800 border-green-300",
  };
  return colors[severity] || colors.low;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    "pending block": "bg-yellow-100 text-yellow-800",
    "blocked": "bg-green-100 text-green-800",
    "notified": "bg-blue-100 text-blue-800",
    "under review": "bg-purple-100 text-purple-800",
  };
  return colors[status] || colors["under review"];
}

export function getRiskScoreColor(score: number): string {
  if (score >= 80) return "text-red-600";
  if (score >= 60) return "text-orange-600";
  if (score >= 40) return "text-yellow-600";
  return "text-green-600";
}