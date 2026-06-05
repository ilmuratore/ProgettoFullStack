import { AlertTriangle, TrendingUp, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const lateOrders = [
  { numero: 'PO-2026-012', fornitore: 'Imballaggi Express', ritardo: 5 },
  { numero: 'PO-2026-018', fornitore: 'Materiali Nord', ritardo: 3 },
  { numero: 'PO-2026-021', fornitore: 'Packaging Pro', ritardo: 8 },
  { numero: 'PO-2026-025', fornitore: 'Supplies Italia', ritardo: 2 },
];

const statusData = [
  { name: 'Bozza', value: 12, color: '#6B7280' },
  { name: 'Inviato', value: 28, color: '#3B82F6' },
  { name: 'Confermato', value: 35, color: '#8B5CF6' },
  { name: 'In Ricezione', value: 24, color: '#F59E0B' },
  { name: 'Completato', value: 89, color: '#22C55E' },
];

const topSuppliers = [
  { nome: 'Packaging Solutions Italia', ordini: 24, importo: '€ 285.450', leadTime: '7,2 giorni' },
  { nome: 'Pallet Systems Europe', ordini: 18, importo: '€ 198.320', leadTime: '8,5 giorni' },
  { nome: 'Film Protezione Italia', ordini: 15, importo: '€ 167.890', leadTime: '6,8 giorni' },
];

const alerts = [
  { tipo: 'PO in ritardo', messaggio: '5 ordini oltre la data prevista', color: 'text-[#EF4444]', bg: 'bg-[#FEE2E2]' },
  { tipo: 'Ricezione parziale', messaggio: '3 ordini ricevuti parzialmente', color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]' },
  { tipo: 'Consegna imminente', messaggio: '8 ordini previsti domani', color: 'text-[#3B82F6]', bg: 'bg-[#DBEAFE]' },
];

export function PurchaseWidgets() {
  return (
    <div className="space-y-6">
      {/* Ordini in Ritardo */}
      <div className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-2xl p-6 border border-[#F59E0B]/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#92400E]">Ordini in Ritardo</h3>
            <p className="text-xs text-[#92400E]/70">Richiedono azione</p>
          </div>
        </div>

        <div className="space-y-3">
          {lateOrders.map((order, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-3 hover:bg-white transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm text-[#92400E] font-mono">{order.numero}</div>
                  <div className="text-xs text-[#92400E]/70 mt-0.5">{order.fornitore}</div>
                </div>
                <div className="px-2 py-1 bg-[#EF4444] text-white rounded-lg text-xs font-medium">
                  {order.ritardo}gg
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stato Approvvigionamenti */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <h3 className="font-semibold text-[#2D2D2D] mb-6">Stato Approvvigionamenti</h3>

        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-2">
          {statusData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-[#6B7280]">{item.name}</span>
              </div>
              <div className="text-sm font-medium text-[#2D2D2D]">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Fornitori */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#17E88F] to-[#0FA67A] rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2D2D2D]">Top Fornitori</h3>
            <p className="text-xs text-[#6B7280]">Performance migliori</p>
          </div>
        </div>

        <div className="space-y-3">
          {topSuppliers.map((supplier, index) => (
            <div
              key={index}
              className="p-3 bg-[#F7F9FC] rounded-xl hover:bg-[#F0FDF7] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-[#17E88F] text-white rounded-lg flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div className="font-medium text-sm text-[#2D2D2D]">{supplier.nome}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-[#6B7280]">Ordini</div>
                  <div className="font-medium text-[#2D2D2D]">{supplier.ordini}</div>
                </div>
                <div>
                  <div className="text-[#6B7280]">Importo</div>
                  <div className="font-medium text-[#2D2D2D]">{supplier.importo}</div>
                </div>
                <div>
                  <div className="text-[#6B7280]">Lead Time</div>
                  <div className="font-medium text-[#2D2D2D]">{supplier.leadTime}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Operativi */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2D2D2D]">Alert Operativi</h3>
            <p className="text-xs text-[#6B7280]">Notifiche attive</p>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-3 ${alert.bg} rounded-xl border border-${alert.color}/20`}
            >
              <div className="flex items-start gap-2">
                <Bell className={`w-4 h-4 ${alert.color} mt-0.5`} />
                <div className="flex-1">
                  <div className={`font-medium text-sm ${alert.color}`}>{alert.tipo}</div>
                  <div className="text-xs text-[#6B7280] mt-1">{alert.messaggio}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
