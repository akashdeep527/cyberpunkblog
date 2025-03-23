import { ReactNode } from "react";
import { ArrowUp, ArrowDown, Circle } from "lucide-react";
import CyberBorder from "@/components/shared/CyberBorder";

interface StatsCardProps {
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
    isWarning?: boolean;
  };
}

export default function StatsCard({ 
  icon, 
  iconColor, 
  iconBgColor, 
  title, 
  value, 
  trend 
}: StatsCardProps) {
  return (
    <CyberBorder className="rounded-lg bg-darkBg p-6 flex items-center">
      <div className={`rounded-full ${iconBgColor} p-3 mr-4`}>
        <div className={`${iconColor} text-xl`}>
          {icon}
        </div>
      </div>
      
      <div>
        <p className="text-mutedText text-sm">{title}</p>
        <h3 className="text-2xl font-orbitron">{value}</h3>
        
        {trend && (
          <p className={`text-xs flex items-center mt-1 ${
            trend.isWarning 
              ? "text-warningYellow" 
              : trend.isPositive 
                ? "text-neonGreen" 
                : "text-dangerRed"
          }`}>
            {trend.isWarning ? (
              <Circle className="h-2 w-2 mr-1" />
            ) : trend.isPositive ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1" />
            )}
            {trend.value}
          </p>
        )}
      </div>
    </CyberBorder>
  );
}
