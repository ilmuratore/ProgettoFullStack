import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router';
import { BarChart2, AlertCircle, Truck, Clock } from 'lucide-react';
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
  const total = fleetData.reduce((sum, d) => sum + d.value, 0);

  const problemShipments = shipments.filter((sp) => sp.stato === 'PROBLEMA');
  const activeCouriers = couriers.filter((c) => c.attivo);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Stato Flotta */}
      <div className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2D2D2D]">Stato Flotta</h3>
            <p className="text-xs text-[#6B7280]">Distribuzione spedizioni</p>
          </div>
        </div>
        {total === 0 ? (
          <div className="text-center py-4 text-xs text-[#6B7280]">Nessuna spedizione registrata</div>
        ) : (
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={80} height={80}>
              <PieChart>
                <Pie
                  data={fleetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={24}
                  outerRadius={38}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {fleetData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1">
              {fleetData.map((d, i) => (
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

      {/* Alert Logistici */}
      <div className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-xl p-4 border border-[#F59E0B]/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#92400E]">Alert Logistici</h3>
            <p className="text-xs text-[#92400E]/70">Richiedono attenzione</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {problemShipments.length === 0 ? (
            <div className="text-center py-2 text-xs text-[#92400E]/70">Nessun problema rilevato</div>
          ) : problemShipments.slice(0, 2).map((sp) => (
            <button
              key={sp.id}
              onClick={() => onShipmentClick(sp.id)}
              className="w-full flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 hover:bg-white transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#FEE2E2] rounded-md flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-[#EF4444]" />
                </div>
                <span className="text-xs text-[#92400E]">SH-{String(sp.id).padStart(4, '0')}</span>
              </div>
              <span className="text-xs font-semibold text-[#EF4444] truncate max-w-[80px]">{sp.cliente}</span>
            </button>
          ))}
          {problemShipments.length > 2 && (
            <button
              onClick={() => navigate('/logistica?stato=PROBLEMA')}
              className="w-full text-xs text-[#92400E] text-center mt-1 hover:underline"
            >
              +{problemShipments.length - 2} altri problemi
            </button>
          )}
        </div>
      </div>

      {/* Corrieri e Tracking */}
      <div className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
            <Truck className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2D2D2D]">Corrieri</h3>
            <p className="text-xs text-[#6B7280]">Stato operativo</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-3 py-2 bg-[#F7F9FC] rounded-lg">
            <span className="text-xs text-[#6B7280]">Corrieri attivi</span>
            <span className="text-xs font-medium text-[#2D2D2D]">{activeCouriers.length} / {couriers.length}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-[#F7F9FC] rounded-lg">
            <span className="text-xs text-[#6B7280]">Tracking</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-pulse" />
              <Clock className="w-3 h-3 text-[#22C55E]" />
              <span className="text-xs font-medium text-[#22C55E]">{new Date().toLocaleTimeString('it-IT')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
