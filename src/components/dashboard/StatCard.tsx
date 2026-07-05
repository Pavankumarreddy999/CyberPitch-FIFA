import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className, description }: StatCardProps) {
  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : "-"}{trend.value}%
              </span>
              <span className="text-sm text-gray-500 ml-1">from last week</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    </div>
  );
}