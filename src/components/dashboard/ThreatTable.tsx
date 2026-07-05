import { Threat } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { getSeverityColor, getStatusColor, getRiskScoreColor } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface ThreatTableProps {
  threats: Threat[];
  onRowClick?: (threat: Threat) => void;
}

export function ThreatTable({ threats, onRowClick }: ThreatTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Threat Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {threats.map((threat) => (
              <tr 
                key={threat.id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                onClick={() => onRowClick?.(threat)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {threat.domain}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  <Badge variant="outline" className="border-gray-300 dark:border-gray-600">
                    {threat.threatType}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-bold ${getRiskScoreColor(threat.riskScore)}`}>
                    {threat.riskScore}
                  </span>
                  <span className="text-gray-500 text-xs">/100</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={threat.severity}>
                    {threat.severity}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="outline" className={getStatusColor(threat.status)}>
                    {threat.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}