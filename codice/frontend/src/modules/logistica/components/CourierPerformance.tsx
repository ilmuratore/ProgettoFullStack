import { Star, TrendingUp, TrendingDown, Truck } from 'lucide-react';

export interface CourierPerformanceItem {
  nome: string;
  totali: number;
  completate: number;
  problemi: number;
  tempoMedio: string;
  successRate: number;
  valutazione: number;
  stato: 'online' | 'offline';
}

interface CourierPerformanceProps {
  couriers: CourierPerformanceItem[];
}

export function CourierPerformance({ couriers }: CourierPerformanceProps) {
  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? 'fill-[#FBBF24] text-[#FBBF24]' : 'text-[#E5E7EB]'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[#2D2D2D]">Performance Corrieri</h3>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#6B7280]" />
          <span className="text-sm text-[#6B7280]">{couriers.length} corrieri</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Corriere</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Spedizioni Totali</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Consegne Completate</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Problemi</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Tempo Medio</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Success Rate</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Valutazione</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Stato</th>
            </tr>
          </thead>
          <tbody>
            {couriers.map((courier, idx) => (
              <tr key={`${courier.nome}-${idx}`} className="border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors">
                <td className="py-4 px-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center">
                      <Truck className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-[#2D2D2D]">{courier.nome}</span>
                  </div>
                </td>
                <td className="py-4 px-3"><span className="text-sm text-[#2D2D2D]">{courier.totali}</span></td>
                <td className="py-4 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#2D2D2D]">{courier.completate}</span>
                    <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" />
                  </div>
                </td>
                <td className="py-4 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#2D2D2D]">{courier.problemi}</span>
                    {courier.problemi > 0 ? <TrendingUp className="w-3.5 h-3.5 text-[#EF4444]" /> : <TrendingDown className="w-3.5 h-3.5 text-[#22C55E]" />}
                  </div>
                </td>
                <td className="py-4 px-3"><span className="text-sm text-[#6B7280]">{courier.tempoMedio}</span></td>
                <td className="py-4 px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#F3F4F6] rounded-full h-2 max-w-[80px]">
                      <div
                        className={`h-2 rounded-full ${courier.successRate >= 98 ? 'bg-[#22C55E]' : courier.successRate >= 95 ? 'bg-[#FBBF24]' : 'bg-[#EF4444]'}`}
                        style={{ width: `${courier.successRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-[#2D2D2D]">{courier.successRate.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="py-4 px-3">
                  <div className="flex items-center gap-2">
                    {renderStars(Math.round(courier.valutazione))}
                    <span className="text-xs text-[#6B7280]">{courier.valutazione.toFixed(1)}</span>
                  </div>
                </td>
                <td className="py-4 px-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${courier.stato === 'online' ? 'bg-[#22C55E]' : 'bg-[#9CA3AF]'}`} />
                    <span className={`text-xs ${courier.stato === 'online' ? 'text-[#22C55E]' : 'text-[#9CA3AF]'}`}>
                      {courier.stato === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {couriers.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-sm text-[#6B7280]">Nessun dato corrieri.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
