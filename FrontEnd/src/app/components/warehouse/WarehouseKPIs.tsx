import { Package, MapPin, AlertTriangle, RotateCw, Warehouse, Building2, TrendingUp, TrendingDown } from 'lucide-react';

const kpis = [
  {
    icon: Package,
    title: 'Giacenza Totale',
    value: '2.485.340',
    unit: 'unità',
    trend: 4.8,
    iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB]',
  },
  {
    icon: MapPin,
    title: 'Ubicazioni Attive',
    value: '1.248',
    unit: '98%',
    trend: 2.1,
    iconBg: 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]',
  },
  {
    icon: AlertTriangle,
    title: 'Prodotti Sottoscorta',
    value: '23',
    unit: 'alert attivi',
    trend: -5.2,
    iconBg: 'bg-gradient-to-br from-[#EF4444] to-[#DC2626]',
  },
  {
    icon: RotateCw,
    title: 'Movimenti Oggi',
    value: '584',
    unit: 'operazioni',
    trend: 18.0,
    iconBg: 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]',
  },
  {
    icon: Warehouse,
    title: 'Capacità Occupata',
    value: '78%',
    unit: '3.900 m² / 5.000 m²',
    trend: 3.5,
    iconBg: 'bg-gradient-to-br from-[#17E88F] to-[#0FA67A]',
  },
  {
    icon: Building2,
    title: 'Magazzini Operativi',
    value: '4',
    unit: 'tutti online',
    trend: 0,
    iconBg: 'bg-gradient-to-br from-[#06B6D4] to-[#0891B2]',
  },
];

export function WarehouseKPIs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const isPositive = kpi.trend > 0;
        const isNeutral = kpi.trend === 0;

        return (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-[#E5EAF2] hover:shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${kpi.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              {!isNeutral && (
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                  isPositive ? 'bg-[#DCFCE7] text-[#22C55E]' : 'bg-[#FEE2E2] text-[#EF4444]'
                }`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-xs font-medium">{Math.abs(kpi.trend)}%</span>
                </div>
              )}
              {isNeutral && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F3F4F6] text-[#6B7280]">
                  <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
                  <span className="text-xs font-medium">Online</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-semibold text-[#2D2D2D]">{kpi.value}</div>
              <div className="text-xs text-[#6B7280]">{kpi.unit}</div>
              <div className="text-xs text-[#6B7280] mt-2">{kpi.title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
