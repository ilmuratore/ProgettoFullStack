import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search, Filter, ArrowUpDown, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { ordiniApi } from '../../../api/ordiniApi';
import type { OrdineVendita, StatoOrdineVendita, StatoPickingVendita } from '../../../types/ordini';

const getOrderStatusBadge = (status: StatoOrdineVendita) => {
  switch (status) {
    case 'BOZZA': return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Bozza' };
    case 'CONFERMATO': return { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]', label: 'Confermato' };
    case 'SPEDITO': return { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', label: 'Spedito' };
    case 'ANNULLATO': return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Annullato' };
  }
};

const getPickingBadge = (status: StatoPickingVendita) => {
  switch (status) {
    case 'NON_AVVIATO': return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Non Avviato' };
    case 'IN_PICKING': return { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]', label: 'In Picking' };
    case 'PICKING_COMPLETATO': return { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', label: 'Completato' };
  }
};

const fmtData = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleDateString('it-IT') : '—';

const fmtDateTime = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';

const fmtEuro = (n: number | null | undefined): string =>
  `EUR ${Number(n ?? 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface SalesOrdersTableProps {
  onOrderClick: (orderId: number) => void;
  reloadKey?: number;
}

export function SalesOrdersTable({ onOrderClick, reloadKey }: SalesOrdersTableProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('tutti');
  const [filterPicking, setFilterPicking] = useState<string>('tutti');
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<OrdineVendita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cliente = searchParams.get('cliente');
    if (cliente) setSearch(cliente);
  }, [searchParams]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    ordiniApi
      .list({
        ...(filterStatus !== 'tutti' ? { stato: filterStatus as StatoOrdineVendita } : {}),
        ...(filterPicking !== 'tutti' ? { stato_picking: filterPicking as StatoPickingVendita } : {}),
      })
      .then((data) => { if (alive) setOrders(Array.isArray(data) ? data : []); })
      .catch((err: any) => toast.error('Errore caricamento ordini', { description: err?.message }))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [filterStatus, filterPicking, reloadKey]);

  const filtered = orders.filter((o) => {
    const term = search.toLowerCase();
    return (
      `so-${String(o.id).padStart(4, '0')}`.toLowerCase().includes(term) ||
      (o.cliente ?? '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[#2D2D2D]">Ordini di Vendita</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca ordine o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 h-9 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 pl-3 pr-8 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 text-sm text-[#6B7280] appearance-none cursor-pointer"
            >
              <option value="tutti">Tutti gli stati</option>
              <option value="BOZZA">Bozza</option>
              <option value="CONFERMATO">Confermato</option>
              <option value="SPEDITO">Spedito</option>
              <option value="ANNULLATO">Annullato</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#6B7280] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterPicking}
              onChange={(e) => setFilterPicking(e.target.value)}
              className="h-9 pl-3 pr-8 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 text-sm text-[#6B7280] appearance-none cursor-pointer"
            >
              <option value="tutti">Tutti i picking</option>
              <option value="NON_AVVIATO">Non Avviato</option>
              <option value="IN_PICKING">In Picking</option>
              <option value="PICKING_COMPLETATO">Completato</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#6B7280] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="px-3 py-2 bg-[#F7F9FC] border border-[#E5EAF2] text-[#6B7280] rounded-lg flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4" />
            Filtri
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              {['N° Ordine', 'Cliente', 'Data', 'Destinazione', 'Importo', 'Stato Ordine', 'Picking', 'Spedizione', 'Responsabile', 'Agg.'].map((col, i) => (
                <th key={i} className="text-left py-3 px-3 text-xs font-medium text-[#6B7280] whitespace-nowrap">
                  <button className="flex items-center gap-1 hover:text-[#2D2D2D] transition-colors">
                    {col}
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="py-8 text-center text-sm text-[#6B7280]">Caricamento ordini...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={10} className="py-8 text-center text-sm text-[#6B7280]">Nessun ordine di vendita.</td></tr>
            ) : filtered.map((order) => {
              const orderBadge = getOrderStatusBadge(order.stato);
              const pickingBadge = getPickingBadge(order.stato_picking);
              const orderLabel = `SO-${String(order.id).padStart(4, '0')}`;
              return (
                <tr
                  key={order.id}
                  className="border-b border-[#F3F4F6] hover:bg-[#F7F9FC] transition-colors group cursor-pointer"
                  onClick={() => onOrderClick(order.id)}
                >
                  <td className="py-3.5 px-3">
                    <span className="font-medium text-[#17E88F] text-sm">{orderLabel}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#2D2D2D] font-medium whitespace-nowrap">{order.cliente ?? '—'}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#6B7280] whitespace-nowrap">{fmtData(order.data_ordine)}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#6B7280] whitespace-nowrap">{order.destinazione ?? '—'}</span>
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
                    <span className="text-sm text-[#6B7280]">—</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#6B7280] whitespace-nowrap">{order.utente ?? '—'}</span>
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
        <span>{filtered.length} ordini trovati</span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg hover:bg-white transition-all">Precedente</button>
          <span className="px-3 py-1.5 bg-[#17E88F]/10 text-[#17E88F] rounded-lg font-medium">1</span>
          <button className="px-3 py-1.5 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg hover:bg-white transition-all">Successiva</button>
        </div>
      </div>
    </div>
  );
}
