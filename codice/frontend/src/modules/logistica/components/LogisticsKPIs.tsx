import { TrendingUp, Package, CheckCircle, AlertTriangle, Truck, Target } from 'lucide-react';

export interface LogisticsKpiItem {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  iconBg: string;
  alert?: boolean;
  onClick?: () => void;
}

interface LogisticsKPIsProps {
  items: LogisticsKpiItem[];
}

const icons = [Package, Truck, CheckCircle, AlertTriangle, Truck, Target];

export function LogisticsKPIs({ items }: LogisticsKPIsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
      {items.map((item, index) => {
        const Icon = icons[index] ?? Package;
        const isPositiveTrend = (item.trend ?? 0) >= 0;

        return (
          <div
            key={index}
            onClick={item.onClick}
            className="bg-white rounded-xl px-4 py-4 border border-[#E5EAF2] hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-3"
          >
            <div className={`w-9 h-9 ${item.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-bold text-[#2D2D2D] truncate">{item.value}</div>
              <div className="text-xs text-[#9CA3AF] truncate">{item.title}</div>
            </div>
            <div className="flex-shrink-0">
              {item.alert ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#FEF3C7] text-[#F59E0B]">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs font-medium">Alert</span>
                </div>
              ) : typeof item.trend === 'number' ? (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                  isPositiveTrend ? 'bg-[#DCFCE7] text-[#22C55E]' : 'bg-[#FEE2E2] text-[#EF4444]'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${!isPositiveTrend ? 'rotate-180' : ''}`} />
                  <span className="text-xs font-medium">{Math.abs(item.trend).toFixed(1)}%</span>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
