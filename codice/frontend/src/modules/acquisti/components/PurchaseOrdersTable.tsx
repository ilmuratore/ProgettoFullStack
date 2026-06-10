import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search, Filter, ArrowUpDown, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { acquistiApi } from '../../../api/acquistiApi';
import type { OrdineAcquistoLista, StatoOrdineAcquisto } from '../../../types/acquisti';

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

  useEffect(() => {
    const fornitore = searchParams.get('fornitore');
    if (fornitore) setSearch(fornitore);
  }, [searchParams]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    acquistiApi
      .list()
      .then((data) => { if (alive) setOrders(data); })
      .catch((err: any) => toast.error('Errore caricamento ordini', { description: err?.message }))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [reloadKey]);

  const filtered = orders.filter(o =>
    String(o.id).includes(search.toLowerCase()) ||
    (o.fornitore ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[#2D2D2D]">Ordini di Acquisto</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca ordine o fornitore..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64 h-9 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
            />
          </div>
          <button className="px-3 py-2 bg-[#F7F9FC] border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-white transition-all flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4" />
            Filtri
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-[#E5EAF2]">
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  ID Ordine
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  Fornitore
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Data Creazione</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Data Prevista</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Importo Totale</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Stato</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Prodotti</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Responsabile</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="py-8 text-center text-sm text-[#6B7280]">Caricamento ordini...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="py-8 text-center text-sm text-[#6B7280]">Nessun ordine di acquisto.</td></tr>
            ) : filtered.map((order, index) => {
              const badge = getStatusBadge(order.stato);
              return (
                <tr
                  key={order.id}
                  className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
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
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onOrderClick(order.id)}
                      className="p-1.5 hover:bg-[#DBEAFE] text-[#3B82F6] rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
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
