import { useEffect, useState } from 'react';
import { X, Package, MapPin, Truck, Loader2, FileText, Download, AlertTriangle, RotateCcw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { spedizioniApi } from '../../../api/spedizioniApi';
import type { Spedizione, StatoSpedizione, Ddt } from '../../../types/spedizioni';
import { useAuthStore } from '../../../store/authStore';

interface ShipmentDrawerProps {
  shipmentId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (shipment: Spedizione) => void;
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

const STATO_LABELS: Record<StatoSpedizione, string> = {
  IN_PREPARAZIONE: 'In Preparazione',
  SPEDITA: 'Spedita',
  CONSEGNATA: 'Consegnata',
  PROBLEMA: 'Problema',
};

const STATO_TRANSIZIONI: Record<StatoSpedizione, { stato: StatoSpedizione; label: string; icon: typeof CheckCircle2; className: string }[]> = {
  IN_PREPARAZIONE: [
    { stato: 'SPEDITA', label: 'Affida al Corriere', icon: Truck, className: 'bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white hover:shadow-lg' },
    { stato: 'PROBLEMA', label: 'Segnala Problema', icon: AlertTriangle, className: 'bg-white border border-[#FEE2E2] text-[#DC2626] hover:bg-[#FEF2F2]' },
  ],
  SPEDITA: [
    { stato: 'CONSEGNATA', label: 'Segna come Consegnata', icon: CheckCircle2, className: 'bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white hover:shadow-lg' },
    { stato: 'PROBLEMA', label: 'Segnala Problema', icon: AlertTriangle, className: 'bg-white border border-[#FEE2E2] text-[#DC2626] hover:bg-[#FEF2F2]' },
  ],
  CONSEGNATA: [],
  PROBLEMA: [
    { stato: 'SPEDITA', label: 'Rimetti in Transito', icon: RotateCcw, className: 'bg-white border border-[#E5EAF2] text-[#2D2D2D] hover:bg-[#F7F9FC]' },
  ],
};

export function ShipmentDrawer({ shipmentId, isOpen, onClose, onUpdated }: ShipmentDrawerProps) {
  const hasPermesso = useAuthStore((state) => state.hasPermesso);
  const canWrite = hasPermesso('spedizioni:write');
  const [shipment, setShipment] = useState<Spedizione | null>(null);
  const [loading, setLoading] = useState(false);
  const [ddt, setDdt] = useState<Ddt | null>(null);
  const [tracking, setTracking] = useState('');
  const [updatingStato, setUpdatingStato] = useState<StatoSpedizione | null>(null);
  const [savingTracking, setSavingTracking] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (!isOpen || shipmentId == null) return;
    let alive = true;
    setLoading(true);
    Promise.all([
      spedizioniApi.getById(shipmentId),
      spedizioniApi.getDdt(shipmentId).catch(() => null),
    ])
      .then(([data, ddtData]) => {
        if (!alive) return;
        setShipment(data);
        setTracking(data.tracking_number ?? '');
        setDdt(ddtData);
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
    if (!isOpen) {
      setShipment(null);
      setDdt(null);
      setTracking('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const shipmentLabel = shipment ? `SH-${String(shipment.id).padStart(4, '0')}` : '-';
  const ordineLabel = shipment ? `SO-${String(shipment.ordine_id).padStart(4, '0')}` : '-';
  const trackingChanged = shipment != null && tracking.trim() !== (shipment.tracking_number ?? '');

  const handleChangeStato = async (nuovo: StatoSpedizione) => {
    if (!shipment) return;
    setUpdatingStato(nuovo);
    try {
      const updated = await spedizioniApi.updateStato(shipment.id, nuovo);
      setShipment(updated);
      onUpdated?.(updated);
      toast.success(`Spedizione ${shipmentLabel} aggiornata a "${STATO_LABELS[nuovo]}"`);
    } catch (err: any) {
      toast.error('Errore aggiornamento stato', { description: err?.message });
    } finally {
      setUpdatingStato(null);
    }
  };

  const handleSaveTracking = async () => {
    if (!shipment) return;
    setSavingTracking(true);
    try {
      const updated = await spedizioniApi.updateTracking(shipment.id, tracking.trim());
      setShipment(updated);
      onUpdated?.(updated);

      const ddtExisted = !!ddt;
      const ddtPayload = {
        data_ddt: new Date().toISOString().slice(0, 10),
        ...(shipment.corriere ? { trasportatore: shipment.corriere } : {}),
      };
      const nextDdt = ddtExisted
        ? await spedizioniApi.updateDdt(shipment.id, ddtPayload)
        : await spedizioniApi.createDdt(shipment.id, ddtPayload);
      setDdt(nextDdt);

      toast.success(ddtExisted ? 'Tracking aggiornato e DDT aggiornato' : 'Tracking aggiornato e DDT generato');
    } catch (err: any) {
      toast.error('Errore salvataggio tracking', { description: err?.message });
    } finally {
      setSavingTracking(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!shipment) return;
    setDownloadingPdf(true);
    try {
      await spedizioniApi.downloadDdtPdf(shipment.id);
    } catch (err: any) {
      toast.error('Errore download PDF DDT', { description: err?.message });
    } finally {
      setDownloadingPdf(false);
    }
  };

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
                  <Truck className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-sm font-semibold text-[#2D2D2D]">Gestione Stato</h3>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-[#9CA3AF]">Stato attuale:</span>
                  {getStatusBadge(shipment.stato)}
                </div>
                {STATO_TRANSIZIONI[shipment.stato].length === 0 ? (
                  <p className="text-sm text-[#6B7280]">Spedizione conclusa, nessuna ulteriore azione disponibile.</p>
                ) : !canWrite ? (
                  <p className="text-sm text-[#6B7280]">Non hai i permessi per modificare lo stato della spedizione.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {STATO_TRANSIZIONI[shipment.stato].map(({ stato, label, icon: Icon, className }) => (
                      <button
                        key={stato}
                        onClick={() => handleChangeStato(stato)}
                        disabled={updatingStato !== null}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 ${className}`}
                      >
                        {updatingStato === stato ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-[#E5EAF2] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-sm font-semibold text-[#2D2D2D]">Tracking</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-xs text-[#9CA3AF] mb-1">Codice Tracking</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tracking}
                        onChange={(e) => setTracking(e.target.value)}
                        placeholder="Inserisci numero tracking"
                        disabled={!canWrite}
                        className="flex-1 px-3 py-2 border border-[#E5EAF2] rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all disabled:opacity-50 disabled:bg-[#F7F9FC]"
                      />
                      {canWrite && (
                        <button
                          onClick={handleSaveTracking}
                          disabled={savingTracking || !trackingChanged}
                          className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                          {savingTracking && <Loader2 className="w-4 h-4 animate-spin" />}
                          Salva
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Codice Corriere</p>
                    <p className="text-sm text-[#2D2D2D]">{shipment.codice_corriere ?? '-'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E5EAF2] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-sm font-semibold text-[#2D2D2D]">Documento di Trasporto (DDT)</h3>
                </div>
                {!ddt ? (
                  <p className="text-sm text-[#6B7280]">
                    Nessun DDT generato. Inserisci e salva il tracking number per generarlo automaticamente.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-[#9CA3AF] mb-1">Numero DDT</p>
                        <p className="text-sm font-medium text-[#2D2D2D]">{ddt.numero_ddt}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#9CA3AF] mb-1">Data DDT</p>
                        <p className="text-sm text-[#2D2D2D]">{fmtDate(ddt.data_ddt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#9CA3AF] mb-1">Trasportatore</p>
                        <p className="text-sm text-[#2D2D2D]">{ddt.trasportatore ?? shipment.corriere ?? '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#9CA3AF] mb-1">Ultimo Aggiornamento</p>
                        <p className="text-sm text-[#2D2D2D]">{fmtDateTime(ddt.updated_at)}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={downloadingPdf}
                      className="px-4 py-2 bg-white border border-[#E5EAF2] text-[#2D2D2D] rounded-xl hover:bg-[#F7F9FC] transition-all text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      {downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Scarica PDF DDT
                    </button>
                  </>
                )}
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

              <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] border border-[#BFDBFE] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-sm font-semibold text-[#2D2D2D]">Destinazione</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Destinazione</p>
                    <p className="text-sm font-medium text-[#2D2D2D] whitespace-pre-line">{shipment.destinazione ?? '-'}</p>
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
