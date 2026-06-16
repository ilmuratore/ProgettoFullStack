import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { ordiniApi } from '../../../api/ordiniApi';
import type { OrdineVendita, StatoOrdineVendita } from '../../../types/ordini';
import type { Spedizione } from '../../../types/spedizioni';
import { SortableHeader } from '../../../components/shared/SortableHeader';
import { applySort, compareDate, compareNumber, compareText, toggleSort, type SortConfig } from '../../../utils/sorting';
import { FilterButton, FilterPanel } from '../../../components/ui/FilterPanel';

const STATO_ORDINE_OPTIONS: { value: StatoOrdineVendita; label: string }[] = [
  { value: 'BOZZA', label: 'Bozza' },
  { value: 'CONFERMATO', label: 'Confermato' },
  { value: 'SPEDITO', label: 'Consegnato' },
  { value: 'ANNULLATO', label: 'Annullato' },
];

type SortKey = 'id' | 'cliente' | 'data_ordine' | 'destinazione' | 'importo_totale' | 'stato' | 'utente' | 'updated_at';

const compareOrdersByKey = (left: OrdineVendita, right: OrdineVendita, key: SortKey) => {
  switch (key) {
    case 'id':
      return compareNumber(left.id, right.id);
    case 'cliente':
      return compareText(left.cliente ?? '', right.cliente ?? '');
    case 'data_ordine':
      return compareDate(left.data_ordine, right.data_ordine);
    case 'destinazione':
      return compareText(left.destinazione ?? '', right.destinazione ?? '');
    case 'importo_totale':
      return compareNumber(left.importo_totale, right.importo_totale);
    case 'stato':
      return compareText(left.stato ?? '', right.stato ?? '');
    case 'utente':
      return compareText(left.utente ?? '', right.utente ?? '');
    case 'updated_at':
      return compareDate(left.updated_at, right.updated_at);
    default:
      return 0;
  }
};

const getOrderStatusBadge = (status: StatoOrdineVendita) => {
  switch (status) {
    case 'BOZZA': return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Bozza' };
    case 'CONFERMATO': return { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]', label: 'Confermato' };
    case 'SPEDITO': return { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', label: 'Consegnato' };
    case 'ANNULLATO': return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Annullato' };
  }
};

const getPickingStatusBadge = (status: OrdineVendita['stato_picking']) => {
  switch (status) {
    case 'NON_AVVIATO': return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Non avviato' };
    case 'IN_PICKING': return { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', label: 'In preparazione' };
    case 'PICKING_COMPLETATO': return { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', label: 'Preparato' };
    default: return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: '-' };
  }
};

const getShippingStatusBadge = (shipment: Spedizione | null | undefined) => {
  if (!shipment) return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Non assegnata' };
  switch (shipment.stato) {
    case 'IN_PREPARAZIONE': return { bg: 'bg-[#E2E8F0]', text: 'text-[#64748B]', label: 'In preparazione' };
    case 'SPEDITA': return { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]', label: 'Spedita' };
    case 'CONSEGNATA': return { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', label: 'Consegnata' };
    case 'PROBLEMA': return { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', label: 'Problema' };
    default: return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: '-' };
  }
};

const fmtData = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleDateString('it-IT') : '-';

const fmtDateTime = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';

const fmtEuro = (n: number | null | undefined): string =>
  `EUR ${Number(n ?? 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface SalesOrdersTableProps {
  onOrderClick: (orderId: number) => void;
  reloadKey?: number;
  shipmentsByOrderId?: Record<number, Spedizione | null>;
}

export function SalesOrdersTable({ onOrderClick, reloadKey, shipmentsByOrderId = {} }: SalesOrdersTableProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('tutti');
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<OrdineVendita[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortConfig<SortKey> | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const handleSort = (key: SortKey) => setSort((prev) => toggleSort(prev, key));
  const activeFiltersCount = filterStatus !== 'tutti' ? 1 : 0;
  const resetFilters = () => { setFilterStatus('tutti'); };

  useEffect(() => {
    const cliente = searchParams.get('cliente');
    if (cliente) setSearch(cliente);
    const stato = searchParams.get('stato');
    if (stato) setFilterStatus(stato);
  }, [searchParams]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    ordiniApi
      .list({
        ...(filterStatus !== 'tutti' ? { stato: filterStatus as StatoOrdineVendita } : {}),
      })
      .then((data) => { if (alive) setOrders(Array.isArray(data) ? data : []); })
      .catch((err: any) => toast.error('Errore caricamento ordini', { description: err?.message }))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [filterStatus, reloadKey]);

  const filtered = applySort(
    orders.filter((order) => {
      const term = search.toLowerCase();
      return (
        `so-${String(order.id).padStart(4, '0')}`.toLowerCase().includes(term) ||
        (order.cliente ?? '').toLowerCase().includes(term)
      );
    }),
    sort,
    compareOrdersByKey
  );

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[#2D2D2D]">Ordini di Vendita</h3>
      </div>

      <div className="mb-4">
        <FilterPanel
          open={filtersOpen}
          activeFiltersCount={activeFiltersCount}
          onToggleOpen={() => setFiltersOpen((open) => !open)}
          onReset={resetFilters}
          filterGroups={(
            <div>
              <p className="text-sm font-medium text-[#2D2D2D] mb-2">Stato Ordine</p>
              <div className="flex flex-wrap gap-2">
                <FilterButton label="Tutti" active={filterStatus === 'tutti'} onClick={() => setFilterStatus('tutti')} />
                {STATO_ORDINE_OPTIONS.map((option) => (
                  <FilterButton key={option.value} label={option.label} active={filterStatus === option.value} onClick={() => setFilterStatus(option.value)} />
                ))}
              </div>
            </div>
          )}
        >
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca ordine o cliente..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full h-9 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
            />
          </div>
        </FilterPanel>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              <SortableHeader label="N° Ordine" sortKey="id" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#6B7280] whitespace-nowrap" />
              <SortableHeader label="Cliente" sortKey="cliente" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#6B7280] whitespace-nowrap" />
              <SortableHeader label="Data" sortKey="data_ordine" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#6B7280] whitespace-nowrap" />
              <SortableHeader label="Destinazione" sortKey="destinazione" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#6B7280] whitespace-nowrap" />
              <SortableHeader label="Importo" sortKey="importo_totale" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#6B7280] whitespace-nowrap" />
              <SortableHeader label="Stato Ordine" sortKey="stato" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#6B7280] whitespace-nowrap" />
              <th className="text-left py-3 px-3 text-xs font-medium text-[#6B7280] whitespace-nowrap">Preparazione</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#6B7280] whitespace-nowrap">Spedizione</th>
              <SortableHeader label="Responsabile" sortKey="utente" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#6B7280] whitespace-nowrap" />
              <SortableHeader label="Agg." sortKey="updated_at" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#6B7280] whitespace-nowrap" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-sm text-[#6B7280]">Caricamento ordini...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-sm text-[#6B7280]">
                  {search || activeFiltersCount > 0 ? 'Nessun ordine corrisponde alla ricerca' : 'Nessun ordine di vendita.'}
                </td>
              </tr>
            ) : paginated.map((order) => {
              const orderBadge = getOrderStatusBadge(order.stato);
              const pickingBadge = getPickingStatusBadge(order.stato_picking);
              const shipmentBadge = getShippingStatusBadge(shipmentsByOrderId[order.id]);
              return (
                <tr
                  key={order.id}
                  className="border-b border-[#F3F4F6] hover:bg-[#F7F9FC] transition-colors group cursor-pointer"
                  onClick={() => onOrderClick(order.id)}
                >
                  <td className="py-3.5 px-3">
                    <span className="font-medium text-[#17E88F] text-sm">{`SO-${String(order.id).padStart(4, '0')}`}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#2D2D2D] font-medium whitespace-nowrap">{order.cliente ?? '-'}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#6B7280] whitespace-nowrap">{fmtData(order.data_ordine)}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#6B7280] whitespace-nowrap">{order.destinazione ?? '-'}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm font-semibold text-[#2D2D2D] whitespace-nowrap">{fmtEuro(order.importo_totale)}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${orderBadge.bg} ${orderBadge.text} whitespace-nowrap`}>
                      {orderBadge.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${pickingBadge.bg} ${pickingBadge.text} whitespace-nowrap`}>
                      {pickingBadge.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${shipmentBadge.bg} ${shipmentBadge.text} whitespace-nowrap`}>
                      {shipmentBadge.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#6B7280] whitespace-nowrap">{order.utente ?? '-'}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-xs text-[#9CA3AF] whitespace-nowrap">{fmtDateTime(order.updated_at)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-[#9CA3AF]">
        <span><span className="font-medium text-[#2D2D2D]">{paginated.length}</span> di <span className="font-medium text-[#2D2D2D]">{filtered.length}</span> ordini trovati</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Precedente
          </button>
          <span className="px-3 py-1.5 bg-[#17E88F]/10 text-[#17E88F] rounded-lg font-medium">{currentPage}</span>
          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Successivo
          </button>
        </div>
      </div>
    </div>
  );
}
