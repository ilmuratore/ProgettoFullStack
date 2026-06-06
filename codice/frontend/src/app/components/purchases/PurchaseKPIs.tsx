import { ShoppingCart, Euro, Building2, AlertTriangle, Package, Clock, TrendingUp } from 'lucide-react';

const kpis = [
  {
    icon: ShoppingCart,
    title: 'Ordini Acquisto Attivi',
    value: '128',
    subtitle: '+12% rispetto al mese scorso',
    trend: 12,
    iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB]',
  },
  {
    icon: Euro,
    title: 'Valore Ordini Aperti',
    value: '€ 1.248.750',
    subtitle: 'Importo in attesa',
    trend: 8.5,
    iconBg: 'bg-gradient-to-br from-[#17E88F] to-[#0FA67A]',
  },
  {
    icon: Building2,
    title: 'Fornitori Attivi',
    value: '87',
    subtitle: 'Partner verificati',
    trend: 3.2,
    iconBg: 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]',
  },
  {
    icon: AlertTriangle,
    title: 'Ordini in Ritardo',
    value: '14',
    subtitle: 'Richiedono attenzione',
    trend: -5.8,
    iconBg: 'bg-gradient-to-br from-[#EF4444] to-[#DC2626]',
    isWarning: true,
  },
  {
    icon: Package,
    title: 'Ricezioni Oggi',
    value: '32',
    subtitle: 'Consegne completate',
    trend: 18.4,
    iconBg: 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]',
  },
  {
    icon: Clock,
    title: 'Lead Time Medio',
    value: '8,4 giorni',
    subtitle: 'Tempo medio consegna',
    trend: -2.1,
    iconBg: 'bg-gradient-to-br from-[#06B6D4] to-[#0891B2]',
  },
];

export function PurchaseKPIs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const isPositiveTrend = kpi.trend > 0;

        return (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-[#E5EAF2] hover:shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${kpi.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              {kpi.isWarning ? (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FEF3C7] text-[#F59E0B]">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs font-medium">Alert</span>
                </div>
              ) : (
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                  isPositiveTrend ? 'bg-[#DCFCE7] text-[#22C55E]' : 'bg-[#DBEAFE] text-[#3B82F6]'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${!isPositiveTrend && 'rotate-180'}`} />
                  <span className="text-xs font-medium">{Math.abs(kpi.trend)}%</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-semibold text-[#2D2D2D]">{kpi.value}</div>
              <div className="text-xs text-[#6B7280]">{kpi.subtitle}</div>
              <div className="text-xs text-[#6B7280] mt-2">{kpi.title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
