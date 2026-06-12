import { useEffect, useState, useMemo } from 'react';
import {
  X, Package, MapPin, Hash, FileText, ArrowLeftRight,
  ArrowDownCircle, ArrowUpCircle, ArrowRightCircle,
  Plus, Minus, RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { movimentiStockApi } from '../../../api/movimentiStockApi';
import { prodottiApi } from '../../../api/prodottiApi';
import { magazzinoApi } from '../../../api/magazzinoApi';
import { giacenzeApi } from '../../../api/giacenzeApi';
import { acquistiApi } from '../../../api/acquistiApi';
import type { MovimentoTipo, Giacenza } from '../../../types/magazzino';

interface TipoConfig {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  activeBg: string;
  activeBorder: string;
  isSpostamento: boolean;
  needsNote: boolean;
}

const TIPI: Record<MovimentoTipo, TipoConfig> = {
  CARICO_ACQUISTO:    { label: 'Carico',       icon: ArrowDownCircle,  color: 'text-[#16A34A]', bg: 'bg-[#F0FDF4]', activeBg: 'bg-[#DCFCE7]', activeBorder: 'border-[#16A34A]', isSpostamento: false, needsNote: false },
  SCARICO_VENDITA:    { label: 'Scarico',       icon: ArrowUpCircle,    color: 'text-[#DC2626]', bg: 'bg-[#FEF2F2]', activeBg: 'bg-[#FEE2E2]', activeBorder: 'border-[#DC2626]', isSpostamento: false, needsNote: false },
  SPOSTAMENTO:        { label: 'Spostamento',   icon: ArrowRightCircle, color: 'text-[#1D4ED8]', bg: 'bg-[#EFF6FF]', activeBg: 'bg-[#DBEAFE]', activeBorder: 'border-[#1D4ED8]', isSpostamento: true,  needsNote: false },
  RETTIFICA_POSITIVA: { label: 'Rettifica +',   icon: Plus,             color: 'text-[#D97706]', bg: 'bg-[#FFFBEB]', activeBg: 'bg-[#FEF3C7]', activeBorder: 'border-[#D97706]', isSpostamento: false, needsNote: true  },
  RETTIFICA_NEGATIVA: { label: 'Rettifica −',   icon: Minus,            color: 'text-[#D97706]', bg: 'bg-[#FFFBEB]', activeBg: 'bg-[#FEF3C7]', activeBorder: 'border-[#D97706]', isSpostamento: false, needsNote: true  },
  RESO:               { label: 'Reso',           icon: RotateCcw,        color: 'text-[#7C3AED]', bg: 'bg-[#F5F3FF]', activeBg: 'bg-[#EDE9FE]', activeBorder: 'border-[#7C3AED]', isSpostamento: false, needsNote: false },
};

const TIPO_ORDER: MovimentoTipo[] = [
  'CARICO_ACQUISTO', 'SCARICO_VENDITA', 'SPOSTAMENTO',
  'RETTIFICA_POSITIVA', 'RETTIFICA_NEGATIVA', 'RESO',
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const EMPTY_FORM = {
  prodotto_id: '',
  ubicazione_id: '',
  ubicazione_da_id: '',
  ubicazione_a_id: '',
  quantita: '',
  riferimento: '',
  note: '',
};

export function NewMovementModal({ isOpen, onClose, onCreated }: Props) {
  const [tipo, setTipo] = useState<MovimentoTipo>('CARICO_ACQUISTO');
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [prodotti, setProdotti] = useState<{ id: number; sku: string; nome: string }[]>([]);
  const [prodottoIdsInRicezione, setProdottoIdsInRicezione] = useState<number[]>([]);
  const [tutteUbicazioni, setTutteUbicazioni] = useState<{ id: number; codice_composto: string }[]>([]);
  const [giacenzePerProdotto, setGiacenzePerProdotto] = useState<Giacenza[]>([]);
  const [loadingDati, setLoadingDati] = useState(false);
  const [loadingGiacenze, setLoadingGiacenze] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cfg = TIPI[tipo];

  // Ubicazioni con giacenza per il prodotto selezionato (SCARICO, SPOSTAMENTO da)
  // giacenze API: ubicazione_id (number), ubicazione (codice corto)
  // ubicazioni API: id (number), codice_composto (label completa)
  // Usiamo tutteUbicazioni come source unica per le label, filtrate per ID dalle giacenze
  const idConGiacenza = useMemo(() =>
    new Set(giacenzePerProdotto.filter((g) => g.quantita > 0).map((g) => g.ubicazione_id)),
    [giacenzePerProdotto]
  );

  const ubicazioniDestinazione = tutteUbicazioni;
  const ubicazioniOrigine = useMemo(() =>
    tutteUbicazioni.filter((u) => idConGiacenza.has(u.id)),
    [tutteUbicazioni, idConGiacenza]
  );
  const prodottiVisibili = useMemo(() => {
    if (tipo !== 'CARICO_ACQUISTO') {
      return prodotti;
    }
    const ids = new Set(prodottoIdsInRicezione);
    return prodotti.filter((p) => ids.has(p.id));
  }, [prodotti, prodottoIdsInRicezione, tipo]);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingDati(true);
    Promise.all([prodottiApi.list(), magazzinoApi.listUbicazioni(), acquistiApi.list({ stato: 'IN_RICEZIONE' })])
      .then(async ([p, u, ordiniInRicezione]) => {
        const dettagli = await Promise.all(
          ordiniInRicezione.map((ordine) => acquistiApi.getById(ordine.id))
        );
        const ids = Array.from(new Set(
          dettagli.flatMap((dettaglio) => dettaglio.righe.map((riga) => Number(riga.prodotto_id)))
        ));
        setProdotti(p);
        setTutteUbicazioni(u);
        setProdottoIdsInRicezione(ids);
      })
      .catch(() => toast.error('Errore caricamento dati'))
      .finally(() => setLoadingDati(false));
  }, [isOpen]);

  useEffect(() => {
    if (!form.prodotto_id) return;
    const prodottoId = parseInt(form.prodotto_id, 10);
    if (Number.isNaN(prodottoId)) return;
    if (prodottiVisibili.some((p) => p.id === prodottoId)) return;
    setForm((prev) => ({
      ...prev,
      prodotto_id: '',
      ubicazione_id: '',
      ubicazione_da_id: '',
      ubicazione_a_id: '',
    }));
  }, [form.prodotto_id, prodottiVisibili]);

  // Ricarica giacenze ogni volta che cambia il prodotto selezionato
  useEffect(() => {
    const prodottoId = parseInt(form.prodotto_id);
    if (!form.prodotto_id || isNaN(prodottoId)) {
      setGiacenzePerProdotto([]);
      return;
    }
    setLoadingGiacenze(true);
    giacenzeApi.getByProdottoId(prodottoId)
      .then(setGiacenzePerProdotto)
      .catch(() => setGiacenzePerProdotto([]))
      .finally(() => setLoadingGiacenze(false));
  }, [form.prodotto_id]);

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setTipo('CARICO_ACQUISTO');
    setProdottoIdsInRicezione([]);
    onClose();
  };

  const handleChangeTipo = (t: MovimentoTipo) => {
    setTipo(t);
    setForm(prev => ({ ...prev, ubicazione_id: '', ubicazione_da_id: '', ubicazione_a_id: '' }));
    setErrors({});
  };

  const set = (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

  const validate = (): boolean => {
    const errs: Partial<typeof EMPTY_FORM> = {};
    if (!form.prodotto_id) errs.prodotto_id = 'Seleziona un prodotto';
    if (!form.quantita || parseInt(form.quantita) < 1) errs.quantita = 'Quantità minima 1';

    const needsGiacenza = tipo === 'SCARICO_VENDITA' || tipo === 'RETTIFICA_NEGATIVA';
    const ubicazioneOrId = cfg.isSpostamento ? form.ubicazione_da_id : form.ubicazione_id;

    if (cfg.isSpostamento) {
      if (!form.ubicazione_da_id) errs.ubicazione_da_id = 'Seleziona ubicazione di origine';
      if (!form.ubicazione_a_id)  errs.ubicazione_a_id  = 'Seleziona ubicazione di destinazione';
      if (form.ubicazione_da_id && form.ubicazione_a_id && form.ubicazione_da_id === form.ubicazione_a_id)
        errs.ubicazione_a_id = 'Le ubicazioni devono essere diverse';
      // Verifica giacenza sull'origine
      if (form.ubicazione_da_id && form.prodotto_id) {
        const giacenza = giacenzePerProdotto.find(
          (g) => String(g.ubicazione_id) === form.ubicazione_da_id
        );
        if (!giacenza || giacenza.quantita <= 0) {
          errs.ubicazione_da_id = 'Nessuna giacenza disponibile in questa ubicazione';
        } else if (parseInt(form.quantita) > giacenza.quantita) {
          errs.quantita = `Quantità massima disponibile: ${giacenza.quantita}`;
        }
      }
    } else {
      if (!form.ubicazione_id) errs.ubicazione_id = 'Seleziona un\'ubicazione';
      // Per SCARICO e RETTIFICA_NEGATIVA verifica giacenza sufficiente
      if (needsGiacenza && form.ubicazione_id && form.prodotto_id) {
        const giacenza = giacenzePerProdotto.find(
          (g) => String(g.ubicazione_id) === form.ubicazione_id
        );
        if (!giacenza || giacenza.quantita <= 0) {
          errs.ubicazione_id = 'Nessuna giacenza disponibile in questa ubicazione';
        } else if (parseInt(form.quantita) > giacenza.quantita) {
          errs.quantita = `Quantità massima disponibile: ${giacenza.quantita}`;
        }
      }
    }

    if (cfg.needsNote && !form.note.trim()) errs.note = 'Note obbligatorie per le rettifiche';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const base = {
        prodotto_id: parseInt(form.prodotto_id),
        quantita: parseInt(form.quantita),
        movimento_tipo: tipo,
        riferimento: form.riferimento.trim() || undefined,
        note: form.note.trim() || undefined,
      };
      const body = cfg.isSpostamento
        ? { ...base, ubicazione_da_id: parseInt(form.ubicazione_da_id), ubicazione_a_id: parseInt(form.ubicazione_a_id) }
        : { ...base, ubicazione_id: parseInt(form.ubicazione_id) };

      await movimentiStockApi.create(body);
      toast.success('Movimento registrato');
      handleClose();
      onCreated?.();
    } catch (err: any) {
      const msg = err?.code === 'INSUFFICIENT_STOCK'
        ? 'Giacenza insufficiente'
        : err?.message ?? 'Errore durante il salvataggio';
      toast.error('Operazione fallita', { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = (field: keyof typeof EMPTY_FORM) =>
    `w-full h-11 px-4 bg-[#F7F9FC] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-[#E5EAF2]'
    }`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5EAF2] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#17E88F] to-[#0FA67A] rounded-xl flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#2D2D2D]">Nuovo Movimento Stock</h2>
              <p className="text-xs text-[#9CA3AF]">Seleziona tipo e compila i dati</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center hover:bg-[#F7F9FC] rounded-xl transition-all">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">

          {/* Tipo movimento */}
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-3">Tipo movimento</label>
            <div className="grid grid-cols-3 gap-2">
              {TIPO_ORDER.map(t => {
                const c = TIPI[t];
                const Icon = c.icon;
                const active = tipo === t;
                return (
                  <button
                    key={t}
                    onClick={() => handleChangeTipo(t)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      active
                        ? `${c.activeBg} ${c.activeBorder} ${c.color}`
                        : `${c.bg} border-transparent ${c.color} opacity-60 hover:opacity-100`
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {loadingDati ? (
            <div className="text-sm text-[#9CA3AF] text-center py-4">Caricamento dati…</div>
          ) : (
            <>
              {/* Prodotto */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-1.5">
                  <Package className="w-4 h-4 text-[#9CA3AF]" /> Prodotto
                </label>
                <select value={form.prodotto_id} onChange={set('prodotto_id')} className={inputCls('prodotto_id')}>
                  <option value="">Seleziona prodotto…</option>
                  {prodottiVisibili.map(p => (
                    <option key={p.id} value={p.id}>{p.sku} — {p.nome}</option>
                  ))}
                </select>
                {errors.prodotto_id && <p className="mt-1 text-xs text-red-500">{errors.prodotto_id}</p>}
                {tipo === 'CARICO_ACQUISTO' && !loadingDati && prodottiVisibili.length === 0 && (
                  <p className="mt-1 text-xs text-[#F59E0B]">Nessun prodotto presente in ordini acquisto in ricezione</p>
                )}
              </div>

              {/* Ubicazioni — condizionale */}
              {cfg.isSpostamento ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-1.5">
                      <MapPin className="w-4 h-4 text-[#9CA3AF]" /> Origine
                    </label>
                    <select value={form.ubicazione_da_id} onChange={set('ubicazione_da_id')} className={inputCls('ubicazione_da_id')} disabled={loadingGiacenze}>
                      <option value="">Seleziona…</option>
                      {ubicazioniOrigine.map(u => {
                        const g = giacenzePerProdotto.find(x => x.ubicazione_id === u.id);
                        return <option key={u.id} value={u.id}>{u.codice_composto} (disp. {g?.quantita ?? 0})</option>;
                      })}
                    </select>
                    {!loadingGiacenze && form.prodotto_id && ubicazioniOrigine.length === 0 && (
                      <p className="mt-1 text-xs text-[#F59E0B]">Nessuna giacenza per questo prodotto</p>
                    )}
                    {errors.ubicazione_da_id && <p className="mt-1 text-xs text-red-500">{errors.ubicazione_da_id}</p>}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-1.5">
                      <MapPin className="w-4 h-4 text-[#17E88F]" /> Destinazione
                    </label>
                    <select value={form.ubicazione_a_id} onChange={set('ubicazione_a_id')} className={inputCls('ubicazione_a_id')}>
                      <option value="">Seleziona…</option>
                      {ubicazioniDestinazione.map(u => (
                        <option key={u.id} value={u.id}>{u.codice_composto}</option>
                      ))}
                    </select>
                    {errors.ubicazione_a_id && <p className="mt-1 text-xs text-red-500">{errors.ubicazione_a_id}</p>}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-1.5">
                    <MapPin className="w-4 h-4 text-[#9CA3AF]" /> Ubicazione
                  </label>
                  <select
                    value={form.ubicazione_id}
                    onChange={set('ubicazione_id')}
                    className={inputCls('ubicazione_id')}
                    disabled={(tipo === 'SCARICO_VENDITA' || tipo === 'RETTIFICA_NEGATIVA') && loadingGiacenze}
                  >
                    <option value="">Seleziona…</option>
                    {(tipo === 'SCARICO_VENDITA' || tipo === 'RETTIFICA_NEGATIVA'
                      ? ubicazioniOrigine
                      : ubicazioniDestinazione
                    ).map(u => {
                      const g = giacenzePerProdotto.find(x => x.ubicazione_id === u.id);
                      const showDisp = tipo === 'SCARICO_VENDITA' || tipo === 'RETTIFICA_NEGATIVA';
                      return (
                        <option key={u.id} value={u.id}>
                          {u.codice_composto}{showDisp && g ? ` (disp. ${g.quantita})` : ''}
                        </option>
                      );
                    })}
                  </select>
                  {(tipo === 'SCARICO_VENDITA' || tipo === 'RETTIFICA_NEGATIVA') && !loadingGiacenze && form.prodotto_id && ubicazioniOrigine.length === 0 && (
                    <p className="mt-1 text-xs text-[#F59E0B]">Nessuna giacenza per questo prodotto</p>
                  )}
                  {errors.ubicazione_id && <p className="mt-1 text-xs text-red-500">{errors.ubicazione_id}</p>}
                </div>
              )}

              {/* Quantità */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-1.5">
                  <Hash className="w-4 h-4 text-[#9CA3AF]" /> Quantità
                  {(() => {
                    const ubicId = cfg.isSpostamento ? form.ubicazione_da_id : form.ubicazione_id;
                    const g = ubicId ? giacenzePerProdotto.find(x => String(x.ubicazione_id) === ubicId) : null;
                    const needsCheck = cfg.isSpostamento || tipo === 'SCARICO_VENDITA' || tipo === 'RETTIFICA_NEGATIVA';
                    return needsCheck && g
                      ? <span className="ml-auto text-xs text-[#6B7280] font-normal">disponibile: <strong className="text-[#2D2D2D]">{g.quantita}</strong></span>
                      : null;
                  })()}
                </label>
                <input
                  type="number"
                  min={1}
                  max={(() => {
                    const ubicId = cfg.isSpostamento ? form.ubicazione_da_id : form.ubicazione_id;
                    const g = ubicId ? giacenzePerProdotto.find(x => String(x.ubicazione_id) === ubicId) : null;
                    const needsCheck = cfg.isSpostamento || tipo === 'SCARICO_VENDITA' || tipo === 'RETTIFICA_NEGATIVA';
                    return needsCheck && g ? g.quantita : undefined;
                  })()}
                  value={form.quantita}
                  onChange={set('quantita')}
                  placeholder="0"
                  className={inputCls('quantita')}
                />
                {errors.quantita && <p className="mt-1 text-xs text-red-500">{errors.quantita}</p>}
              </div>

              {/* Riferimento (sempre opzionale) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-1.5">
                  <FileText className="w-4 h-4 text-[#9CA3AF]" />
                  Riferimento <span className="text-[#9CA3AF] font-normal text-xs">(opzionale)</span>
                </label>
                <input
                  type="text" value={form.riferimento} onChange={set('riferimento')}
                  placeholder="es. ordine_acquisto:42"
                  className="w-full h-11 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all"
                />
              </div>

              {/* Note — obbligatorie per rettifiche, opzionali altrimenti */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-1.5">
                  <FileText className="w-4 h-4 text-[#9CA3AF]" />
                  Note
                  {cfg.needsNote
                    ? <span className="text-red-500 text-xs">*obbligatorie per rettifiche</span>
                    : <span className="text-[#9CA3AF] font-normal text-xs">(opzionale)</span>
                  }
                </label>
                <textarea
                  rows={3} value={form.note} onChange={set('note')}
                  placeholder={cfg.needsNote ? 'Motivo della rettifica (obbligatorio)…' : 'Aggiungi note…'}
                  className={`w-full px-4 py-3 bg-[#F7F9FC] border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all ${
                    errors.note ? 'border-red-400 bg-red-50' : 'border-[#E5EAF2]'
                  }`}
                />
                {errors.note && <p className="mt-1 text-xs text-red-500">{errors.note}</p>}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E5EAF2] flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] text-sm transition-all"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loadingDati}
            className="px-5 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-sm disabled:opacity-60"
          >
            {submitting && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            Registra movimento
          </button>
        </div>
      </div>
    </div>
  );
}
