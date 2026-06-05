import { useState } from 'react';
import { Search, Filter, ArrowUpDown, Eye, ChevronDown } from 'lucide-react';

type OrderStatus = 'BOZZA' | 'CONFERMATO' | 'SPEDITO' | 'ANNULLATO';
type PickingStatus = 'NON_AVVIATO' | 'IN_PICKING' | 'PICKING_COMPLETATO';

interface SalesOrder {
  id: string;
  cliente: string;
  dataOrdine: string;
  destinazione: string;
  importo: string;
  statoOrdine: OrderStatus;
  statoPicking: PickingStatus;
  spedizione: string;
  responsabile: string;
  ultimoAggiornamento: string;
}

const orders: SalesOrder[] = [
  { id: 'SO-2026-001', cliente: 'Ferrero S.p.A.', dataOrdine: '28/05/2026', destinazione: 'Torino, TO', importo: '€ 48.750', statoOrdine: 'CONFERMATO', statoPicking: 'PICKING_COMPLETATO', spedizione: 'SH-2026-041', responsabile: 'Laura Verdi', ultimoAggiornamento: '03/06 14:22' },
  { id: 'SO-2026-002', cliente: 'Barilla Group S.p.A.', dataOrdine: '29/05/2026', destinazione: 'Parma, PR', importo: '€ 32.100', statoOrdine: 'SPEDITO', statoPicking: 'PICKING_COMPLETATO', spedizione: 'SH-2026-038', responsabile: 'Marco Ferrari', ultimoAggiornamento: '03/06 11:15' },
  { id: 'SO-2026-003', cliente: 'Lavazza S.p.A.', dataOrdine: '30/05/2026', destinazione: 'Torino, TO', importo: '€ 21.500', statoOrdine: 'CONFERMATO', statoPicking: 'IN_PICKING', spedizione: '—', responsabile: 'Sofia Romano', ultimoAggiornamento: '03/06 16:45' },
  { id: 'SO-2026-004', cliente: 'Illy Caffè S.p.A.', dataOrdine: '25/05/2026', destinazione: 'Trieste, TS', importo: '€ 15.670', statoOrdine: 'SPEDITO', statoPicking: 'PICKING_COMPLETATO', spedizione: 'SH-2026-035', responsabile: 'Andrea Ricci', ultimoAggiornamento: '01/06 09:30' },
  { id: 'SO-2026-005', cliente: 'De Cecco S.p.A.', dataOrdine: '01/06/2026', destinazione: 'Pescara, PE', importo: '€ 28.900', statoOrdine: 'CONFERMATO', statoPicking: 'NON_AVVIATO', spedizione: '—', responsabile: 'Chiara Colombo', ultimoAggiornamento: '03/06 08:50' },
  { id: 'SO-2026-006', cliente: 'Galbani S.p.A.', dataOrdine: '02/06/2026', destinazione: 'Milano, MI', importo: '€ 67.200', statoOrdine: 'CONFERMATO', statoPicking: 'IN_PICKING', spedizione: '—', responsabile: 'Francesco Marino', ultimoAggiornamento: '03/06 13:10' },
  { id: 'SO-2026-007', cliente: 'Riso Gallo S.p.A.', dataOrdine: '03/06/2026', destinazione: 'Robbio, PV', importo: '€ 19.875', statoOrdine: 'BOZZA', statoPicking: 'NON_AVVIATO', spedizione: '—', responsabile: 'Elena Greco', ultimoAggiornamento: '03/06 15:30' },
  { id: 'SO-2026-008', cliente: 'Divella S.p.A.', dataOrdine: '22/05/2026', destinazione: 'Rutigliano, BA', importo: '€ 11.340', statoOrdine: 'ANNULLATO', statoPicking: 'NON_AVVIATO', spedizione: '—', responsabile: 'Luca Bruno', ultimoAggiornamento: '28/05 10:20' },
  { id: 'SO-2026-009', cliente: 'Star S.p.A.', dataOrdine: '27/05/2026', destinazione: 'Agrate Brianza, MB', importo: '€ 36.920', statoOrdine: 'CONFERMATO', statoPicking: 'PICKING_COMPLETATO', spedizione: 'SH-2026-040', responsabile: 'Giulia Gallo', ultimoAggiornamento: '03/06 12:05' },
  { id: 'SO-2026-010', cliente: 'Mutti S.p.A.', dataOrdine: '26/05/2026', destinazione: 'Montechiarugolo, PR', importo: '€ 24.450', statoOrdine: 'SPEDITO', statoPicking: 'PICKING_COMPLETATO', spedizione: 'SH-2026-039', responsabile: 'Roberto Costa', ultimoAggiornamento: '03/06 10:15' },
];

const getOrderStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'BOZZA': return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Bozza' };
    case 'CONFERMATO': return { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]', label: 'Confermato' };
    case 'SPEDITO': return { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', label: 'Spedito' };
    case 'ANNULLATO': return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Annullato' };
  }
};

const getPickingBadge = (status: PickingStatus) => {
  switch (status) {
    case 'NON_AVVIATO': return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Non Avviato' };
    case 'IN_PICKING': return { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]', label: 'In Picking' };
    case 'PICKING_COMPLETATO': return { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', label: 'Completato' };
  }
};

interface SalesOrdersTableProps {
  onOrderClick: (orderId: string) => void;
}

export function SalesOrdersTable({ onOrderClick }: SalesOrdersTableProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('tutti');

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.cliente.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'tutti' || o.statoOrdine === filterStatus;
    return matchSearch && matchStatus;
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
              onChange={e => setSearch(e.target.value)}
              className="w-56 h-9 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
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
          <button className="px-3 py-2 bg-[#F7F9FC] border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-white transition-all flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4" />
            Filtri
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              {['N° Ordine', 'Cliente', 'Data', 'Destinazione', 'Importo', 'Stato Ordine', 'Picking', 'Spedizione', 'Responsabile', 'Agg.', ''].map((col, i) => (
                <th key={i} className="text-left py-3 px-3 text-xs font-medium text-[#6B7280] whitespace-nowrap">
                  {col && (
                    <button className="flex items-center gap-1 hover:text-[#2D2D2D] transition-colors">
                      {col}
                      {col !== '' && <ArrowUpDown className="w-3 h-3 opacity-50" />}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const orderBadge = getOrderStatusBadge(order.statoOrdine);
              const pickingBadge = getPickingBadge(order.statoPicking);
              return (
                <tr
                  key={order.id}
                  className="border-b border-[#F3F4F6] hover:bg-[#F7F9FC] transition-colors group cursor-pointer"
                  onClick={() => onOrderClick(order.id)}
                >
                  <td className="py-3.5 px-3">
                    <span className="font-medium text-[#17E88F] text-sm">{order.id}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#2D2D2D] font-medium whitespace-nowrap">{order.cliente}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#6B7280] whitespace-nowrap">{order.dataOrdine}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#6B7280] whitespace-nowrap">{order.destinazione}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm font-semibold text-[#2D2D2D] whitespace-nowrap">{order.importo}</span>
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
                    <span className="text-sm text-[#6B7280]">{order.spedizione}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm text-[#6B7280] whitespace-nowrap">{order.responsabile}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-xs text-[#9CA3AF] whitespace-nowrap">{order.ultimoAggiornamento}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <button
                      onClick={e => { e.stopPropagation(); onOrderClick(order.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-[#E5EAF2] rounded-lg"
                    >
                      <Eye className="w-4 h-4 text-[#6B7280]" />
                    </button>
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
