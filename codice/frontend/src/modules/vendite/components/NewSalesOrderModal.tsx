import { useEffect, useState } from 'react';
import { X, ChevronRight, Search, Plus, Trash2, CheckCircle, User, MapPin, Package, ClipboardList, Check } from 'lucide-react';
import { toast } from 'sonner';
import { ClientFormModal } from '../../anagrafiche/components/ClientFormModal';
import { clientiApi } from '../../../api/clientiApi';
import { prodottiApi } from '../../../api/prodottiApi';
import { ordiniApi } from '../../../api/ordiniApi';
import type { Cliente, ClienteCreateRequest, ClienteUpdateRequest, DestinazioneCliente } from '../../../types/clienti';
import type { ProdottoListino } from '../../../types/prodotti';

interface NewSalesOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

type ClienteOption = Cliente & { destinazioni?: DestinazioneCliente[] };

const steps = [
  { num: 1, label: 'Cliente', icon: User },
  { num: 2, label: 'Destinazione', icon: MapPin },
  { num: 3, label: 'Prodotti', icon: Package },
  { num: 4, label: 'Riepilogo', icon: ClipboardList },
  { num: 5, label: 'Conferma', icon: Check },
];

interface ProductOption extends ProdottoListino {
  disponibilita: number;
}

interface OrderLine {
  prodotto_id: number;
  sku: string;
  nome: string;
  disponibilita: number;
  prezzo: number;
  qty: number;
}

const formatDestinazione = (dest: DestinazioneCliente | null): string => {
  if (!dest) return '—';
  return dest.etichetta || [dest.indirizzo, dest.cap, dest.citta, dest.provincia].filter(Boolean).join(', ');
};

export function NewSalesOrderModal({ isOpen, onClose, onCreated }: NewSalesOrderModalProps) {
  const [step, setStep] = useState(1);
  const [clienti, setClienti] = useState<ClienteOption[]>([]);
  const [loadingClienti, setLoadingClienti] = useState(false);
  const [loadingProdotti, setLoadingProdotti] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteOption | null>(null);
  const [clienteSearch, setClienteSearch] = useState('');
  const [selectedDest, setSelectedDest] = useState<DestinazioneCliente | null>(null);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [prodSearch, setProdSearch] = useState('');
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadClienti();
    loadProducts();
  }, [isOpen]);

  const loadClienti = async () => {
    setLoadingClienti(true);
    try {
      const data = await clientiApi.list();
      setClienti(data.map((c) => ({ ...c })));
    } catch (err: any) {
      toast.error('Errore caricamento clienti', { description: err?.message });
    } finally {
      setLoadingClienti(false);
    }
  };

  const loadProducts = async () => {
    setLoadingProdotti(true);
    try {
      const data = await prodottiApi.list();
      const enriched = await Promise.all(
        data.map(async (p) => {
          try {
            const disp = await ordiniApi.getDisponibilita(p.id);
            return { ...p, disponibilita: disp.disponibile };
          } catch {
            return { ...p, disponibilita: 0 };
          }
        })
      );
      setProducts(enriched);
    } catch (err: any) {
      toast.error('Errore caricamento prodotti', { description: err?.message });
    } finally {
      setLoadingProdotti(false);
    }
  };

  const filteredClienti = clienti.filter((c) =>
    c.ragione_sociale.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    (c.piva_cf ?? '').toLowerCase().includes(clienteSearch.toLowerCase())
  );

  const addLine = (p: ProductOption) => {
    if (!orderLines.find((l) => l.prodotto_id === p.id)) {
      setOrderLines((prev) => [...prev, {
        prodotto_id: p.id,
        sku: p.sku,
        nome: p.nome,
        disponibilita: p.disponibilita,
        prezzo: Number(p.prezzo),
        qty: 1,
      }]);
    }
  };

  const updateQty = (prodottoId: number, qty: number) => {
    setOrderLines((prev) => prev.map((l) => (
      l.prodotto_id === prodottoId
        ? { ...l, qty: Math.max(1, Math.min(l.disponibilita, qty || 1)) }
        : l
    )));
  };

  const removeLine = (prodottoId: number) => {
    setOrderLines((prev) => prev.filter((l) => l.prodotto_id !== prodottoId));
  };

  const totale = orderLines.reduce((sum, l) => sum + l.prezzo * l.qty, 0);
  const pesoTotale = orderLines.reduce((sum, l) => sum + l.qty * 0.5, 0);

  const handleSaveClient = async (data: ClienteCreateRequest | ClienteUpdateRequest, id?: number) => {
    if (id !== undefined) return;
    const created = await clientiApi.create(data as ClienteCreateRequest);
    setClienti((prev) => [...prev, created]);
    setSelectedCliente(created);
    setSelectedDest(null);
    toast.success('Cliente creato');
  };

  const handleSelectCliente = async (cliente: ClienteOption) => {
    try {
      const destinazioni = await clientiApi.listDestinazioni(cliente.id);
      const enriched = { ...cliente, destinazioni };
      setClienti((prev) => prev.map((c) => (c.id === cliente.id ? enriched : c)));
      setSelectedCliente(enriched);
      setSelectedDest(destinazioni.find((d) => d.predefinita) ?? destinazioni[0] ?? null);
    } catch (err: any) {
      toast.error('Errore caricamento destinazioni', { description: err?.message });
    }
  };

  const handleConfirm = async () => {
    if (!selectedCliente || !selectedDest || orderLines.length === 0) return;

    const righe = orderLines
      .filter((line) => line.qty > 0)
      .map((line) => ({
        prodotto_id: line.prodotto_id,
        quantita: line.qty,
      }));

    if (righe.length === 0) {
      toast.error('Aggiungi almeno una riga valida');
      return;
    }

    setSubmitting(true);
    try {
      const result = await ordiniApi.create({
        cliente_id: selectedCliente.id,
        destinazione_id: selectedDest.id,
        righe,
      });
      toast.success(`Ordine SO-${String(result.ordine.id).padStart(4, '0')} creato`);
      onCreated?.();
      handleClose();
    } catch (err: any) {
      if (err?.code === 'INSUFFICIENT_STOCK' || err?.status === 422) {
        toast.error('Stock insufficiente', { description: err?.message });
      } else if (err?.status === 409) {
        toast.error('Conflitto dati', { description: err?.message });
      } else {
        toast.error('Errore creazione ordine', { description: err?.message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setClienti([]);
    setLoadingClienti(false);
    setLoadingProdotti(false);
    setIsClientFormOpen(false);
    setSelectedCliente(null);
    setClienteSearch('');
    setSelectedDest(null);
    setOrderLines([]);
    setProducts([]);
    setProdSearch('');
    setNote('');
    setConfirmed(false);
    setSubmitting(false);
    onClose();
  };

  const filteredProdotti = products.filter((p) =>
    p.sku.toLowerCase().includes(prodSearch.toLowerCase()) ||
    p.nome.toLowerCase().includes(prodSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#E5EAF2]">
          <h2 className="font-semibold text-[#2D2D2D]">Nuovo Ordine Cliente</h2>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-[#6B7280]">Seleziona il cliente per questo ordine di vendita.</p>
                </div>
                <button
                  onClick={() => setIsClientFormOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#17E88F] text-white rounded-xl hover:bg-[#0FA67A] transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Nuovo Cliente
                </button>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cerca per ragione sociale o P.IVA..."
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
                />
              </div>
              {loadingClienti ? (
                <div className="rounded-2xl border border-[#E5EAF2] bg-[#F7F9FC] p-6 text-center text-sm text-[#6B7280]">
                  Caricamento clienti...
                </div>
              ) : filteredClienti.length === 0 ? (
                <div className="rounded-2xl border border-[#E5EAF2] bg-[#F7F9FC] p-6 text-center text-sm text-[#6B7280] space-y-3">
                  <p>Nessun cliente trovato con questi criteri.</p>
                  <button
                    onClick={() => setIsClientFormOpen(true)}
                    className="px-4 py-2 bg-[#17E88F] text-white rounded-xl hover:bg-[#0FA67A] transition-all text-sm font-medium"
                  >
                    Crea nuovo cliente
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredClienti.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCliente(c)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedCliente?.id === c.id
                          ? 'border-[#17E88F] bg-[#F0FDF7]'
                          : 'border-[#E5EAF2] hover:border-[#17E88F]/40 hover:bg-[#F7F9FC]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#2D2D2D]">{c.ragione_sociale}</p>
                          <p className="text-xs text-[#9CA3AF] mt-0.5">{c.piva_cf ?? 'P.IVA non disponibile'}</p>
                        </div>
                        {selectedCliente?.id === c.id && <CheckCircle className="w-5 h-5 text-[#17E88F]" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && selectedCliente && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Seleziona la destinazione di consegna per <strong>{selectedCliente.ragione_sociale}</strong>.</p>
              {selectedCliente.destinazioni?.length ? (
                <div className="space-y-2">
                  {selectedCliente.destinazioni.map((dest) => (
                    <div
                      key={dest.id}
                      onClick={() => setSelectedDest(dest)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        selectedDest?.id === dest.id
                          ? 'border-[#17E88F] bg-[#F0FDF7]'
                          : 'border-[#E5EAF2] hover:border-[#17E88F]/40'
                      }`}
                    >
                      <MapPin className={`w-5 h-5 flex-shrink-0 ${selectedDest?.id === dest.id ? 'text-[#17E88F]' : 'text-[#9CA3AF]'}`} />
                      <span className="text-sm text-[#2D2D2D]">{formatDestinazione(dest)}</span>
                      {selectedDest?.id === dest.id && <CheckCircle className="w-5 h-5 text-[#17E88F] ml-auto" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#E5EAF2] bg-[#F7F9FC] p-6 text-sm text-[#6B7280]">
                  <p className="font-medium text-[#2D2D2D] mb-2">Nessuna destinazione disponibile.</p>
                  <p>Impossibile creare l&apos;ordine finché il cliente non ha almeno una destinazione.</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cerca SKU o prodotto..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 text-sm"
                />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {loadingProdotti ? (
                  <div className="rounded-2xl border border-[#E5EAF2] bg-[#F7F9FC] p-6 text-center text-sm text-[#6B7280]">
                    Caricamento prodotti...
                  </div>
                ) : filteredProdotti.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-[#F7F9FC] rounded-xl hover:bg-[#F0FDF7] transition-colors">
                    <div>
                      <span className="text-xs font-mono text-[#9CA3AF]">{p.sku}</span>
                      <p className="text-sm text-[#2D2D2D]">{p.nome}</p>
                      <span className="text-xs text-[#22C55E]">Disp: {p.disponibilita}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#17E88F]">EUR {Number(p.prezzo).toFixed(2)}</span>
                      <button
                        onClick={() => addLine(p)}
                        disabled={p.disponibilita <= 0 || !!orderLines.find((l) => l.prodotto_id === p.id)}
                        className="p-1.5 bg-[#17E88F]/10 text-[#17E88F] rounded-lg hover:bg-[#17E88F]/20 transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {orderLines.length > 0 && (
                <div className="space-y-2 border-t border-[#E5EAF2] pt-4">
                  <p className="text-xs font-medium text-[#6B7280]">Righe ordine ({orderLines.length})</p>
                  {orderLines.map((l) => (
                    <div key={l.prodotto_id} className="flex items-center gap-3 p-3 bg-white border border-[#E5EAF2] rounded-xl">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-[#2D2D2D]">{l.nome}</p>
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={l.disponibilita}
                        value={l.qty}
                        onChange={(e) => updateQty(l.prodotto_id, parseInt(e.target.value, 10) || 1)}
                        className="w-20 h-8 text-center bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#17E88F]"
                      />
                      <span className="text-sm font-semibold text-[#17E88F] w-24 text-right">EUR {(l.prezzo * l.qty).toFixed(2)}</span>
                      <button onClick={() => removeLine(l.prodotto_id)} className="p-1.5 text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-[#F7F9FC] rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Cliente</span>
                  <span className="font-medium text-[#2D2D2D]">{selectedCliente?.ragione_sociale}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Destinazione</span>
                  <span className="font-medium text-[#2D2D2D] text-right max-w-[60%]">{formatDestinazione(selectedDest)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Righe prodotto</span>
                  <span className="font-medium text-[#2D2D2D]">{orderLines.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Peso totale stimato</span>
                  <span className="font-medium text-[#2D2D2D]">{pesoTotale.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between text-sm border-t border-[#E5EAF2] pt-2 mt-2">
                  <span className="font-semibold text-[#2D2D2D]">Totale Ordine</span>
                  <span className="font-bold text-[#17E88F]">EUR {totale.toFixed(2)}</span>
                </div>
              </div>
              <textarea
                placeholder="Note aggiuntive (opzionale)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full p-3 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 resize-none"
              />
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              {!confirmed ? (
                <>
                  <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#22C55E]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2D2D2D]">Ordine pronto per la conferma</h3>
                    <p className="text-sm text-[#6B7280] mt-1">Verranno generate automaticamente le righe di picking</p>
                  </div>
                  <div className="bg-[#F7F9FC] rounded-xl p-4 w-full text-left space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Cliente</span>
                      <span className="font-medium">{selectedCliente?.ragione_sociale}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Totale</span>
                      <span className="font-bold text-[#17E88F]">EUR {totale.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-8 h-8 text-[#22C55E]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2D2D2D]">Ordine creato</h3>
                    <p className="text-sm text-[#6B7280] mt-1">Il picking è stato avviato automaticamente</p>
                  </div>
                </>
              )}
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
          {step < 5 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && !selectedCliente) ||
                (step === 2 && !selectedDest) ||
                (step === 3 && orderLines.length === 0)
              }
              className="px-5 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Avanti
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : !confirmed ? (
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="px-5 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-40"
            >
              <CheckCircle className="w-4 h-4" />
              {submitting ? 'Creazione...' : 'Conferma Ordine'}
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="px-5 py-2.5 bg-[#17E88F]/10 text-[#17E88F] rounded-xl hover:bg-[#17E88F]/20 transition-all text-sm font-medium"
            >
              Chiudi
            </button>
          )}
        </div>
      </div>
      <ClientFormModal
        open={isClientFormOpen}
        onClose={() => setIsClientFormOpen(false)}
        onSave={handleSaveClient}
        mode="create"
      />
    </div>
  );
}
