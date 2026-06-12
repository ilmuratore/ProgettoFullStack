import { useEffect, useMemo, useState } from 'react';
import { X, ChevronRight, CheckCircle, ShoppingCart, Truck, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ordiniApi } from '../../../api/ordiniApi';
import { spedizioniApi } from '../../../api/spedizioniApi';
import type { Corriere } from '../../../types/corrieri';
import type { OrdineVendita } from '../../../types/ordini';

interface NewShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  couriers: Corriere[];
  existingOrdineIds: number[];
  onCreated: () => void;
}

const steps = [
  { num: 1, label: 'Selezione Ordine', icon: ShoppingCart },
  { num: 2, label: 'Selezione Corriere', icon: Truck },
  { num: 3, label: 'Tracking', icon: FileText },
  { num: 4, label: 'Conferma', icon: Check },
];

const formatOrderCode = (id: number) => `SO-${String(id).padStart(4, '0')}`;

export function NewShipmentModal({ isOpen, onClose, couriers, existingOrdineIds, onCreated }: NewShipmentModalProps) {
  const [step, setStep] = useState(1);
  const [orders, setOrders] = useState<OrdineVendita[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrdine, setSelectedOrdine] = useState<OrdineVendita | null>(null);
  const [selectedCorriere, setSelectedCorriere] = useState<Corriere | null>(null);
  const [tracking, setTracking] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingOrders(true);
    ordiniApi
      .list({ stato: 'CONFERMATO', stato_picking: 'PICKING_COMPLETATO' })
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err: any) => {
        setOrders([]);
        toast.error('Errore caricamento ordini', { description: err?.message });
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, [isOpen]);

  const availableOrders = useMemo(() => {
    const used = new Set(existingOrdineIds.map(Number));
    return orders.filter((order) => !used.has(Number(order.id)));
  }, [existingOrdineIds, orders]);

  const handleClose = () => {
    setStep(1);
    setOrders([]);
    setSelectedOrdine(null);
    setSelectedCorriere(null);
    setTracking('');
    setSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedOrdine || submitting) return;
    setSubmitting(true);
    try {
      await spedizioniApi.create({
        ordine_id: selectedOrdine.id,
        cliente_id: selectedOrdine.cliente_id,
        destinazione_id: selectedOrdine.destinazione_id,
        corriere_id: selectedCorriere?.id,
        tracking_number: tracking.trim() || undefined,
      });
      toast.success('Spedizione creata');
      handleClose();
      onCreated();
    } catch (err: any) {
      toast.error('Errore creazione spedizione', { description: err?.message });
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#E5EAF2]">
          <h2 className="font-semibold text-[#2D2D2D]">Nuova Spedizione</h2>
          <button onClick={handleClose} className="p-2 hover:bg-[#F7F9FC] rounded-xl transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-[#E5EAF2]">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <div key={s.num} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    isActive ? 'bg-[#17E88F]/10 text-[#17E88F]' :
                    isDone ? 'bg-[#DCFCE7] text-[#22C55E]' :
                    'text-[#9CA3AF]'
                  }`}>
                    {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    <span className="text-xs font-medium">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-[#9CA3AF] flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Ordini confermati con picking completato e senza spedizione.</p>
              <div className="space-y-2">
                {loadingOrders ? (
                  <div className="py-10 text-center text-sm text-[#6B7280]">Caricamento ordini...</div>
                ) : availableOrders.length === 0 ? (
                  <div className="py-10 text-center text-sm text-[#6B7280]">Nessun ordine disponibile.</div>
                ) : availableOrders.map((ordine) => (
                  <div
                    key={ordine.id}
                    onClick={() => setSelectedOrdine(ordine)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedOrdine?.id === ordine.id
                        ? 'border-[#17E88F] bg-[#F0FDF7]'
                        : 'border-[#E5EAF2] hover:border-[#17E88F]/40 hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D]">{formatOrderCode(ordine.id)}</p>
                        <p className="text-xs text-[#9CA3AF] mt-1">{ordine.cliente ?? '-'}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-[#6B7280]">{ordine.destinazione ?? '-'}</span>
                          <span className="text-xs text-[#6B7280]">|</span>
                          <span className="text-xs font-medium text-[#17E88F]">
                            {Number(ordine.importo_totale ?? 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                          </span>
                        </div>
                      </div>
                      {selectedOrdine?.id === ordine.id && <CheckCircle className="w-5 h-5 text-[#17E88F]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Corriere opzionale.</p>
              <button
                onClick={() => setSelectedCorriere(null)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedCorriere === null
                    ? 'border-[#17E88F] bg-[#F0FDF7]'
                    : 'border-[#E5EAF2] hover:border-[#17E88F]/40'
                }`}
              >
                <p className="text-sm font-medium text-[#2D2D2D]">Da assegnare dopo</p>
              </button>
              <div className="space-y-3">
                {couriers.map((corriere) => (
                  <div
                    key={corriere.id}
                    onClick={() => setSelectedCorriere(corriere)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedCorriere?.id === corriere.id
                        ? 'border-[#17E88F] bg-[#F0FDF7]'
                        : 'border-[#E5EAF2] hover:border-[#17E88F]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center">
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2D2D2D]">{corriere.nome}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-[#6B7280]">{corriere.codice}</span>
                            <span className="text-xs text-[#6B7280]">|</span>
                            <span className="text-xs text-[#6B7280]">{corriere.email ?? corriere.telefono ?? '-'}</span>
                          </div>
                        </div>
                      </div>
                      {selectedCorriere?.id === corriere.id && <CheckCircle className="w-5 h-5 text-[#17E88F]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Tracking opzionale.</p>
              <div>
                <label className="text-xs text-[#9CA3AF] mb-2 block">Tracking Number</label>
                <input
                  type="text"
                  placeholder="Es. BRT123456789"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-[#22C55E]" />
                </div>
                <h3 className="font-semibold text-[#2D2D2D]">Spedizione pronta</h3>
                <p className="text-sm text-[#6B7280] mt-2">Verifica dati.</p>
              </div>
              <div className="bg-[#F7F9FC] rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Ordine</span>
                  <span className="font-medium text-[#2D2D2D]">{selectedOrdine ? formatOrderCode(selectedOrdine.id) : '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Cliente</span>
                  <span className="font-medium text-[#2D2D2D]">{selectedOrdine?.cliente ?? '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Destinazione</span>
                  <span className="font-medium text-[#2D2D2D]">{selectedOrdine?.destinazione ?? '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Corriere</span>
                  <span className="font-medium text-[#2D2D2D]">{selectedCorriere?.nome ?? 'Da assegnare'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Tracking</span>
                  <span className="font-mono text-[#2D2D2D]">{tracking || '-'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#E5EAF2] flex justify-between gap-3">
          <button
            onClick={() => step > 1 ? setStep((s) => s - 1) : handleClose()}
            className="px-5 py-2.5 bg-[#F7F9FC] border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-white transition-all text-sm font-medium"
          >
            {step === 1 ? 'Annulla' : 'Indietro'}
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 1 && !selectedOrdine) || loadingOrders}
              className="px-5 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Avanti
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedOrdine}
              className="px-5 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Conferma Spedizione
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
