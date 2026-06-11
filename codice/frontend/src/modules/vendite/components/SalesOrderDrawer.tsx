import { useEffect, useState } from 'react';
import { X, Package, MapPin, User, Calendar, Receipt, Boxes, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ordiniApi } from '../../../api/ordiniApi';
import type { OrdineVenditaDettaglio, RigaOrdineVendita, StatoOrdineVendita } from '../../../types/ordini';
import { useAuthStore } from '../../../store/authStore';

interface SalesOrderDrawerProps {
  orderId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const fmtData = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleDateString('it-IT') : '-';

const fmtDateTime = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

const fmtEuro = (n: number | null | undefined): string =>
  `EUR ${Number(n ?? 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getStatoBadge = (stato: StatoOrdineVendita) => {
  switch (stato) {
    case 'BOZZA': return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Bozza' };
    case 'CONFERMATO': return { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]', label: 'Confermato' };
    case 'SPEDITO': return { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', label: 'Spedito' };
    case 'ANNULLATO': return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Annullato' };
  }
};

const getPickingBadge = (stato: string) => {
  switch (stato) {
    case 'NON_AVVIATO': return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Non Avviato' };
    case 'IN_PICKING': return { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]', label: 'In Picking' };
    case 'PICKING_COMPLETATO': return { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', label: 'Completato' };
    default: return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: stato };
  }
};

export function SalesOrderDrawer({ orderId, isOpen, onClose }: SalesOrderDrawerProps) {
  const hasPermesso = useAuthStore((state) => state.hasPermesso);
  const [detail, setDetail] = useState<OrdineVenditaDettaglio | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingStato, setUpdatingStato] = useState(false);

  useEffect(() => {
    if (!isOpen || orderId == null) return;
    let alive = true;
    setLoading(true);
    ordiniApi.getById(orderId)
      .then((data) => {
        if (alive) setDetail(data);
      })
      .catch((err: any) => {
        if (alive) setDetail(null);
        toast.error('Errore caricamento ordine', { description: err?.message });
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [isOpen, orderId]);

  useEffect(() => {
    if (!isOpen) setDetail(null);
  }, [isOpen]);

  const order = detail?.ordine;
  const righe = detail?.righe ?? [];
  const badge = order ? getStatoBadge(order.stato) : getStatoBadge('BOZZA');
  const pickingBadge = order ? getPickingBadge(order.stato_picking) : getPickingBadge('NON_AVVIATO');
  const orderLabel = order ? `SO-${String(order.id).padStart(4, '0')}` : '-';
  const canApprove = !!order && order.stato === 'BOZZA' && hasPermesso('ordini:approve');

  const handleConferma = async () => {
    if (!order) return;
    setUpdatingStato(true);
    try {
      const updated = await ordiniApi.updateStato(order.id, 'CONFERMATO');
      setDetail((prev) => prev ? { ...prev, ordine: { ...prev.ordine, ...updated } } : prev);
      toast.success(`Ordine ${orderLabel} confermato`);
    } catch (err: any) {
      toast.error('Errore aggiornamento stato', { description: err?.message });
    } finally {
      setUpdatingStato(false);
    }
  };

  const infoCards = order ? [
    { icon: Package, label: 'Numero Ordine', value: orderLabel },
    { icon: User, label: 'Cliente', value: order.cliente ?? '-' },
    { icon: Calendar, label: 'Data Ordine', value: fmtData(order.data_ordine) },
    { icon: MapPin, label: 'Destinazione', value: order.destinazione ?? '-' },
    { icon: User, label: 'Responsabile', value: order.utente ?? '-' },
    { icon: Receipt, label: 'Importo Totale', value: fmtEuro(order.importo_totale) },
  ] : [];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      )}
      <div className={`fixed right-0 top-0 h-full w-[560px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-[#E5EAF2]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-[#2D2D2D]">{orderLabel}</h2>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1">{order?.cliente ?? 'Ordine cliente'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F9FC] rounded-xl transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-16 text-center text-sm text-[#6B7280]">
              <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin" />
              Caricamento ordine...
            </div>
          )}

          {!loading && !order && (
            <div className="py-16 text-center text-sm text-[#6B7280]">
              Ordine non disponibile.
            </div>
          )}

          {!loading && order && (
            <>
              <div className="bg-[#F7F9FC] rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-[#2D2D2D] mb-4">Informazioni Generali</h3>
                <div className="grid grid-cols-2 gap-3">
                  {infoCards.map((item, i) => {
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

              <div className="bg-[#F7F9FC] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-[#2D2D2D] mb-4">Stato Operativo</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3">
                    <div className="text-xs text-[#9CA3AF] mb-1">Stato Ordine</div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-3">
                    <div className="text-xs text-[#9CA3AF] mb-1">Stato Picking</div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${pickingBadge.bg} ${pickingBadge.text}`}>
                      {pickingBadge.label}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-3">
                    <div className="text-xs text-[#9CA3AF] mb-1">Creato</div>
                    <div className="text-sm font-medium text-[#2D2D2D]">{fmtDateTime(order.created_at)}</div>
                  </div>
                  <div className="bg-white rounded-xl p-3">
                    <div className="text-xs text-[#9CA3AF] mb-1">Ultimo Aggiornamento</div>
                    <div className="text-sm font-medium text-[#2D2D2D]">{fmtDateTime(order.updated_at)}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#2D2D2D] mb-4">Prodotti Ordinati</h3>
                {righe.length === 0 ? (
                  <div className="bg-[#F7F9FC] rounded-xl p-6 text-sm text-[#6B7280]">Nessuna riga ordine.</div>
                ) : (
                  <div className="space-y-2">
                    {righe.map((riga: RigaOrdineVendita) => (
                      <div key={riga.id} className="bg-[#F7F9FC] rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-xs text-[#9CA3AF] font-mono">{riga.sku ?? `PRD-${riga.prodotto_id}`}</span>
                            <p className="text-sm font-medium text-[#2D2D2D] mt-0.5">{riga.prodotto ?? 'Prodotto'}</p>
                          </div>
                          <span className="text-sm font-semibold text-[#17E88F]">
                            {fmtEuro(Number(riga.quantita) * Number(riga.prezzo_unitario))}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-[#6B7280]">
                          <span>Qta: <strong className="text-[#2D2D2D]">{riga.quantita}</strong></span>
                          <span>Prezzo: <strong className="text-[#2D2D2D]">{fmtEuro(riga.prezzo_unitario)}</strong></span>
                          <span>Riga: <strong className="text-[#2D2D2D]">#{riga.id}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-[#E5EAF2] flex gap-3">
          {canApprove ? (
            <button
              onClick={handleConferma}
              disabled={updatingStato}
              className="flex-1 px-4 py-2.5 bg-[#F7F9FC] border border-[#E5EAF2] text-[#2D2D2D] rounded-xl hover:bg-white transition-all text-sm font-medium disabled:opacity-40"
            >
              {updatingStato ? 'Conferma...' : 'Conferma Ordine'}
            </button>
          ) : (
            <button className="flex-1 px-4 py-2.5 bg-[#F7F9FC] border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-white transition-all text-sm font-medium">
              Modifica Ordine
            </button>
          )}
          <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium flex items-center justify-center gap-2">
            <Boxes className="w-4 h-4" />
            Crea Spedizione
          </button>
        </div>
      </div>
    </>
  );
}
