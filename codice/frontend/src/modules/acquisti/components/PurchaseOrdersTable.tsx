import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { acquistiApi } from '../../../api/acquistiApi';
import type { OrdineAcquistoLista, StatoOrdineAcquisto } from '../../../types/acquisti';
import { SortableHeader } from '../../../components/shared/SortableHeader';
import { applySort, compareDate, compareNumber, compareText, toggleSort, type SortConfig } from '../../../utils/sorting';
import { FilterButton, FilterPanel } from '../../../components/ui/FilterPanel';

const STATO_OPTIONS: { value: StatoOrdineAcquisto; label: string }[] = [
  { value: 'BOZZA', label: 'Bozza' },
  { value: 'INVIATO', label: 'Inviato' },
  { value: 'CONFERMATO', label: 'Confermato' },
  { value: 'IN_RICEZIONE', label: 'In Ricezione' },
  { value: 'COMPLETATO', label: 'Completato' },
  { value: 'ANNULLATO', label: 'Annullato' },
];

type SortKey = 'id' | 'fornitore' | 'created_at' | 'data_prevista' | 'importo_totale' | 'stato' | 'numero_righe' | 'utente';

const compareOrdersByKey = (left: OrdineAcquistoLista, right: OrdineAcquistoLista, key: SortKey) => {
  switch (key) {
    case 'id':
      return compareNumber(left.id, right.id);
    case 'fornitore':
      return compareText(left.fornitore ?? '', right.fornitore ?? '');
    case 'created_at':
      return compareDate(left.created_at, right.created_at);
    case 'data_prevista':
      return compareDate(left.data_prevista, right.data_prevista);
    case 'importo_totale':
      return compareNumber(left.importo_totale, right.importo_totale);
    case 'stato':
      return compareText(left.stato ?? '', right.stato ?? '');
    case 'numero_righe':
      return compareNumber(left.numero_righe, right.numero_righe);
    case 'utente':
      return compareText(left.utente ?? '', right.utente ?? '');
    default:
      return 0;
  }
};

const getStatusBadge = (status: StatoOrdineAcquisto) => {
  switch (status) {
    case 'BOZZA':
      return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Bozza' };
    case 'INVIATO':
      return { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]', label: 'Inviato' };
    case 'CONFERMATO':
      return { bg: 'bg-[#EDE9FE]', text: 'text-[#8B5CF6]', label: 'Confermato' };
    case 'IN_RICEZIONE':
      return { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]', label: 'In Ricezione' };
    case 'COMPLETATO':
      return { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', label: 'Completato' };
    case 'ANNULLATO':
      return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Annullato' };
    default:
      return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: status };
  }
};

const fmtData = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString('it-IT') : '—';

const fmtEuro = (n: number): string =>
  `€ ${Number(n ?? 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface PurchaseOrdersTableProps {
  onOrderClick: (orderId: number) => void;
  reloadKey?: number;
}

export function PurchaseOrdersTable({ onOrderClick, reloadKey }: PurchaseOrdersTableProps) {
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<OrdineAcquistoLista[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortConfig<SortKey> | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('tutti');

  const handleSort = (key: SortKey) => setSort((prev) => toggleSort(prev, key));

  useEffect(() => {
    const fornitore = searchParams.get('fornitore');
    if (fornitore) setSearch(fornitore);
    const stato = searchParams.get('stato');
    if (stato) setFilterStatus(stato);
  }, [searchParams]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    acquistiApi
      .list({
        ...(filterStatus !== 'tutti' ? { stato: filterStatus as StatoOrdineAcquisto } : {}),
      })
      .then((data) => { if (alive) setOrders(Array.isArray(data) ? data : []); })
      .catch((err: any) => toast.error('Errore caricamento ordini', { description: err?.message }))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [filterStatus, reloadKey]);

  const activeFiltersCount = filterStatus !== 'tutti' ? 1 : 0;
  const resetFilters = () => setFilterStatus('tutti');

  const filtered = applySort(
    orders.filter(o =>
      String(o.id).includes(search.toLowerCase()) ||
      (o.fornitore ?? '').toLowerCase().includes(search.toLowerCase())
    ),
    sort,
    compareOrdersByKey
  );

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[#2D2D2D]">Ordini di Acquisto</h3>
      </div>

      <div className="mb-4">
        <FilterPanel
          open={filtersOpen}
          activeFiltersCount={activeFiltersCount}
          onToggleOpen={() => setFiltersOpen((o) => !o)}
          onReset={resetFilters}
          filterGroups={
            <div>
              <p className="text-sm font-medium text-[#2D2D2D] mb-2">Stato</p>
              <div className="flex flex-wrap gap-2">
                <FilterButton label="Tutti" active={filterStatus === 'tutti'} onClick={() => setFilterStatus('tutti')} />
                {STATO_OPTIONS.map((opt) => (
                  <FilterButton key={opt.value} label={opt.label} active={filterStatus === opt.value} onClick={() => setFilterStatus(opt.value)} />
                ))}
              </div>
            </div>
          }
        >
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca ordine o fornitore..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
            />
          </div>
        </FilterPanel>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-[#E5EAF2]">
              <SortableHeader label="ID Ordine" sortKey="id" sort={sort} onSort={handleSort} />
              <SortableHeader label="Fornitore" sortKey="fornitore" sort={sort} onSort={handleSort} />
              <SortableHeader label="Data Creazione" sortKey="created_at" sort={sort} onSort={handleSort} />
              <SortableHeader label="Data Prevista" sortKey="data_prevista" sort={sort} onSort={handleSort} />
              <SortableHeader label="Importo Totale" sortKey="importo_totale" sort={sort} onSort={handleSort} />
              <SortableHeader label="Stato" sortKey="stato" sort={sort} onSort={handleSort} />
              <SortableHeader label="Prodotti" sortKey="numero_righe" sort={sort} onSort={handleSort} />
              <SortableHeader label="Responsabile" sortKey="utente" sort={sort} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-8 text-center text-sm text-[#6B7280]">Caricamento ordini...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="py-8 text-center text-sm text-[#6B7280]">{search || activeFiltersCount > 0 ? 'Nessun ordine corrisponde alla ricerca' : 'Nessun ordine di acquisto.'}</td></tr>
            ) : filtered.map((order, index) => {
              const badge = getStatusBadge(order.stato);
              return (
                <tr
                  key={order.id}
                  onClick={() => onOrderClick(order.id)}
                  className={`cursor-pointer border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                  }`}
                >
                  <td className="py-3 px-4 text-sm font-mono text-[#2D2D2D] font-medium">OA-{String(order.id).padStart(4, '0')}</td>
                  <td className="py-3 px-4 text-sm text-[#2D2D2D]">{order.fornitore}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{fmtData(order.created_at)}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{fmtData(order.data_prevista)}</td>
                  <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{fmtEuro(order.importo_totale)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{order.numero_righe} items</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{order.utente ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E5EAF2]">
        <div className="text-sm text-[#6B7280]">
          Mostrando <span className="font-medium text-[#2D2D2D]">{filtered.length}</span> di{' '}
          <span className="font-medium text-[#2D2D2D]">{orders.length}</span> ordini
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all text-sm">
            Precedente
          </button>
          <button className="px-3 py-1.5 bg-[#17E88F] text-white rounded-lg font-medium text-sm">1</button>
          <button className="px-3 py-1.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all text-sm">
            Successivo
          </button>
        </div>
      </div>
    </div>
  );
}
