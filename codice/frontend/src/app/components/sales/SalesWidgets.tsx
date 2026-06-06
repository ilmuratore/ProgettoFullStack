import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Clock, Truck, XCircle, RefreshCw } from 'lucide-react';

const donutData = [
  { name: 'Bozza', value: 18, color: '#9CA3AF' },
  { name: 'Confermato', value: 98, color: '#3B82F6' },
  { name: 'Spedito', value: 87, color: '#17E88F' },
  { name: 'Annullato', value: 12, color: '#EF4444' },
];

const pickingInProgress = [
  { id: 'SO-2026-003', operatore: 'S. Romano', percentuale: 75 },
  { id: 'SO-2026-006', operatore: 'F. Marino', percentuale: 40 },
  { id: 'SO-2026-009', operatore: 'G. Gallo', percentuale: 95 },
];

const alerts = [
  { icon: AlertTriangle, color: 'text-[#EF4444]', bg: 'bg-[#FEE2E2]', label: 'Ordini bloccati', count: 3 },
  { icon: Clock, color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]', label: 'Picking in ritardo', count: 5 },
  { icon: Truck, color: 'text-[#8B5CF6]', bg: 'bg-[#EDE9FE]', label: 'Problemi spedizione', count: 2 },
  { icon: XCircle, color: 'text-[#6B7280]', bg: 'bg-[#F3F4F6]', label: 'Annullati oggi', count: 1 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E5EAF2] rounded-xl p-3 shadow-lg">
        <p className="text-xs font-medium text-[#2D2D2D]">{payload[0].name}</p>
        <p className="text-sm font-semibold" style={{ color: payload[0].payload.color }}>{payload[0].value} ordini</p>
      </div>
    );
  }
  return null;
};

export function SalesWidgets() {
  const total = donutData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Donut Chart Stato Ordini */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <h3 className="font-semibold text-[#2D2D2D] mb-5">Stato Ordini</h3>
        <div className="relative">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#2D2D2D]">{total}</div>
              <div className="text-xs text-[#6B7280]">Totale</div>
            </div>
          </div>
        </div>
        <div className="space-y-2 mt-2">
          {donutData.map((d, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-[#6B7280]">{d.name}</span>
              </div>
              <span className="text-xs font-semibold text-[#2D2D2D]">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Picking in Corso */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <h3 className="font-semibold text-[#2D2D2D] mb-5">Picking in Corso</h3>
        <div className="space-y-4">
          {pickingInProgress.map((p, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-sm font-medium text-[#2D2D2D]">{p.id}</span>
                  <span className="text-xs text-[#9CA3AF] ml-2">{p.operatore}</span>
                </div>
                <span className="text-xs font-semibold text-[#17E88F]">{p.percentuale}%</span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#17E88F] to-[#0FA67A] transition-all duration-700"
                  style={{ width: `${p.percentuale}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Operativi */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <h3 className="font-semibold text-[#2D2D2D] mb-5">Alert Operativi</h3>
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const Icon = alert.icon;
            return (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F9FC] hover:bg-[#F0FDF7] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${alert.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${alert.color}`} />
                  </div>
                  <span className="text-sm text-[#2D2D2D]">{alert.label}</span>
                </div>
                <span className={`text-sm font-semibold ${alert.color}`}>{alert.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ERP Sync */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#DCFCE7] rounded-xl flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div>
            <div className="text-xs font-medium text-[#2D2D2D]">ERP Sync</div>
            <div className="text-xs text-[#6B7280]">08:41:32 — Tutti i dati aggiornati</div>
          </div>
          <div className="ml-auto w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
