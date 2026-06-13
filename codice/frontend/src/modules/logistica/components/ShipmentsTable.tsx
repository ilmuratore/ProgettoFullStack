import { Search, Filter, ArrowUpDown, Package, MapPin } from 'lucide-react';
import { useState } from 'react';
import type { Spedizione, StatoSpedizione } from '../../../types/spedizioni';
import { SortableHeader } from '../../../components/shared/SortableHeader';
import { applySort, compareDate, compareNumber, compareText, toggleSort, type SortConfig } from '../../../utils/sorting';

type SortKey = 'id' | 'tracking_number' | 'ordine_id' | 'cliente' | 'corriere' | 'created_at' | 'stato' | 'destinazione' | 'updated_at';

const compareShipmentsByKey = (left: Spedizione, right: Spedizione, key: SortKey) => {
  switch (key) {
    case 'id':
      return compareNumber(left.id, right.id);
    case 'tracking_number':
      return compareText(left.tracking_number ?? '', right.tracking_number ?? '');
    case 'ordine_id':
      return compareNumber(left.ordine_id, right.ordine_id);
    case 'cliente':
      return compareText(left.cliente ?? '', right.cliente ?? '');
    case 'corriere':
      return compareText(left.corriere ?? '', right.corriere ?? '');
    case 'created_at':
      return compareDate(left.created_at, right.created_at);
    case 'stato':
      return compareText(left.stato ?? '', right.stato ?? '');
    case 'destinazione':
      return compareText(left.destinazione ?? '', right.destinazione ?? '');
    case 'updated_at':
      return compareDate(left.updated_at, right.updated_at);
    default:
      return 0;
  }
};

interface ShipmentsTableProps {
  onShipmentClick: (id: number) => void;
  shipments: Spedizione[];
  loading: boolean;
}

const getStatusBadge = (stato: StatoSpedizione) => {
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
    <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${styles[stato]}`}>
      {labels[stato]}
    </span>
  );
};

const fmtDate = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleDateString('it-IT') : '-';

const fmtDateTime = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';

export function ShipmentsTable({ onShipmentClick, shipments, loading }: ShipmentsTableProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortConfig<SortKey> | null>(null);

  const handleSort = (key: SortKey) => setSort((prev) => toggleSort(prev, key));

  const filtered = applySort(
    shipments.filter((ship) => {
      const term = search.toLowerCase();
      const label = `SH-${String(ship.id).padStart(4, '0')}`.toLowerCase();
      return (
        label.includes(term) ||
        (ship.tracking_number ?? '').toLowerCase().includes(term) ||
        (ship.cliente ?? '').toLowerCase().includes(term)
      );
    }),
    sort,
    compareShipmentsByKey
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              <SortableHeader label="Numero Spedizione" sortKey="id" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Tracking" sortKey="tracking_number" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Ordine Cliente" sortKey="ordine_id" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Cliente" sortKey="cliente" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Corriere" sortKey="corriere" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Data Partenza" sortKey="created_at" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Data Prevista</th>
              <SortableHeader label="Stato" sortKey="stato" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Destinazione" sortKey="destinazione" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Ultimo Agg." sortKey="updated_at" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="py-8 text-center text-sm text-[#6B7280]">Caricamento spedizioni...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={10} className="py-8 text-center text-sm text-[#6B7280]">Nessuna spedizione disponibile.</td></tr>
            ) : filtered.map((ship) => {
              const label = `SH-${String(ship.id).padStart(4, '0')}`;
              const ordineLabel = `SO-${String(ship.ordine_id).padStart(4, '0')}`;
              return (
                <tr
                  key={ship.id}
                  className="border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                  onClick={() => onShipmentClick(ship.id)}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#3B82F6]" />
                      <span className="text-sm font-medium text-[#2D2D2D]">{label}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-mono text-[#6B7280]">{ship.tracking_number ?? '-'}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-sm text-[#2D2D2D]">{ordineLabel}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-sm text-[#2D2D2D]">{ship.cliente}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-sm font-medium text-[#6B7280]">{ship.corriere ?? '-'}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-sm text-[#6B7280]">{fmtDate(ship.created_at)}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-sm text-[#6B7280]">-</span>
                  </td>
                  <td className="py-3 px-3">{getStatusBadge(ship.stato)}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      <span className="text-sm text-[#6B7280]">{ship.destinazione ?? '-'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs text-[#9CA3AF]">{fmtDateTime(ship.updated_at)}</span>
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
