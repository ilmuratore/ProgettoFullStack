import { X, CheckCircle, Clock, Package, Truck, MapPin, User, Calendar } from 'lucide-react';

interface SalesOrderDrawerProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const orderDetails: Record<string, any> = {
  'SO-2026-001': {
    id: 'SO-2026-001',
    cliente: 'Ferrero S.p.A.',
    dataOrdine: '28/05/2026',
    destinazione: 'Via Eugenio Ferrero 1, Torino TO 10023',
    stato: 'CONFERMATO',
    responsabile: 'Laura Verdi',
    importo: '€ 48.750',
    prodotti: [
      { sku: 'PKG-BOX-001', nome: 'Scatola Cartone 40x30x20', qty: 500, disponibilita: 1200, prezzoUnit: '€ 0,85', totale: '€ 425,00' },
      { sku: 'PKG-PAL-002', nome: 'Pallet Europeo 120x80', qty: 80, disponibilita: 220, prezzoUnit: '€ 12,50', totale: '€ 1.000,00' },
      { sku: 'PKG-STR-003', nome: 'Nastro Adesivo 50mm', qty: 200, disponibilita: 850, prezzoUnit: '€ 2,40', totale: '€ 480,00' },
      { sku: 'PKG-ETI-004', nome: 'Etichette Codice a Barre', qty: 2000, disponibilita: 8500, prezzoUnit: '€ 0,023', totale: '€ 46,00' },
    ],
    timeline: [
      { evento: 'Ordine Creato', data: '28/05/2026 09:15', completato: true },
      { evento: 'Ordine Confermato', data: '28/05/2026 11:30', completato: true },
      { evento: 'Picking Avviato', data: '02/06/2026 08:00', completato: true },
      { evento: 'Picking Completato', data: '03/06/2026 14:22', completato: true },
      { evento: 'Spedizione Creata', data: '04/06/2026 08:00', completato: false },
      { evento: 'Spedizione Consegnata', data: '—', completato: false },
    ],
  },
  'SO-2026-003': {
    id: 'SO-2026-003',
    cliente: 'Lavazza S.p.A.',
    dataOrdine: '30/05/2026',
    destinazione: 'Corso Novara 59, Torino TO 10154',
    stato: 'CONFERMATO',
    responsabile: 'Sofia Romano',
    importo: '€ 21.500',
    prodotti: [
      { sku: 'PKG-BOX-002', nome: 'Scatola Microonda 30x25x15', qty: 300, disponibilita: 600, prezzoUnit: '€ 1,20', totale: '€ 360,00' },
      { sku: 'PKG-FIL-001', nome: 'Film Estensibile 17 mic', qty: 50, disponibilita: 180, prezzoUnit: '€ 8,75', totale: '€ 437,50' },
    ],
    timeline: [
      { evento: 'Ordine Creato', data: '30/05/2026 10:00', completato: true },
      { evento: 'Ordine Confermato', data: '30/05/2026 14:15', completato: true },
      { evento: 'Picking Avviato', data: '03/06/2026 09:30', completato: true },
      { evento: 'Picking Completato', data: '—', completato: false },
      { evento: 'Spedizione Creata', data: '—', completato: false },
      { evento: 'Spedizione Consegnata', data: '—', completato: false },
    ],
  },
};

const fallbackOrder = {
  id: '',
  cliente: 'Cliente',
  dataOrdine: '—',
  destinazione: '—',
  stato: 'BOZZA',
  responsabile: '—',
  importo: '—',
  prodotti: [],
  timeline: [],
};

const getStatoBadge = (stato: string) => {
  switch (stato) {
    case 'BOZZA': return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Bozza' };
    case 'CONFERMATO': return { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]', label: 'Confermato' };
    case 'SPEDITO': return { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', label: 'Spedito' };
    case 'ANNULLATO': return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Annullato' };
    default: return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: stato };
  }
};

export function SalesOrderDrawer({ orderId, isOpen, onClose }: SalesOrderDrawerProps) {
  const order = orderId ? (orderDetails[orderId] || { ...fallbackOrder, id: orderId, cliente: orderId }) : fallbackOrder;
  const badge = getStatoBadge(order.stato);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      )}
      <div className={`fixed right-0 top-0 h-full w-[560px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5EAF2]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-[#2D2D2D]">{order.id}</h2>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1">{order.cliente}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F9FC] rounded-xl transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info Generali */}
          <div className="bg-[#F7F9FC] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#2D2D2D] mb-4">Informazioni Generali</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Package, label: 'Numero Ordine', value: order.id },
                { icon: User, label: 'Cliente', value: order.cliente },
                { icon: Calendar, label: 'Data Ordine', value: order.dataOrdine },
                { icon: MapPin, label: 'Destinazione', value: order.destinazione },
                { icon: User, label: 'Responsabile', value: order.responsabile },
                { icon: Package, label: 'Importo Totale', value: order.importo },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-white rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      <span className="text-xs text-[#9CA3AF]">{item.label}</span>
                    </div>
                    <p className="text-sm font-medium text-[#2D2D2D] truncate">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prodotti */}
          {order.prodotti.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#2D2D2D] mb-4">Prodotti Ordinati</h3>
              <div className="space-y-2">
                {order.prodotti.map((p: any, i: number) => (
                  <div key={i} className="bg-[#F7F9FC] rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-[#9CA3AF] font-mono">{p.sku}</span>
                        <p className="text-sm font-medium text-[#2D2D2D] mt-0.5">{p.nome}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#17E88F]">{p.totale}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-[#6B7280]">
                      <span>Qtà: <strong className="text-[#2D2D2D]">{p.qty}</strong></span>
                      <span>Disp.: <strong className="text-[#22C55E]">{p.disponibilita}</strong></span>
                      <span>Prezzo: <strong className="text-[#2D2D2D]">{p.prezzoUnit}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {order.timeline.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#2D2D2D] mb-4">Timeline Operativa</h3>
              <div className="space-y-0">
                {order.timeline.map((t: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        t.completato ? 'bg-[#DCFCE7]' : 'bg-[#F3F4F6]'
                      }`}>
                        {t.completato
                          ? <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                          : <Clock className="w-4 h-4 text-[#9CA3AF]" />
                        }
                      </div>
                      {i < order.timeline.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 ${t.completato ? 'bg-[#17E88F]/30' : 'bg-[#E5EAF2]'}`} />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-medium ${t.completato ? 'text-[#2D2D2D]' : 'text-[#9CA3AF]'}`}>
                        {t.evento}
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">{t.data}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E5EAF2] flex gap-3">
          <button className="flex-1 px-4 py-2.5 bg-[#F7F9FC] border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-white transition-all text-sm font-medium">
            Modifica Ordine
          </button>
          <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium flex items-center justify-center gap-2">
            <Truck className="w-4 h-4" />
            Crea Spedizione
          </button>
        </div>
      </div>
    </>
  );
}
