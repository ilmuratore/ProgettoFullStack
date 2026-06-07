import { Package, Truck, MapPin, CheckCircle, AlertTriangle, Navigation } from 'lucide-react';

const events = [
  { id: 1, tipo: 'Consegnata', descrizione: 'SH-2026-0839 - Consegna completata a Parma', timestamp: '14:32', icon: CheckCircle, color: 'text-[#22C55E]', bgColor: 'bg-[#DCFCE7]' },
  { id: 2, tipo: 'In Consegna', descrizione: 'SH-2026-0842 - Mezzo in transito verso Torino', timestamp: '13:15', icon: Truck, color: 'text-[#3B82F6]', bgColor: 'bg-[#DBEAFE]' },
  { id: 3, tipo: 'Problema Segnalato', descrizione: 'SH-2026-0838 - Ritardo previsto 2 ore', timestamp: '12:48', icon: AlertTriangle, color: 'text-[#F59E0B]', bgColor: 'bg-[#FEF3C7]' },
  { id: 4, tipo: 'Arrivata Hub', descrizione: 'SH-2026-0841 - Arrivata hub Milano', timestamp: '11:22', icon: MapPin, color: 'text-[#8B5CF6]', bgColor: 'bg-[#EDE9FE]' },
  { id: 5, tipo: 'Partita dal Magazzino', descrizione: 'SH-2026-0840 - Partenza verso Milano', timestamp: '10:05', icon: Navigation, color: 'text-[#3B82F6]', bgColor: 'bg-[#DBEAFE]' },
  { id: 6, tipo: 'Spedizione Creata', descrizione: 'SH-2026-0843 - Nuova spedizione registrata', timestamp: '09:30', icon: Package, color: 'text-[#6B7280]', bgColor: 'bg-[#F3F4F6]' },
  { id: 7, tipo: 'Consegnata', descrizione: 'SH-2026-0835 - Consegna completata a Parma', timestamp: '08:42', icon: CheckCircle, color: 'text-[#22C55E]', bgColor: 'bg-[#DCFCE7]' },
];

export function LogisticsTimeline() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
      <h3 className="font-semibold text-[#2D2D2D] mb-5">Timeline Eventi Logistici</h3>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-[#E5EAF2]" />

        {/* Events */}
        <div className="space-y-4">
          {events.map((event, idx) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="relative flex items-start gap-4 group">
                {/* Icon */}
                <div className={`relative z-10 w-12 h-12 ${event.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${event.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-[#2D2D2D]">{event.tipo}</p>
                    <span className="text-xs text-[#9CA3AF]">{event.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#6B7280]">{event.descrizione}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
