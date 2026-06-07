import { useState } from 'react';
import { Search, Filter, ArrowUpDown, Eye, Package, MapPin } from 'lucide-react';

interface ShipmentsTableProps {
  onShipmentClick: (id: string) => void;
}

const shipments = [
  { id: 'SH-2026-0842', tracking: 'TRK84529301847', ordine: 'SO-2026-0156', cliente: 'Ferrero S.p.A.', corriere: 'BRT', dataPartenza: '02/06/2026', dataPrevista: '04/06/2026', stato: 'SPEDITA', destinazione: 'Torino, TO', ultimoAgg: '3h fa' },
  { id: 'SH-2026-0841', tracking: 'TRK84529301846', ordine: 'SO-2026-0155', cliente: 'Barilla Group', corriere: 'SDA', dataPartenza: '01/06/2026', dataPrevista: '04/06/2026', stato: 'SPEDITA', destinazione: 'Parma, PR', ultimoAgg: '5h fa' },
  { id: 'SH-2026-0840', tracking: 'TRK84529301845', ordine: 'SO-2026-0154', cliente: 'Lavazza S.p.A.', corriere: 'GLS', dataPartenza: '03/06/2026', dataPrevista: '05/06/2026', stato: 'IN_PREPARAZIONE', destinazione: 'Milano, MI', ultimoAgg: '1h fa' },
  { id: 'SH-2026-0839', tracking: 'TRK84529301844', ordine: 'SO-2026-0153', cliente: 'Mutti S.p.A.', corriere: 'TNT', dataPartenza: '01/06/2026', dataPrevista: '03/06/2026', stato: 'CONSEGNATA', destinazione: 'Parma, PR', ultimoAgg: '12h fa' },
  { id: 'SH-2026-0838', tracking: 'TRK84529301843', ordine: 'SO-2026-0152', cliente: 'Illy Caffè', corriere: 'Bartolini', dataPartenza: '02/06/2026', dataPrevista: '04/06/2026', stato: 'PROBLEMA', destinazione: 'Trieste, TS', ultimoAgg: '30min fa' },
  { id: 'SH-2026-0837', tracking: 'TRK84529301842', ordine: 'SO-2026-0151', cliente: 'Ferrero S.p.A.', corriere: 'BRT', dataPartenza: '03/06/2026', dataPrevista: '05/06/2026', stato: 'SPEDITA', destinazione: 'Roma, RM', ultimoAgg: '2h fa' },
  { id: 'SH-2026-0836', tracking: 'TRK84529301841', ordine: 'SO-2026-0150', cliente: 'Campari Group', corriere: 'SDA', dataPartenza: '02/06/2026', dataPrevista: '04/06/2026', stato: 'SPEDITA', destinazione: 'Milano, MI', ultimoAgg: '4h fa' },
  { id: 'SH-2026-0835', tracking: 'TRK84529301840', ordine: 'SO-2026-0149', cliente: 'Barilla Group', corriere: 'GLS', dataPartenza: '01/06/2026', dataPrevista: '03/06/2026', stato: 'CONSEGNATA', destinazione: 'Parma, PR', ultimoAgg: '8h fa' },
];

const getStatusBadge = (stato: string) => {
  const styles = {
    IN_PREPARAZIONE: 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]',
    SPEDITA: 'bg-[#DBEAFE] text-[#3B82F6] border-[#93C5FD]',
    CONSEGNATA: 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]',
    PROBLEMA: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
  };
  const labels = {
    IN_PREPARAZIONE: 'In Preparazione',
    SPEDITA: 'Spedita',
    CONSEGNATA: 'Consegnata',
    PROBLEMA: 'Problema',
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${styles[stato as keyof typeof styles]}`}>
      {labels[stato as keyof typeof labels]}
    </span>
  );
};

export function ShipmentsTable({ onShipmentClick }: ShipmentsTableProps) {
  const [search, setSearch] = useState('');

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[#2D2D2D]">Monitoraggio Spedizioni</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca spedizione o tracking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 w-64"
            />
          </div>
          <button className="h-9 px-3 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl hover:bg-white transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#6B7280]" />
            <span className="text-sm text-[#6B7280]">Filtri</span>
          </button>
          <button className="h-9 px-3 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl hover:bg-white transition-colors flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Numero Spedizione</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Tracking</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Ordine Cliente</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Cliente</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Corriere</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Data Partenza</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Data Prevista</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Stato</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Destinazione</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Ultimo Agg.</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((ship) => (
              <tr
                key={ship.id}
                className="border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                onClick={() => onShipmentClick(ship.id)}
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#3B82F6]" />
                    <span className="text-sm font-medium text-[#2D2D2D]">{ship.id}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="text-xs font-mono text-[#6B7280]">{ship.tracking}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-sm text-[#2D2D2D]">{ship.ordine}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-sm text-[#2D2D2D]">{ship.cliente}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-sm font-medium text-[#6B7280]">{ship.corriere}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-sm text-[#6B7280]">{ship.dataPartenza}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-sm text-[#6B7280]">{ship.dataPrevista}</span>
                </td>
                <td className="py-3 px-3">{getStatusBadge(ship.stato)}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span className="text-sm text-[#6B7280]">{ship.destinazione}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="text-xs text-[#9CA3AF]">{ship.ultimoAgg}</span>
                </td>
                <td className="py-3 px-3">
                  <button className="p-1.5 hover:bg-[#F7F9FC] rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-[#6B7280]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
