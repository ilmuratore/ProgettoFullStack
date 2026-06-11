import { useEffect, useState } from 'react';
import { X, Package, MapPin, Truck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { spedizioniApi } from '../../../api/spedizioniApi';
import type { Spedizione, StatoSpedizione } from '../../../types/spedizioni';

interface ShipmentDrawerProps {
  shipmentId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const fmtDate = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleDateString('it-IT') : '-';

const fmtDateTime = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

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

export function ShipmentDrawer({ shipmentId, isOpen, onClose }: ShipmentDrawerProps) {
  const [shipment, setShipment] = useState<Spedizione | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || shipmentId == null) return;
    let alive = true;
    setLoading(true);
    spedizioniApi.getById(shipmentId)
      .then((data) => {
        if (alive) setShipment(data);
      })
      .catch((err: any) => {
        if (alive) setShipment(null);
        toast.error('Errore caricamento spedizione', { description: err?.message });
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [isOpen, shipmentId]);

  useEffect(() => {
    if (!isOpen) setShipment(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const shipmentLabel = shipment ? `SH-${String(shipment.id).padStart(4, '0')}` : '-';
  const ordineLabel = shipment ? `SO-${String(shipment.ordine_id).padStart(4, '0')}` : '-';

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E5EAF2] p-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#2D2D2D]">Dettaglio Spedizione</h2>
            <p className="text-sm text-[#6B7280] mt-1">{shipmentLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F7F9FC] rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="py-16 text-center text-sm text-[#6B7280]">
              <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin" />
              Caricamento spedizione...
            </div>
          )}

          {!loading && !shipment && (
            <div className="py-16 text-center text-sm text-[#6B7280]">
              Spedizione non disponibile.
            </div>
          )}

          {!loading && shipment && (
            <>
              <div className="bg-[#F7F9FC] rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-[#2D2D2D]">Informazioni Generali</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Numero Spedizione</p>
                    <p className="text-sm font-medium text-[#2D2D2D]">{shipmentLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Tracking</p>
                    <p className="text-sm font-mono text-[#2D2D2D]">{shipment.tracking_number ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Cliente</p>
                    <p className="text-sm font-medium text-[#2D2D2D]">{shipment.cliente}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Corriere</p>
                    <p className="text-sm font-medium text-[#2D2D2D]">{shipment.corriere ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Stato</p>
                    {getStatusBadge(shipment.stato)}
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Creata il</p>
                    <p className="text-sm text-[#2D2D2D]">{fmtDateTime(shipment.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E5EAF2] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-sm font-semibold text-[#2D2D2D]">Ordine Associato</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Numero Ordine</p>
                    <p className="text-sm font-medium text-[#2D2D2D]">{ordineLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Ultimo Aggiornamento</p>
                    <p className="text-sm font-medium text-[#2D2D2D]">{fmtDateTime(shipment.updated_at)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E5EAF2] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-sm font-semibold text-[#2D2D2D]">Tracking</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Codice Tracking</p>
                    <p className="text-sm font-mono text-[#2D2D2D]">{shipment.tracking_number ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Codice Corriere</p>
                    <p className="text-sm text-[#2D2D2D]">{shipment.codice_corriere ?? '-'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] border border-[#BFDBFE] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-sm font-semibold text-[#2D2D2D]">Destinazione</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Destinazione</p>
                    <p className="text-sm font-medium text-[#2D2D2D]">{shipment.destinazione ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Data</p>
                    <p className="text-sm text-[#2D2D2D]">{fmtDate(shipment.created_at)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
