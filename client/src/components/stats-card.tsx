import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'orange';
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
}

const colorClasses = {
  primary: 'bg-primary bg-opacity-10 text-primary',
  secondary: 'bg-secondary bg-opacity-10 text-secondary',
  success: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
};

export default function StatsCard({ title, value, icon, color, trend }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4">
            <p className={`text-sm flex items-center ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.direction === 'up' ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {trend.value}% {trend.period}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
