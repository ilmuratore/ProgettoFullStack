import { ExternalLink, Truck } from 'lucide-react';

type ShipmentStatus = 'IN_PREPARAZIONE' | 'SPEDITA' | 'CONSEGNATA' | 'PROBLEMA';

interface Shipment {
  id: string;
  ordine: string;
  cliente: string;
  corriere: string;
  dataSpedizione: string;
  stato: ShipmentStatus;
  tracking: string;
  destinazione: string;
}

const shipments: Shipment[] = [
  { id: 'SH-2026-041', ordine: 'SO-2026-001', cliente: 'Ferrero S.p.A.', corriere: 'DHL Express', dataSpedizione: '04/06/2026', stato: 'IN_PREPARAZIONE', tracking: 'DHL1234567890', destinazione: 'Torino, TO' },
  { id: 'SH-2026-040', ordine: 'SO-2026-009', cliente: 'Star S.p.A.', corriere: 'GLS Italy', dataSpedizione: '03/06/2026', stato: 'SPEDITA', tracking: 'GLS9876543210', destinazione: 'Agrate Brianza, MB' },
  { id: 'SH-2026-039', ordine: 'SO-2026-010', cliente: 'Mutti S.p.A.', corriere: 'BRT Corriere', dataSpedizione: '03/06/2026', stato: 'CONSEGNATA', tracking: 'BRT5544332211', destinazione: 'Montechiarugolo, PR' },
  { id: 'SH-2026-038', ordine: 'SO-2026-002', cliente: 'Barilla Group S.p.A.', corriere: 'FedEx Italy', dataSpedizione: '02/06/2026', stato: 'CONSEGNATA', tracking: 'FDX1122334455', destinazione: 'Parma, PR' },
  { id: 'SH-2026-037', ordine: 'SO-2026-004', cliente: 'Illy Caffè S.p.A.', corriere: 'DHL Express', dataSpedizione: '01/06/2026', stato: 'CONSEGNATA', tracking: 'DHL9988776655', destinazione: 'Trieste, TS' },
  { id: 'SH-2026-035', ordine: 'SO-2026-007', cliente: 'Riso Gallo S.p.A.', corriere: 'GLS Italy', dataSpedizione: '30/05/2026', stato: 'PROBLEMA', tracking: 'GLS1357924680', destinazione: 'Robbio, PV' },
];

const getShipmentBadge = (status: ShipmentStatus) => {
  switch (status) {
    case 'IN_PREPARAZIONE': return { bg: 'bg-[#EDE9FE]', text: 'text-[#8B5CF6]', label: 'In Preparazione' };
    case 'SPEDITA': return { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]', label: 'Spedita' };
    case 'CONSEGNATA': return { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', label: 'Consegnata' };
    case 'PROBLEMA': return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Problema' };
  }
};

export function SalesShipments() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#3B82F6]" />
          <h3 className="font-semibold text-[#2D2D2D]">Spedizioni Ordini</h3>
        </div>
        <span className="text-xs text-[#9CA3AF]">{shipments.length} spedizioni recenti</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              {['N° Spedizione', 'Ordine', 'Cliente', 'Corriere', 'Data Spedizione', 'Stato', 'Tracking', 'Destinazione'].map((col, i) => (
                <th key={i} className="text-left py-3 px-3 text-xs font-medium text-[#6B7280] whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => {
              const badge = getShipmentBadge(s.stato);
              return (
                <tr key={s.id} className="border-b border-[#F3F4F6] hover:bg-[#F7F9FC] transition-colors cursor-pointer">
                  <td className="py-3.5 px-3">
                    <span className="text-sm font-medium text-[#17E88F]">{s.id}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#6B7280]">{s.ordine}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm font-medium text-[#2D2D2D] whitespace-nowrap">{s.cliente}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#6B7280] whitespace-nowrap">{s.corriere}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#6B7280] whitespace-nowrap">{s.dataSpedizione}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text} whitespace-nowrap`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <button className="flex items-center gap-1.5 text-xs text-[#3B82F6] hover:text-[#2563EB] transition-colors">
                      {s.tracking}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#6B7280] whitespace-nowrap">{s.destinazione}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
