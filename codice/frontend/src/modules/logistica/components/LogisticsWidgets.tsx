import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Truck, AlertCircle, Clock } from 'lucide-react';

const fleetData = [
  { name: 'In Preparazione', value: 28, color: '#9CA3AF' },
  { name: 'Spedita', value: 124, color: '#3B82F6' },
  { name: 'Consegnata', value: 1248, color: '#22C55E' },
  { name: 'Problema', value: 6, color: '#EF4444' },
];

const corrieri = [
  { nome: 'BRT Express', consegne: 42, stato: 'online' },
  { nome: 'SDA', consegne: 38, stato: 'online' },
  { nome: 'GLS Italy', consegne: 27, stato: 'online' },
  { nome: 'TNT', consegne: 18, stato: 'online' },
  { nome: 'Bartolini', consegne: 15, stato: 'offline' },
];

const alerts = [
  { tipo: 'Ritardo Consegna', descrizione: 'SH-2026-0838 - Ritardo 2h', urgenza: 'high' },
  { tipo: 'Tracking Non Aggiornato', descrizione: 'SH-2026-0835 - 12h senza update', urgenza: 'medium' },
  { tipo: 'Consegna Urgente', descrizione: 'SH-2026-0842 - Priorità Alta', urgenza: 'high' },
];

export function LogisticsWidgets() {
  return (
    <div className="space-y-6">
      {/* Stato Flotta Consegne */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <h3 className="font-semibold text-[#2D2D2D] mb-4">Stato Flotta Consegne</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fleetData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {fleetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-4">
          {fleetData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-[#6B7280]">{item.name}</span>
              </div>
              <span className="text-xs font-medium text-[#2D2D2D]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Corrieri Attivi */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <h3 className="font-semibold text-[#2D2D2D] mb-4">Corrieri Attivi</h3>
        <div className="space-y-3">
          {corrieri.map((corriere, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-[#F7F9FC] rounded-xl hover:bg-[#F0FDF7] transition-colors">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-[#6B7280]" />
                <div>
                  <p className="text-sm font-medium text-[#2D2D2D]">{corriere.nome}</p>
                  <p className="text-xs text-[#9CA3AF]">{corriere.consegne} consegne</p>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${corriere.stato === 'online' ? 'bg-[#22C55E]' : 'bg-[#9CA3AF]'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Alert Logistici */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <h3 className="font-semibold text-[#2D2D2D] mb-4">Alert Logistici</h3>
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <div key={idx} className="p-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#D97706] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[#92400E]">{alert.tipo}</p>
                  <p className="text-xs text-[#B45309] mt-0.5">{alert.descrizione}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stato Sistema Tracking */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <h3 className="font-semibold text-[#2D2D2D] mb-4">Stato Sistema Tracking</h3>
        <div className="flex items-center justify-between p-4 bg-[#DCFCE7] rounded-xl border border-[#BBF7D0]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#22C55E] rounded-full animate-pulse" />
            <span className="text-sm font-medium text-[#16A34A]">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="text-xs text-[#16A34A]">08:42:18</span>
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-3">Ultimo aggiornamento: 08:42:18</p>
      </div>
    </div>
  );
}
