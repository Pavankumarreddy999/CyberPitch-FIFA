"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface SeverityChartProps {
  data?: {
    name: string;
    value: number;
  }[];
}

const COLORS = {
  critical: "#dc2626",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

export function SeverityChart({ data = defaultData }: SeverityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
        <XAxis 
          dataKey="name" 
          stroke="#6B7280"
          tick={{ fill: '#6B7280' }}
        />
        <YAxis 
          stroke="#6B7280"
          tick={{ fill: '#6B7280' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB',
            borderRadius: '8px'
          }}
          labelStyle={{ color: '#111827', fontWeight: 'bold' }}
        />
        <Legend />
        <Bar dataKey="value" name="Number of Threats">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || "#3b82f6"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const defaultData = [
  { name: "Critical", value: 45 },
  { name: "High", value: 78 },
  { name: "Medium", value: 23 },
  { name: "Low", value: 12 },
];