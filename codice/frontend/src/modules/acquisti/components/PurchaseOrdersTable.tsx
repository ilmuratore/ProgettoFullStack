import { Search, Filter, ArrowUpDown, Eye } from 'lucide-react';

type OrderStatus = 'BOZZA' | 'INVIATO' | 'CONFERMATO' | 'IN_RICEZIONE' | 'COMPLETATO' | 'ANNULLATO';

interface PurchaseOrder {
  id: string;
  fornitore: string;
  dataCreazione: string;
  dataPrevista: string;
  importoTotale: string;
  stato: OrderStatus;
  prodotti: number;
  responsabile: string;
  ultimoAggiornamento: string;
}

const orders: PurchaseOrder[] = [
  { id: 'PO-2026-001', fornitore: 'Packaging Solutions Italia S.p.A.', dataCreazione: '28/05/2026', dataPrevista: '05/06/2026', importoTotale: '€ 18.450', stato: 'CONFERMATO', prodotti: 8, responsabile: 'Laura Verdi', ultimoAggiornamento: '03/06 14:22' },
  { id: 'PO-2026-002', fornitore: 'Pallet Systems Europe S.p.A.', dataCreazione: '29/05/2026', dataPrevista: '06/06/2026', importoTotale: '€ 12.800', stato: 'IN_RICEZIONE', prodotti: 3, responsabile: 'Marco Ferrari', ultimoAggiornamento: '03/06 11:15' },
  { id: 'PO-2026-003', fornitore: 'Film Protezione Italia S.p.A.', dataCreazione: '30/05/2026', dataPrevista: '02/06/2026', importoTotale: '€ 8.920', stato: 'COMPLETATO', prodotti: 12, responsabile: 'Sofia Romano', ultimoAggiornamento: '02/06 16:45' },
  { id: 'PO-2026-004', fornitore: 'Etichette Professionali S.r.l.', dataCreazione: '25/05/2026', dataPrevista: '01/06/2026', importoTotale: '€ 5.670', stato: 'COMPLETATO', prodotti: 5, responsabile: 'Andrea Ricci', ultimoAggiornamento: '01/06 09:30' },
  { id: 'PO-2026-005', fornitore: 'Nastri & Reggette S.r.l.', dataCreazione: '01/06/2026', dataPrevista: '08/06/2026', importoTotale: '€ 14.230', stato: 'INVIATO', prodotti: 7, responsabile: 'Chiara Colombo', ultimoAggiornamento: '03/06 08:50' },
  { id: 'PO-2026-006', fornitore: 'Scatole Cartone Europa S.p.A.', dataCreazione: '02/06/2026', dataPrevista: '09/06/2026', importoTotale: '€ 21.500', stato: 'CONFERMATO', prodotti: 15, responsabile: 'Francesco Marino', ultimoAggiornamento: '03/06 13:10' },
  { id: 'PO-2026-007', fornitore: 'Materiali Logistica Pro S.r.l.', dataCreazione: '03/06/2026', dataPrevista: '10/06/2026', importoTotale: '€ 9.875', stato: 'BOZZA', prodotti: 4, responsabile: 'Elena Greco', ultimoAggiornamento: '03/06 15:30' },
  { id: 'PO-2026-008', fornitore: 'Protezione Merci S.r.l.', dataCreazione: '22/05/2026', dataPrevista: '30/05/2026', importoTotale: '€ 7.340', stato: 'ANNULLATO', prodotti: 6, responsabile: 'Luca Bruno', ultimoAggiornamento: '28/05 10:20' },
  { id: 'PO-2026-009', fornitore: 'Pallet Systems Europe S.p.A.', dataCreazione: '27/05/2026', dataPrevista: '04/06/2026', importoTotale: '€ 16.920', stato: 'IN_RICEZIONE', prodotti: 9, responsabile: 'Giulia Gallo', ultimoAggiornamento: '03/06 12:05' },
  { id: 'PO-2026-010', fornitore: 'Film Protezione Italia S.p.A.', dataCreazione: '26/05/2026', dataPrevista: '03/06/2026', importoTotale: '€ 11.450', stato: 'COMPLETATO', prodotti: 11, responsabile: 'Roberto Costa', ultimoAggiornamento: '03/06 10:15' },
];

const getStatusBadge = (status: OrderStatus) => {
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
  }
};

interface PurchaseOrdersTableProps {
  onOrderClick: (orderId: string) => void;
}

export function PurchaseOrdersTable({ onOrderClick }: PurchaseOrdersTableProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[#2D2D2D]">Ordini di Acquisto</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca ordine..."
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
            {orders.map((order, index) => {
              const badge = getStatusBadge(order.stato);
              return (
                <tr
                  key={order.id}
                  className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                  }`}
                >
                  <td className="py-3 px-4 text-sm font-mono text-[#2D2D2D] font-medium">{order.id}</td>
                  <td className="py-3 px-4 text-sm text-[#2D2D2D]">{order.fornitore}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{order.dataCreazione}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{order.dataPrevista}</td>
                  <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{order.importoTotale}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{order.prodotti} items</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{order.responsabile}</td>
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
          Mostrando <span className="font-medium text-[#2D2D2D]">{orders.length}</span> di{' '}
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
