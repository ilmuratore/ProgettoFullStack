import { Calendar, MapPin, Package } from 'lucide-react';

const deliveries = [
  { cliente: 'Ferrero S.p.A.', ordine: 'SO-2026-0156', spedizione: 'SH-2026-0842', corriere: 'BRT', dataPrevista: '04/06/2026', fasciaOraria: '09:00 - 13:00', indirizzo: 'Via Eugenio Ferrero 1, Torino', stato: 'CONFERMATA', priorita: 'Alta' },
  { cliente: 'Barilla Group', ordine: 'SO-2026-0155', spedizione: 'SH-2026-0841', corriere: 'SDA', dataPrevista: '04/06/2026', fasciaOraria: '14:00 - 18:00', indirizzo: 'Via Mantova 166, Parma', stato: 'CONFERMATA', priorita: 'Media' },
  { cliente: 'Lavazza S.p.A.', ordine: 'SO-2026-0154', spedizione: 'SH-2026-0840', corriere: 'GLS', dataPrevista: '05/06/2026', fasciaOraria: '09:00 - 13:00', indirizzo: 'Corso Novara 59, Torino', stato: 'DA_CONFERMARE', priorita: 'Alta' },
  { cliente: 'Mutti S.p.A.', ordine: 'SO-2026-0153', spedizione: 'SH-2026-0839', corriere: 'TNT', dataPrevista: '05/06/2026', fasciaOraria: '10:00 - 14:00', indirizzo: 'Via Traversante 106, Montechiarugolo', stato: 'CONFERMATA', priorita: 'Bassa' },
  { cliente: 'Illy Caffè', ordine: 'SO-2026-0152', spedizione: 'SH-2026-0838', corriere: 'Bartolini', dataPrevista: '06/06/2026', fasciaOraria: '15:00 - 19:00', indirizzo: 'Via Flavia 110, Trieste', stato: 'RIPROGRAMMATA', priorita: 'Alta' },
];

const getPriorityBadge = (priorita: string) => {
  const styles = {
    Alta: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
    Media: 'bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]',
    Bassa: 'bg-[#DBEAFE] text-[#3B82F6] border-[#BFDBFE]',
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${styles[priorita as keyof typeof styles]}`}>
      {priorita}
    </span>
  );
};

const getStatusBadge = (stato: string) => {
  const styles = {
    CONFERMATA: 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]',
    DA_CONFERMARE: 'bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]',
    RIPROGRAMMATA: 'bg-[#DBEAFE] text-[#3B82F6] border-[#BFDBFE]',
  };
  const labels = {
    CONFERMATA: 'Confermata',
    DA_CONFERMARE: 'Da Confermare',
    RIPROGRAMMATA: 'Riprogrammata',
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${styles[stato as keyof typeof styles]}`}>
      {labels[stato as keyof typeof labels]}
    </span>
  );
};

export function ScheduledDeliveries() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[#2D2D2D]">Consegne Programmate</h3>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#6B7280]" />
          <span className="text-sm text-[#6B7280]">{deliveries.length} consegne previste</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Cliente</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Ordine</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Spedizione</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Corriere</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Data Prevista</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Fascia Oraria</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Indirizzo</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Stato</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Priorità</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery, idx) => (
              <tr key={idx} className="border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors">
                <td className="py-4 px-3">
                  <span className="text-sm font-medium text-[#2D2D2D]">{delivery.cliente}</span>
                </td>
                <td className="py-4 px-3">
                  <span className="text-sm text-[#6B7280]">{delivery.ordine}</span>
                </td>
                <td className="py-4 px-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span className="text-sm text-[#2D2D2D]">{delivery.spedizione}</span>
                  </div>
                </td>
                <td className="py-4 px-3">
                  <span className="text-sm text-[#6B7280]">{delivery.corriere}</span>
                </td>
                <td className="py-4 px-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span className="text-sm text-[#2D2D2D]">{delivery.dataPrevista}</span>
                  </div>
                </td>
                <td className="py-4 px-3">
                  <span className="text-sm text-[#6B7280]">{delivery.fasciaOraria}</span>
                </td>
                <td className="py-4 px-3">
                  <div className="flex items-center gap-1.5 max-w-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] flex-shrink-0" />
                    <span className="text-sm text-[#6B7280] truncate">{delivery.indirizzo}</span>
                  </div>
                </td>
                <td className="py-4 px-3">{getStatusBadge(delivery.stato)}</td>
                <td className="py-4 px-3">{getPriorityBadge(delivery.priorita)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
