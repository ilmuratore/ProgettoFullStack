import { ShoppingBag, CheckCircle, Package, Truck, MapPin, XCircle } from 'lucide-react';

const activities = [
  { icon: ShoppingBag, color: 'text-[#3B82F6]', bg: 'bg-[#DBEAFE]', evento: 'Nuovo ordine creato', dettaglio: 'SO-2026-011 — Nestlé Italia S.p.A.', ora: '15:47', delta: '2 min fa' },
  { icon: CheckCircle, color: 'text-[#22C55E]', bg: 'bg-[#DCFCE7]', evento: 'Ordine confermato', dettaglio: 'SO-2026-010 — Mutti S.p.A. — € 24.450', ora: '15:30', delta: '19 min fa' },
  { icon: Package, color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]', evento: 'Picking completato', dettaglio: 'SO-2026-001 — Ferrero S.p.A. — 4 righe', ora: '14:22', delta: '1h 27min fa' },
  { icon: Truck, color: 'text-[#8B5CF6]', bg: 'bg-[#EDE9FE]', evento: 'Spedizione partita', dettaglio: 'SH-2026-040 — GLS Italy — Agrate Brianza', ora: '13:15', delta: '2h 34min fa' },
  { icon: MapPin, color: 'text-[#17E88F]', bg: 'bg-[#DCFCE7]', evento: 'Consegna effettuata', dettaglio: 'SH-2026-039 — BRT Corriere — Montechiarugolo', ora: '11:05', delta: '4h 44min fa' },
  { icon: CheckCircle, color: 'text-[#22C55E]', bg: 'bg-[#DCFCE7]', evento: 'Ordine confermato', dettaglio: 'SO-2026-009 — Star S.p.A. — € 36.920', ora: '10:48', delta: '5h 1min fa' },
  { icon: XCircle, color: 'text-[#EF4444]', bg: 'bg-[#FEE2E2]', evento: 'Ordine annullato', dettaglio: 'SO-2026-008 — Divella S.p.A.', ora: '09:20', delta: '6h 29min fa' },
  { icon: Truck, color: 'text-[#8B5CF6]', bg: 'bg-[#EDE9FE]', evento: 'Spedizione partita', dettaglio: 'SH-2026-038 — FedEx Italy — Parma', ora: '08:55', delta: '6h 54min fa' },
];

export function SalesRecentActivity() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[#2D2D2D]">Ultime Attività Vendite</h3>
        <button className="text-xs text-[#17E88F] hover:underline">Vedi tutto</button>
      </div>

      <div className="space-y-0">
        {activities.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 ${a.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-4 h-4 ${a.color}`} />
                </div>
                {i < activities.length - 1 && (
                  <div className="w-0.5 h-6 bg-[#F3F4F6] mt-1" />
                )}
              </div>
              <div className="pb-5 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#2D2D2D]">{a.evento}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5 truncate">{a.dettaglio}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#6B7280]">{a.ora}</p>
                    <p className="text-xs text-[#9CA3AF]">{a.delta}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
