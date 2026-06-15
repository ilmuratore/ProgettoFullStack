import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router';
import { Truck, AlertCircle, Clock } from 'lucide-react';
import type { Spedizione } from '../../../types/spedizioni';
import type { Corriere } from '../../../types/corrieri';

interface LogisticsWidgetsProps {
  shipments: Spedizione[];
  couriers: Corriere[];
  onShipmentClick: (id: number) => void;
}

const FLEET_STATUSES: { key: Spedizione['stato']; name: string; color: string }[] = [
  { key: 'IN_PREPARAZIONE', name: 'In Preparazione', color: '#9CA3AF' },
  { key: 'SPEDITA', name: 'Spedita', color: '#3B82F6' },
  { key: 'CONSEGNATA', name: 'Consegnata', color: '#22C55E' },
  { key: 'PROBLEMA', name: 'Problema', color: '#EF4444' },
];

export function LogisticsWidgets({ shipments, couriers, onShipmentClick }: LogisticsWidgetsProps) {
  const navigate = useNavigate();

  const fleetData = FLEET_STATUSES.map((s) => ({
    name: s.name,
    color: s.color,
    value: shipments.filter((sp) => sp.stato === s.key).length,
  }));

  const corrieriData = couriers.map((corriere) => ({
    id: corriere.id,
    nome: corriere.nome,
    consegne: shipments.filter((sp) => sp.corriere_id === corriere.id).length,
    attivo: corriere.attivo,
  }));

  const problemShipments = shipments.filter((sp) => sp.stato === 'PROBLEMA');

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
          {corrieriData.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">Nessun corriere registrato.</p>
          ) : corrieriData.map((corriere) => (
            <button
              key={corriere.id}
              onClick={() => navigate('/anagrafiche?tab=corrieri')}
              className="w-full flex items-center justify-between p-3 bg-[#F7F9FC] rounded-xl hover:bg-[#F0FDF7] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-[#6B7280]" />
                <div>
                  <p className="text-sm font-medium text-[#2D2D2D]">{corriere.nome}</p>
                  <p className="text-xs text-[#9CA3AF]">{corriere.consegne} spedizioni</p>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${corriere.attivo ? 'bg-[#22C55E]' : 'bg-[#9CA3AF]'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Alert Logistici */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <h3 className="font-semibold text-[#2D2D2D] mb-4">Alert Logistici</h3>
        <div className="space-y-3">
          {problemShipments.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">Nessuna spedizione in stato di problema.</p>
          ) : problemShipments.map((sp) => (
            <button
              key={sp.id}
              onClick={() => onShipmentClick(sp.id)}
              className="w-full p-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl text-left hover:bg-[#FDE68A] transition-colors"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#D97706] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[#92400E]">
                    SH-{String(sp.id).padStart(4, '0')} — {sp.cliente}
                  </p>
                  <p className="text-xs text-[#B45309] mt-0.5">{sp.destinazione ?? 'Destinazione non disponibile'}</p>
                </div>
              </div>
            </button>
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
            <span className="text-xs text-[#16A34A]">{new Date().toLocaleTimeString('it-IT')}</span>
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-3">Ultimo aggiornamento: {new Date().toLocaleTimeString('it-IT')}</p>
      </div>
    </div>
  );
}
