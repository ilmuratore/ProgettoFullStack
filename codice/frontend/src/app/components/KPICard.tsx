import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  trend: number;
  iconBgColor: string;
  iconColor: string;
}

export function KPICard({ icon: Icon, title, value, trend, iconBgColor, iconColor }: KPICardProps) {
  const isPositive = trend > 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2] hover:shadow-lg transition-all duration-300 group cursor-pointer">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${
          isPositive ? 'bg-[#DCFCE7] text-[#22C55E]' : 'bg-[#FEE2E2] text-[#EF4444]'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span className="text-xs font-medium">{Math.abs(trend)}%</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-semibold text-[#2D2D2D] mb-1">{value}</div>
        <div className="text-sm text-[#6B7280]">{title}</div>
      </div>
    </div>
  );
}
