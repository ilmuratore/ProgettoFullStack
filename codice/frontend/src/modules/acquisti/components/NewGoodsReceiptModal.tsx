import { useEffect, useState } from 'react';
import { X, ClipboardList, Package, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { acquistiApi } from '../../../api/acquistiApi';
import { magazzinoApi } from '../../../api/magazzinoApi';
import type {
  OrdineAcquistoLista,
  OrdineAcquistoDettaglio,
  RigaRicezioneOrdineCreate,
} from '../../../types/acquisti';
import type { Ubicazione } from '../../../types/magazzino';

interface NewGoodsReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

type Step = 1 | 2;

interface ReceiptLine {
  id: number;
  prodotto_id: number;
  prodotto: string;
  sku: string;
  quantita_residua: number;
  quantita_ricevuta: number;
  ubicazione_id: number;
}

const ORDINI_RICEVIBILI: OrdineAcquistoLista['stato'][] = ['CONFERMATO', 'IN_RICEZIONE'];

const todayIso = (): string => new Date().toISOString().slice(0, 10);

export function NewGoodsReceiptModal({ isOpen, onClose, onCreated }: NewGoodsReceiptModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [orders, setOrders] = useState<OrdineAcquistoLista[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrdineAcquistoDettaglio | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [ubicazioni, setUbicazioni] = useState<Ubicazione[]>([]);
  const [dataRicezione, setDataRicezione] = useState(todayIso());
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<ReceiptLine[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadOrders();
    loadUbicazioni();
  }, [isOpen]);

  useEffect(() => {
    if (!selectedOrderId) {
      setOrderDetail(null);
      setLines([]);
      return;
    }
    let alive = true;
    setLoadingDetail(true);
    acquistiApi
      .getById(selectedOrderId)
      .then((d) => {
        if (!alive) return;
        setOrderDetail(d);
        setLines(
          d.righe
            .filter((r) => Number(r.quantita_ricevuta) < Number(r.quantita_ordinata))
            .map((r) => ({
              id: r.id,
              prodotto_id: r.prodotto_id,
              prodotto: r.prodotto ?? `#${r.prodotto_id}`,
              sku: r.sku ?? '',
              quantita_residua: Number(r.quantita_ordinata) - Number(r.quantita_ricevuta),
              quantita_ricevuta: 0,
              ubicazione_id: 0,
            }))
        );
      })
      .catch((err: any) => toast.error('Errore caricamento ordine', { description: err?.message }))
      .finally(() => { if (alive) setLoadingDetail(false); });
    return () => { alive = false; };
  }, [selectedOrderId]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const all = await acquistiApi.list();
      setOrders(all.filter((o) => ORDINI_RICEVIBILI.includes(o.stato)));
    } catch (err: any) {
      toast.error('Errore caricamento ordini', { description: err?.message });
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadUbicazioni = async () => {
    try {
      setUbicazioni(await magazzinoApi.listUbicazioni());
    } catch (err: any) {
      toast.error('Errore caricamento ubicazioni', { description: err?.message });
    }
  };

  if (!isOpen) return null;

  const updateLine = (id: number, field: 'quantita_ricevuta' | 'ubicazione_id', value: number) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const handleClose = () => {
    setCurrentStep(1);
    setOrders([]);
    setSelectedOrderId(null);
    setOrderDetail(null);
    setUbicazioni([]);
    setDataRicezione(todayIso());
    setNote('');
    setLines([]);
    setSubmitting(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (!selectedOrderId) return;

    const righeAttive = lines.filter((l) => l.quantita_ricevuta > 0);
    if (righeAttive.length === 0) {
      toast.error('Inserisci almeno una riga con quantità ricevuta maggiore di zero');
      return;
    }

    const rigaSenzaUbicazione = righeAttive.find((l) => l.ubicazione_id <= 0);
    if (rigaSenzaUbicazione) {
      toast.error(`Seleziona un'ubicazione per "${rigaSenzaUbicazione.prodotto}"`);
      return;
    }

    const righe: RigaRicezioneOrdineCreate[] = righeAttive.map((l) => ({
      prodotto_id: l.prodotto_id,
      quantita_ricevuta: l.quantita_ricevuta,
      ubicazione_id: l.ubicazione_id,
    }));

    setSubmitting(true);
    try {
      await acquistiApi.createRicezione({
        ordine_acquisto_id: selectedOrderId,
        data_ricezione: dataRicezione || undefined,
        note: note || undefined,
        righe,
      });
      toast.success('Ricezione registrata');
      onCreated?.();
      handleClose();
    } catch (err: any) {
      toast.error('Errore registrazione ricezione', { description: err?.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedOrderId) setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep === 2) setCurrentStep(1);
  };

  const steps = [
    { number: 1, label: 'Ordine', icon: ClipboardList },
    { number: 2, label: 'Righe Ricevute', icon: Package },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl animate-in fade-in duration-200 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#E5EAF2]">
          <div>
            <h2 className="text-xl font-semibold text-[#2D2D2D]">Registra Ricezione</h2>
            <p className="text-sm text-[#6B7280] mt-1">Step {currentStep} di 2</p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-[#F7F9FC] rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-6 border-b border-[#E5EAF2]">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-[#17E88F] text-white' :
                      isActive ? 'bg-[#F0FDF7] text-[#17E88F] border-2 border-[#17E88F]' :
                      'bg-[#F7F9FC] text-[#6B7280]'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className={`text-xs mt-2 font-medium ${
                      isActive ? 'text-[#17E88F]' : isCompleted ? 'text-[#22C55E]' : 'text-[#6B7280]'
                    }`}>
                      {step.label}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className={`w-5 h-5 mx-2 ${
                      isCompleted ? 'text-[#17E88F]' : 'text-[#E5EAF2]'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Selezione Ordine */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#2D2D2D] mb-2">Seleziona Ordine da Ricevere</h3>
                <p className="text-sm text-[#6B7280]">Solo gli ordini confermati o in ricezione possono ricevere merce.</p>
              </div>
              {loadingOrders ? (
                <div className="rounded-2xl border border-[#E5EAF2] bg-[#F7F9FC] p-6 text-center text-sm text-[#6B7280]">
                  Caricamento ordini...
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-[#E5EAF2] bg-[#F7F9FC] p-6 text-center text-sm text-[#6B7280]">
                  Nessun ordine confermato o in ricezione disponibile.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedOrderId === order.id
                          ? 'border-[#17E88F] bg-[#F0FDF7]'
                          : 'border-[#E5EAF2] hover:border-[#17E88F]/40 hover:bg-[#F7F9FC]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-[#2D2D2D] font-mono">OA-{String(order.id).padStart(4, '0')}</p>
                          <p className="text-xs text-[#9CA3AF] mt-0.5">{order.fornitore}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#F59E0B]">
                          {order.stato === 'IN_RICEZIONE' ? 'In Ricezione' : 'Confermato'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Righe Ricezione */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-[#F7F9FC] rounded-xl p-4">
                <div className="text-sm text-[#6B7280] mb-1">Ordine Selezionato</div>
                <div className="font-medium text-[#2D2D2D] font-mono">
                  OA-{String(selectedOrderId).padStart(4, '0')} — {orderDetail?.ordine.fornitore ?? ''}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#2D2D2D] mb-2 block">Data Ricezione</label>
                  <input
                    type="date"
                    value={dataRicezione}
                    onChange={(e) => setDataRicezione(e.target.value)}
                    className="w-full h-11 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#2D2D2D] mb-2 block">Note (opzionale)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Note sulla ricezione..."
                    className="w-full h-11 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[#2D2D2D] mb-3">Righe Ricevute</h3>
                {loadingDetail ? (
                  <div className="rounded-2xl border border-[#E5EAF2] bg-[#F7F9FC] p-6 text-center text-sm text-[#6B7280]">
                    Caricamento righe ordine...
                  </div>
                ) : lines.length === 0 ? (
                  <div className="rounded-2xl border border-[#E5EAF2] bg-[#F7F9FC] p-6 text-center text-sm text-[#6B7280]">
                    {orderDetail?.righe.length
                      ? 'Tutte le righe di questo ordine risultano già completamente ricevute.'
                      : 'Questo ordine non contiene righe prodotto.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lines.map((line) => (
                      <div key={line.id} className="p-4 bg-[#F7F9FC] rounded-xl">
                        <div className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-5">
                            <label className="text-xs text-[#6B7280] mb-1 block">Prodotto</label>
                            <div className="h-9 px-3 bg-white border border-[#E5EAF2] rounded-lg text-sm flex items-center">
                              {line.prodotto} {line.sku ? `(${line.sku})` : ''}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-[#6B7280] mb-1 block">Residuo</label>
                            <div className="h-9 px-3 bg-white border border-[#E5EAF2] rounded-lg text-sm flex items-center text-[#6B7280]">
                              {line.quantita_residua}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-[#6B7280] mb-1 block">Qtà Ricevuta</label>
                            <input
                              type="number"
                              min={0}
                              max={line.quantita_residua}
                              value={line.quantita_ricevuta}
                              onChange={(e) => updateLine(line.id, 'quantita_ricevuta', Math.max(0, Number(e.target.value) || 0))}
                              className="w-full h-9 px-3 bg-white border border-[#E5EAF2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20"
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="text-xs text-[#6B7280] mb-1 block">Ubicazione</label>
                            <select
                              value={line.ubicazione_id || ''}
                              onChange={(e) => updateLine(line.id, 'ubicazione_id', Number(e.target.value))}
                              className="w-full h-9 px-3 bg-white border border-[#E5EAF2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20"
                            >
                              <option value="">Seleziona...</option>
                              {ubicazioni.map((u) => (
                                <option key={u.id} value={u.id}>{u.codice_composto}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-[#E5EAF2]">
          <button
            onClick={currentStep === 1 ? handleClose : handleBack}
            className="px-6 py-2.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all font-medium"
          >
            {currentStep === 1 ? 'Annulla' : 'Indietro'}
          </button>
          <button
            onClick={currentStep === 1 ? handleNext : handleConfirm}
            disabled={
              (currentStep === 1 && !selectedOrderId) ||
              (currentStep === 2 && (submitting || loadingDetail || lines.length === 0))
            }
            className="px-6 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {currentStep === 1 ? (
              <>Avanti <ArrowRight className="w-4 h-4" /></>
            ) : submitting ? 'Registrazione...' : (
              <>Registra Ricezione <CheckCircle className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
