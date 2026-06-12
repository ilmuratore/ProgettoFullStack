import { TrendingUp, Package, CheckCircle, AlertTriangle, Truck, Target } from 'lucide-react';

export interface LogisticsKpiItem {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  iconBg: string;
  alert?: boolean;
}

interface LogisticsKPIsProps {
  items: LogisticsKpiItem[];
}

const icons = [Package, Truck, CheckCircle, AlertTriangle, Truck, Target];

export function LogisticsKPIs({ items }: LogisticsKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {items.map((item, index) => {
        const Icon = icons[index] ?? Package;
        return (
          <div key={index} className="bg-white rounded-2xl p-5 border border-[#E5EAF2] hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-[#9CA3AF] mb-1">{item.title}</p>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-2xl font-bold text-[#2D2D2D]">{item.value}</p>
              {item.alert && (
                <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#D97706] rounded-lg text-xs font-medium">Alert</span>
              )}
            </div>
            {typeof item.trend === 'number' ? (
              <div className="flex items-center gap-1">
                <TrendingUp className={`w-3 h-3 ${item.trend >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444] rotate-180'}`} />
                <span className={`text-xs font-medium ${item.trend >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {Math.abs(item.trend).toFixed(1)}%
                </span>
              </div>
            ) : item.subtitle ? (
              <span className="text-xs text-[#9CA3AF]">{item.subtitle}</span>
            ) : null}
            {typeof item.trend === 'number' && item.subtitle && (
              <p className="text-xs text-[#9CA3AF] mt-1">{item.subtitle}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
