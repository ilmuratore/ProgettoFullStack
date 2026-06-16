import { ShoppingBag, Euro, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

export interface SalesKpiItem {
  title: string;
  value: string;
  subtitle: string;
  trend: number;
  iconBg: string;
  isWarning?: boolean;
  onClick?: () => void;
}

interface SalesKPIsProps {
  kpis: SalesKpiItem[];
}

const icons = [ShoppingBag, Euro, CheckCircle, TrendingUp];

export function SalesKPIs({ kpis }: SalesKPIsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {kpis.map((kpi, index) => {
        const Icon = icons[index] ?? ShoppingBag;
        const isPositiveTrend = kpi.trend > 0;

        return (
          <div
            key={index}
            onClick={kpi.onClick}
            className="bg-white rounded-xl px-4 py-4 border border-[#E5EAF2] hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-3"
          >
            <div className={`w-9 h-9 ${kpi.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-bold text-[#2D2D2D] truncate">{kpi.value}</div>
              <div className="text-xs text-[#9CA3AF] truncate">{kpi.title}</div>
            </div>
            <div className="flex-shrink-0">
              {kpi.isWarning ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#FEF3C7] text-[#F59E0B]">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs font-medium">Alert</span>
                </div>
              ) : (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                  isPositiveTrend ? 'bg-[#DCFCE7] text-[#22C55E]' : 'bg-[#FEE2E2] text-[#EF4444]'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${!isPositiveTrend ? 'rotate-180' : ''}`} />
                  <span className="text-xs font-medium">{Math.abs(kpi.trend).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
