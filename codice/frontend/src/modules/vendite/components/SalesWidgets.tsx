import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router';
import { BarChart2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import type { OrdineVendita } from '../../../types/ordini';

interface SalesWidgetsProps {
  orders: OrdineVendita[];
}

export function SalesWidgets({ orders }: SalesWidgetsProps) {
  const navigate = useNavigate();

  const bozza = orders.filter((o) => o.stato === 'BOZZA');
  const confermati = orders.filter((o) => o.stato === 'CONFERMATO');
  const spediti = orders.filter((o) => o.stato === 'SPEDITO');
  const annullati = orders.filter((o) => o.stato === 'ANNULLATO');

  const donutData = [
    { name: 'Bozza', value: bozza.length, color: '#9CA3AF' },
    { name: 'Confermato', value: confermati.length, color: '#3B82F6' },
    { name: 'Consegnato', value: spediti.length, color: '#17E88F' },
    { name: 'Annullato', value: annullati.length, color: '#EF4444' },
  ];
  const total = donutData.reduce((sum, d) => sum + d.value, 0);

  const alerts = [
    { icon: AlertTriangle, color: 'text-[#EF4444]', bg: 'bg-[#FEE2E2]', label: 'Ordini in bozza', count: bozza.length, onClick: () => navigate('/vendite?stato=BOZZA') },
    { icon: XCircle, color: 'text-[#6B7280]', bg: 'bg-[#F3F4F6]', label: 'Annullati', count: annullati.length, onClick: () => navigate('/vendite?stato=ANNULLATO') },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Stato Ordini */}
      <div className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#17E88F] to-[#0FA67A] rounded-lg flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2D2D2D]">Stato Ordini</h3>
            <p className="text-xs text-[#6B7280]">Distribuzione per stato</p>
          </div>
        </div>
        {total === 0 ? (
          <div className="text-center py-4 text-xs text-[#6B7280]">Nessun ordine registrato</div>
        ) : (
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={80} height={80}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={24}
                  outerRadius={38}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1">
              {donutData.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-[#6B7280]">{d.name}</span>
                  </div>
                  <span className="text-xs font-medium text-[#2D2D2D]">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alert Operativi */}
      <div className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-xl p-4 border border-[#F59E0B]/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#92400E]">Alert Operativi</h3>
            <p className="text-xs text-[#92400E]/70">Richiedono attenzione</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {alerts.map((alert, i) => {
            const Icon = alert.icon;
            return (
              <button
                key={i}
                onClick={alert.onClick}
                className="w-full flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 hover:bg-white transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 ${alert.bg} rounded-md flex items-center justify-center`}>
                    <Icon className={`w-3 h-3 ${alert.color}`} />
                  </div>
                  <span className="text-xs text-[#92400E]">{alert.label}</span>
                </div>
                <span className={`text-xs font-semibold ${alert.color}`}>{alert.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ERP Sync */}
      <div className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2D2D2D]">ERP Sync</h3>
            <p className="text-xs text-[#6B7280]">Sincronizzazione dati</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-3 py-2 bg-[#F7F9FC] rounded-lg">
            <span className="text-xs text-[#6B7280]">Ultimo aggiornamento</span>
            <span className="text-xs font-medium text-[#2D2D2D]">{new Date().toLocaleTimeString('it-IT')}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-[#F7F9FC] rounded-lg">
            <span className="text-xs text-[#6B7280]">Stato</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-pulse" />
              <span className="text-xs font-medium text-[#22C55E]">Aggiornato</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
