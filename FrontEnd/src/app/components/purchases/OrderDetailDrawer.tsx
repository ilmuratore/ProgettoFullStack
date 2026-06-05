import { X, FileText, Package, Clock, User, Building2, Calendar, MapPin } from 'lucide-react';

interface OrderDetailDrawerProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const orderDetails = {
  'PO-2026-001': {
    numero: 'PO-2026-001',
    stato: 'CONFERMATO',
    fornitore: 'Packaging Solutions Italia S.p.A.',
    dataPrevista: '05/06/2026',
    responsabile: 'Laura Verdi',
    dataCreazione: '28/05/2026',
    note: 'Ordine urgente per rifornimento magazzino zona A',
    prodotti: [
      { sku: 'ANG-CRT-067', prodotto: 'Angolare Cartone Protezione 50x50', qtaOrdinata: 500, qtaRicevuta: 0, prezzoUnit: '€ 0,45', totale: '€ 225,00' },
      { sku: 'BST-PLU-089', prodotto: 'Busta Pluriball 30x45cm', qtaOrdinata: 1000, qtaRicevuta: 0, prezzoUnit: '€ 0,38', totale: '€ 380,00' },
      { sku: 'FLM-EST-012', prodotto: 'Film Estensibile Trasparente 50cm', qtaOrdinata: 80, qtaRicevuta: 0, prezzoUnit: '€ 18,90', totale: '€ 1.512,00' },
    ],
    ricezioni: [],
  },
  'PO-2026-002': {
    numero: 'PO-2026-002',
    stato: 'IN_RICEZIONE',
    fornitore: 'Pallet Systems Europe S.p.A.',
    dataPrevista: '06/06/2026',
    responsabile: 'Marco Ferrari',
    dataCreazione: '29/05/2026',
    note: 'Ricezione parziale prevista',
    prodotti: [
      { sku: 'PLT-EUR-001', prodotto: 'Pallet Standard EUR 1200x800', qtaOrdinata: 200, qtaRicevuta: 150, prezzoUnit: '€ 12,50', totale: '€ 2.500,00' },
      { sku: 'PLT-PLA-003', prodotto: 'Pallet in Plastica 1200x1000', qtaOrdinata: 100, qtaRicevuta: 0, prezzoUnit: '€ 28,00', totale: '€ 2.800,00' },
    ],
    ricezioni: [
      { data: '03/06/2026 11:15', operatore: 'Giovanni Bianchi', qtaRicevuta: 150, ubicazione: 'A-01-05', note: 'Prima tranche consegna' },
    ],
  },
};

export function OrderDetailDrawer({ orderId, isOpen, onClose }: OrderDetailDrawerProps) {
  if (!isOpen || !orderId) return null;

  const order = orderDetails[orderId as keyof typeof orderDetails] || orderDetails['PO-2026-001'];

  const getStatusBadge = (status: string) => {
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

  const badge = getStatusBadge(order.stato);
  const totaleOrdine = order.prodotti.reduce((sum, p) => sum + parseFloat(p.totale.replace(/[€\s.]/g, '').replace(',', '.')), 0);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-white border-b border-[#E5EAF2] p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-[#2D2D2D] font-mono">{order.numero}</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-sm text-[#6B7280]">Dettaglio Ordine di Acquisto</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-[#F7F9FC] rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informazioni Generali */}
          <div className="bg-[#F7F9FC] rounded-2xl p-6">
            <h3 className="font-semibold text-[#2D2D2D] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#17E88F]" />
              Informazioni Generali
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                  <Building2 className="w-3 h-3" />
                  Fornitore
                </div>
                <div className="text-sm font-medium text-[#2D2D2D]">{order.fornitore}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                  <User className="w-3 h-3" />
                  Responsabile
                </div>
                <div className="text-sm font-medium text-[#2D2D2D]">{order.responsabile}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                  <Calendar className="w-3 h-3" />
                  Data Creazione
                </div>
                <div className="text-sm font-medium text-[#2D2D2D]">{order.dataCreazione}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                  <Clock className="w-3 h-3" />
                  Data Prevista
                </div>
                <div className="text-sm font-medium text-[#2D2D2D]">{order.dataPrevista}</div>
              </div>
            </div>
            {order.note && (
              <div className="mt-4 pt-4 border-t border-[#E5EAF2]">
                <div className="text-xs text-[#6B7280] mb-1">Note</div>
                <div className="text-sm text-[#2D2D2D]">{order.note}</div>
              </div>
            )}
          </div>

          {/* Prodotti Ordinati */}
          <div>
            <h3 className="font-semibold text-[#2D2D2D] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#17E88F]" />
              Prodotti Ordinati
            </h3>
            <div className="bg-white border border-[#E5EAF2] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F7F9FC]">
                  <tr className="border-b border-[#E5EAF2]">
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">SKU</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Prodotto</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Qta Ord.</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Qta Ric.</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Prezzo</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Totale</th>
                  </tr>
                </thead>
                <tbody>
                  {order.prodotti.map((prodotto, index) => (
                    <tr key={index} className="border-b border-[#E5EAF2] last:border-0">
                      <td className="py-3 px-4 text-xs font-mono text-[#6B7280]">{prodotto.sku}</td>
                      <td className="py-3 px-4 text-sm text-[#2D2D2D]">{prodotto.prodotto}</td>
                      <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{prodotto.qtaOrdinata}</td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium ${prodotto.qtaRicevuta > 0 ? 'text-[#22C55E]' : 'text-[#6B7280]'}`}>
                          {prodotto.qtaRicevuta}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#6B7280]">{prodotto.prezzoUnit}</td>
                      <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{prodotto.totale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-[#F7F9FC] px-4 py-3 flex items-center justify-between border-t border-[#E5EAF2]">
                <span className="font-medium text-[#2D2D2D]">Totale Ordine</span>
                <span className="text-xl font-semibold text-[#17E88F]">€ {totaleOrdine.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Storico Ricezioni */}
          {order.ricezioni && order.ricezioni.length > 0 && (
            <div>
              <h3 className="font-semibold text-[#2D2D2D] mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#17E88F]" />
                Storico Ricezioni
              </h3>
              <div className="space-y-3">
                {order.ricezioni.map((ricezione, index) => (
                  <div key={index} className="bg-[#F7F9FC] rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#17E88F] rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#2D2D2D]">{ricezione.data}</div>
                          <div className="text-xs text-[#6B7280]">{ricezione.operatore}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-[#22C55E]">+{ricezione.qtaRicevuta} unità</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <MapPin className="w-3 h-3" />
                      Ubicazione: <span className="font-mono text-[#2D2D2D]">{ricezione.ubicazione}</span>
                    </div>
                    {ricezione.note && (
                      <div className="mt-2 text-xs text-[#6B7280]">{ricezione.note}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
