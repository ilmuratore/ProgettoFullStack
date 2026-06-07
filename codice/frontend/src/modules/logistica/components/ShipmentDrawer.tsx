import { X, Package, MapPin, Truck, Calendar, User, Phone, Mail, Box } from 'lucide-react';

interface ShipmentDrawerProps {
  shipmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const mockShipment = {
  numero: 'SH-2026-0842',
  tracking: 'TRK84529301847',
  cliente: 'Ferrero S.p.A.',
  corriere: 'BRT Express',
  stato: 'SPEDITA',
  dataPartenza: '02/06/2026 08:30',
  dataPrevista: '04/06/2026',
  ordine: 'SO-2026-0156',
  prodotti: ['Scatola Cartone 40x30x20 (x120)', 'Pallet Europeo 120x80 (x8)', 'Film Estensibile 17 mic (x15)'],
  pesoTotale: '248 kg',
  colli: 12,
  destinazione: {
    indirizzo: 'Via Eugenio Ferrero 1',
    citta: 'Torino',
    cap: '10143',
    referente: 'Marco Bianchi',
    telefono: '+39 011 3456789',
    email: 'logistica@ferrero.it',
  },
  tracking_timeline: [
    { timestamp: '04/06/2026 08:42', posizione: 'Hub Torino Nord', evento: 'In consegna', operatore: 'Marco R.' },
    { timestamp: '03/06/2026 18:15', posizione: 'Hub Milano', evento: 'Arrivata hub di transito', operatore: 'Sistema' },
    { timestamp: '03/06/2026 06:30', posizione: 'Hub Bologna', evento: 'Partita da hub', operatore: 'Sistema' },
    { timestamp: '02/06/2026 14:22', posizione: 'Hub Bologna', evento: 'Arrivata hub di smistamento', operatore: 'Sistema' },
    { timestamp: '02/06/2026 08:30', posizione: 'Magazzino Parma', evento: 'Ritirata dal corriere', operatore: 'Luca M.' },
  ],
};

export function ShipmentDrawer({ shipmentId, isOpen, onClose }: ShipmentDrawerProps) {
  if (!isOpen || !shipmentId) return null;

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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5EAF2] p-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#2D2D2D]">Dettaglio Spedizione</h2>
            <p className="text-sm text-[#6B7280] mt-1">{mockShipment.numero}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F7F9FC] rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Informazioni Generali */}
          <div className="bg-[#F7F9FC] rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#2D2D2D]">Informazioni Generali</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Numero Spedizione</p>
                <p className="text-sm font-medium text-[#2D2D2D]">{mockShipment.numero}</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Tracking</p>
                <p className="text-sm font-mono text-[#2D2D2D]">{mockShipment.tracking}</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Cliente</p>
                <p className="text-sm font-medium text-[#2D2D2D]">{mockShipment.cliente}</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Corriere</p>
                <p className="text-sm font-medium text-[#2D2D2D]">{mockShipment.corriere}</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Stato</p>
                {getStatusBadge(mockShipment.stato)}
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Data Partenza</p>
                <p className="text-sm text-[#2D2D2D]">{mockShipment.dataPartenza}</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Data Prevista</p>
                <p className="text-sm text-[#2D2D2D]">{mockShipment.dataPrevista}</p>
              </div>
            </div>
          </div>

          {/* Ordine Associato */}
          <div className="bg-white border border-[#E5EAF2] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-[#3B82F6]" />
              <h3 className="text-sm font-semibold text-[#2D2D2D]">Ordine Associato</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF2]">
                <span className="text-xs text-[#9CA3AF]">Numero Ordine</span>
                <span className="text-sm font-medium text-[#2D2D2D]">{mockShipment.ordine}</span>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] mb-2">Prodotti</p>
                <div className="space-y-1.5">
                  {mockShipment.prodotti.map((prod, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-[#F7F9FC] rounded-lg">
                      <Box className="w-3.5 h-3.5 text-[#6B7280]" />
                      <span className="text-xs text-[#2D2D2D]">{prod}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E5EAF2]">
                <div>
                  <p className="text-xs text-[#9CA3AF] mb-1">Peso Totale</p>
                  <p className="text-sm font-medium text-[#2D2D2D]">{mockShipment.pesoTotale}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF] mb-1">Colli</p>
                  <p className="text-sm font-medium text-[#2D2D2D]">{mockShipment.colli}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Completo */}
          <div className="bg-white border border-[#E5EAF2] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <Truck className="w-5 h-5 text-[#3B82F6]" />
              <h3 className="text-sm font-semibold text-[#2D2D2D]">Tracking Completo</h3>
            </div>
            <div className="relative">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[#E5EAF2]" />
              <div className="space-y-4">
                {mockShipment.tracking_timeline.map((event, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className="relative z-10 w-5 h-5 bg-[#3B82F6] rounded-full border-4 border-white flex-shrink-0" />
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium text-[#2D2D2D]">{event.evento}</p>
                        <span className="text-xs text-[#9CA3AF]">{event.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3 h-3 text-[#9CA3AF]" />
                        <span className="text-xs text-[#6B7280]">{event.posizione}</span>
                      </div>
                      <span className="text-xs text-[#9CA3AF]">Operatore: {event.operatore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Destinazione */}
          <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] border border-[#BFDBFE] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#3B82F6]" />
              <h3 className="text-sm font-semibold text-[#2D2D2D]">Destinazione</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Indirizzo</p>
                <p className="text-sm font-medium text-[#2D2D2D]">{mockShipment.destinazione.indirizzo}</p>
                <p className="text-sm text-[#2D2D2D]">{mockShipment.destinazione.cap} {mockShipment.destinazione.citta}</p>
              </div>
              <div className="pt-3 border-t border-[#BFDBFE]">
                <p className="text-xs text-[#6B7280] mb-2">Referente</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span className="text-sm text-[#2D2D2D]">{mockShipment.destinazione.referente}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span className="text-sm text-[#2D2D2D]">{mockShipment.destinazione.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span className="text-sm text-[#2D2D2D]">{mockShipment.destinazione.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
