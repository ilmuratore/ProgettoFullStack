import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router';
import { AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import type { OrdineVendita } from '../../../types/ordini';

interface SalesWidgetsProps {
  orders: OrdineVendita[];
}

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

export function SalesWidgets({ orders }: SalesWidgetsProps) {
  const navigate = useNavigate();

  const bozza = orders.filter((o) => o.stato === 'BOZZA');
  const confermati = orders.filter((o) => o.stato === 'CONFERMATO');
  const spediti = orders.filter((o) => o.stato === 'SPEDITO');
  const annullati = orders.filter((o) => o.stato === 'ANNULLATO');

  const donutData = [
    { name: 'Bozza', value: bozza.length, color: '#9CA3AF' },
    { name: 'Confermato', value: confermati.length, color: '#3B82F6' },
    { name: 'Spedito', value: spediti.length, color: '#17E88F' },
    { name: 'Annullato', value: annullati.length, color: '#EF4444' },
  ];
  const total = donutData.reduce((sum, d) => sum + d.value, 0);

  const alerts = [
    { icon: AlertTriangle, color: 'text-[#EF4444]', bg: 'bg-[#FEE2E2]', label: 'Ordini in bozza', count: bozza.length, onClick: () => navigate('/vendite?stato=BOZZA') },
    { icon: XCircle, color: 'text-[#6B7280]', bg: 'bg-[#F3F4F6]', label: 'Annullati', count: annullati.length, onClick: () => navigate('/vendite?stato=ANNULLATO') },
  ];

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

      {/* Alert Operativi */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <h3 className="font-semibold text-[#2D2D2D] mb-5">Alert Operativi</h3>
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const Icon = alert.icon;
            return (
              <button
                key={i}
                onClick={alert.onClick}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F7F9FC] hover:bg-[#F0FDF7] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${alert.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${alert.color}`} />
                  </div>
                  <span className="text-sm text-[#2D2D2D]">{alert.label}</span>
                </div>
                <span className={`text-sm font-semibold ${alert.color}`}>{alert.count}</span>
              </button>
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
            <div className="text-xs text-[#6B7280]">{new Date().toLocaleTimeString('it-IT')} — Tutti i dati aggiornati</div>
          </div>
          <div className="ml-auto w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
