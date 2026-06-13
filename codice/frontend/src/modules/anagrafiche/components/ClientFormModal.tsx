import { useState, useEffect } from 'react';
import { MapPin, Star, Plus, Pencil, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { clientiApi } from '../../../api/clientiApi';
import type { Cliente, ClienteCreateRequest, ClienteUpdateRequest, DestinazioneCliente, DestinazioneUpdateRequest } from '../../../types/clienti';

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ClienteCreateRequest | ClienteUpdateRequest, id?: number) => Promise<Cliente | undefined | void>;
  initialData?: Cliente | null;
  mode: 'create' | 'edit';
}

interface FormState {
  ragione_sociale: string;
  piva_cf: string;
  email: string;
  telefono: string;
  attivo: boolean;
}

const EMPTY: FormState = {
  ragione_sociale: '',
  piva_cf: '',
  email: '',
  telefono: '',
  attivo: true,
};

interface NuovoIndirizzo {
  etichetta: string;
  indirizzo: string;
  cap: string;
  citta: string;
  provincia: string;
  paese: string;
  predefinita: boolean;
}

const EMPTY_INDIRIZZO: NuovoIndirizzo = {
  etichetta: '',
  indirizzo: '',
  cap: '',
  citta: '',
  provincia: '',
  paese: '',
  predefinita: false,
};

const formatDestinazione = (dest: DestinazioneCliente): string =>
  [dest.indirizzo, dest.cap, dest.citta, dest.provincia].filter(Boolean).join(', ') || '—';

interface EditIndirizzoForm {
  etichetta: string;
  indirizzo: string;
  cap: string;
  citta: string;
  provincia: string;
  paese: string;
}

const EMPTY_EDIT_FORM: EditIndirizzoForm = {
  etichetta: '',
  indirizzo: '',
  cap: '',
  citta: '',
  provincia: '',
  paese: '',
};

export function ClientFormModal({ open, onClose, onSave, initialData, mode }: ClientFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [destinazioni, setDestinazioni] = useState<DestinazioneCliente[]>([]);
  const [loadingDestinazioni, setLoadingDestinazioni] = useState(false);
  const [nuoviIndirizzi, setNuoviIndirizzi] = useState<NuovoIndirizzo[]>([]);
  const [editingDestId, setEditingDestId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditIndirizzoForm>(EMPTY_EDIT_FORM);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setForm({
          ragione_sociale: initialData.ragione_sociale,
          piva_cf: initialData.piva_cf ?? '',
          email: initialData.email ?? '',
          telefono: initialData.telefono ?? '',
          attivo: initialData.attivo,
        });
        loadDestinazioni(initialData.id);
      } else {
        setForm(EMPTY);
        setDestinazioni([]);
      }
      setNuoviIndirizzi([]);
      setErrors({});
    }
  }, [open, mode, initialData]);

  const loadDestinazioni = async (clienteId: number) => {
    setLoadingDestinazioni(true);
    try {
      setDestinazioni(await clientiApi.listDestinazioni(clienteId));
    } catch (err: any) {
      toast.error('Errore caricamento destinazioni', { description: err?.message });
    } finally {
      setLoadingDestinazioni(false);
    }
  };

  const handleSetDestinazionePredefinita = async (dest: DestinazioneCliente) => {
    if (!initialData) return;
    try {
      const altriPredefiniti = destinazioni.filter(d => d.id !== dest.id && d.predefinita);
      await Promise.all([
        clientiApi.updateDestinazione(initialData.id, dest.id, { predefinita: true }),
        ...altriPredefiniti.map(d => clientiApi.updateDestinazione(initialData.id, d.id, { predefinita: false })),
      ]);
      setDestinazioni(prev => prev.map(d => ({ ...d, predefinita: d.id === dest.id })));
      setNuoviIndirizzi(prev => prev.map(ind => ({ ...ind, predefinita: false })));
      toast.success('Indirizzo predefinito aggiornato');
    } catch (err: any) {
      toast.error('Aggiornamento fallito', { description: err?.message });
    }
  };

  const startEditDest = (dest: DestinazioneCliente) => {
    setEditingDestId(dest.id);
    setEditForm({
      etichetta: dest.etichetta ?? '',
      indirizzo: dest.indirizzo ?? '',
      cap: dest.cap ?? '',
      citta: dest.citta ?? '',
      provincia: dest.provincia ?? '',
      paese: dest.paese ?? '',
    });
  };

  const cancelEditDest = () => {
    setEditingDestId(null);
  };

  const updateEditForm = (field: keyof EditIndirizzoForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const saveEditDest = async (dest: DestinazioneCliente) => {
    if (!initialData) return;
    setSavingEdit(true);
    try {
      const payload: DestinazioneUpdateRequest = {
        etichetta: editForm.etichetta.trim(),
        indirizzo: editForm.indirizzo.trim(),
        cap: editForm.cap.trim(),
        citta: editForm.citta.trim(),
        provincia: editForm.provincia.trim(),
        paese: editForm.paese.trim(),
      };
      const updated = await clientiApi.updateDestinazione(initialData.id, dest.id, payload);
      setDestinazioni(prev => prev.map(d => (d.id === dest.id ? updated : d)));
      setEditingDestId(null);
      toast.success('Indirizzo aggiornato');
    } catch (err: any) {
      toast.error('Aggiornamento indirizzo fallito', { description: err?.message });
    } finally {
      setSavingEdit(false);
    }
  };

  const addIndirizzo = () => {
    setNuoviIndirizzi(prev => [...prev, { ...EMPTY_INDIRIZZO }]);
  };

  const updateIndirizzo = (index: number, field: keyof NuovoIndirizzo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNuoviIndirizzi(prev => prev.map((ind, i) => i === index ? { ...ind, [field]: value } : ind));
  };

  const toggleIndirizzoPredefinita = (index: number) => {
    setNuoviIndirizzi(prev => prev.map((ind, i) => ({ ...ind, predefinita: i === index ? !ind.predefinita : false })));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.ragione_sociale.trim()) {
      errs.ragione_sociale = 'La ragione sociale è obbligatoria';
    }
    if (mode === 'create' && !form.piva_cf.trim()) {
      errs.piva_cf = 'P. IVA / CF obbligatoria';
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Formato email non valido';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: ClienteCreateRequest | ClienteUpdateRequest = mode === 'create'
        ? {
            ragione_sociale: form.ragione_sociale.trim(),
            piva_cf: form.piva_cf.trim(),
            ...(form.email.trim() && { email: form.email.trim() }),
            ...(form.telefono.trim() && { telefono: form.telefono.trim() }),
          }
        : {
            ragione_sociale: form.ragione_sociale.trim(),
            ...(form.piva_cf.trim() && { piva_cf: form.piva_cf.trim() }),
            ...(form.email.trim() && { email: form.email.trim() }),
            ...(form.telefono.trim() && { telefono: form.telefono.trim() }),
            attivo: form.attivo,
          };
      const result = await onSave(payload, initialData?.id);
      const clienteId = result?.id ?? initialData?.id;

      if (clienteId !== undefined) {
        let nuovoPredefinitoCreato = false;
        for (const ind of nuoviIndirizzi) {
          const destPayload = {
            ...(ind.etichetta.trim() && { etichetta: ind.etichetta.trim() }),
            ...(ind.indirizzo.trim() && { indirizzo: ind.indirizzo.trim() }),
            ...(ind.cap.trim() && { cap: ind.cap.trim() }),
            ...(ind.citta.trim() && { citta: ind.citta.trim() }),
            ...(ind.provincia.trim() && { provincia: ind.provincia.trim() }),
            ...(ind.paese.trim() && { paese: ind.paese.trim() }),
            ...(ind.predefinita && { predefinita: true }),
          };
          if (Object.keys(destPayload).length === 0) continue;
          try {
            await clientiApi.createDestinazione(clienteId, destPayload);
            if (ind.predefinita) nuovoPredefinitoCreato = true;
          } catch (destErr: any) {
            toast.error('Errore salvataggio indirizzo', { description: destErr?.message });
          }
        }
        if (nuovoPredefinitoCreato) {
          const vecchioPredefinito = destinazioni.find(d => d.predefinita);
          if (vecchioPredefinito) {
            try {
              await clientiApi.updateDestinazione(clienteId, vecchioPredefinito.id, { predefinita: false });
            } catch {
              // non bloccante: il vecchio indirizzo resta segnato come predefinito
            }
          }
        }
        if (nuoviIndirizzi.length > 0) toast.success('Indirizzi di consegna salvati');
      }

      onClose();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const toggleAttivo = () => {
    setForm(prev => ({ ...prev, attivo: !prev.attivo }));
  };

  const inputClass = (field: keyof FormState) =>
    `w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-[#E5EAF2]'
    }`;

  const miniInputClass = 'w-full px-2.5 py-1.5 text-sm border border-[#E5EAF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all bg-white';

  return (
    <>
    <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#2D2D2D]">
            {mode === 'create' ? 'Nuovo Cliente' : 'Modifica Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-1">
          <div className="grid grid-cols-3 gap-3">

            <div className="col-span-3">
              <label className="block text-xs font-medium text-[#2D2D2D] mb-1">
                Ragione Sociale <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.ragione_sociale}
                onChange={set('ragione_sociale')}
                placeholder="Es. Officine Manzoni S.r.l."
                className={inputClass('ragione_sociale')}
              />
              {errors.ragione_sociale && (
                <p className="mt-1 text-xs text-red-500">{errors.ragione_sociale}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#2D2D2D] mb-1">P. IVA / CF {mode === 'create' && <span className="text-red-500">*</span>}</label>
              <input
                type="text"
                value={form.piva_cf}
                onChange={set('piva_cf')}
                placeholder="03456789012"
                className={`${inputClass('piva_cf')} font-mono`}
              />
              {errors.piva_cf && (
                <p className="mt-1 text-xs text-red-500">{errors.piva_cf}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#2D2D2D] mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="ordini@cliente.it"
                className={inputClass('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#2D2D2D] mb-1">Telefono</label>
              <input
                type="tel"
                value={form.telefono}
                onChange={set('telefono')}
                placeholder="035 456789"
                className={inputClass('telefono')}
              />
            </div>

            {mode === 'edit' && (
              <div className="col-span-3">
                <div className="flex items-center justify-between gap-4 px-3 py-2 border border-[#E5EAF2] rounded-xl bg-[#F7F9FC]">
                  <p className="text-sm font-medium text-[#2D2D2D]">
                    {form.attivo ? 'Cliente attivo' : 'Cliente disattivato'}
                  </p>
                  <button
                    type="button"
                    onClick={toggleAttivo}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center ${form.attivo ? 'bg-[#17E88F]' : 'bg-[#D1D5DB]'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${form.attivo ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
            )}

          </div>

          {mode === 'edit' && (loadingDestinazioni || destinazioni.length > 0) && (
            <div className="pt-3 border-t border-[#E5EAF2]">
              <label className="block text-xs font-medium text-[#2D2D2D] mb-1.5">Indirizzi di consegna</label>
              {loadingDestinazioni ? (
                <p className="text-xs text-[#6B7280]">Caricamento indirizzi...</p>
              ) : (
                <div className="space-y-1.5">
                  {destinazioni.map((dest) => {
                    const isPredefinita = dest.predefinita && !nuoviIndirizzi.some(ind => ind.predefinita);
                    if (editingDestId === dest.id) {
                      return (
                        <div key={dest.id} className="border border-[#17E88F] rounded-xl p-2.5 bg-[#F0FDF7] space-y-2">
                          <input
                            type="text"
                            value={editForm.etichetta}
                            onChange={updateEditForm('etichetta')}
                            placeholder="Etichetta (es. Sede, Magazzino...)"
                            className={miniInputClass}
                          />
                          <input
                            type="text"
                            value={editForm.indirizzo}
                            onChange={updateEditForm('indirizzo')}
                            placeholder="Via, numero"
                            className={miniInputClass}
                          />
                          <div className="grid grid-cols-4 gap-2">
                            <input
                              type="text"
                              value={editForm.cap}
                              onChange={updateEditForm('cap')}
                              placeholder="CAP"
                              className={miniInputClass}
                            />
                            <input
                              type="text"
                              value={editForm.citta}
                              onChange={updateEditForm('citta')}
                              placeholder="Città"
                              className={`${miniInputClass} col-span-2`}
                            />
                            <input
                              type="text"
                              value={editForm.provincia}
                              onChange={updateEditForm('provincia')}
                              placeholder="Prov."
                              className={miniInputClass}
                            />
                          </div>
                          <input
                            type="text"
                            value={editForm.paese}
                            onChange={updateEditForm('paese')}
                            placeholder="Paese"
                            className={miniInputClass}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelEditDest}
                              disabled={savingEdit}
                              title="Annulla"
                              className="p-1.5 rounded-lg border border-[#E5EAF2] bg-white text-[#6B7280] hover:bg-[#F7F9FC] transition-all disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => saveEditDest(dest)}
                              disabled={savingEdit}
                              title="Salva"
                              className="p-1.5 rounded-lg border border-[#17E88F] bg-[#17E88F] text-white hover:shadow transition-all disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={dest.id}
                        className={`flex items-center justify-between gap-2 px-3 py-1.5 border rounded-lg ${
                          isPredefinita ? 'border-[#17E88F] bg-[#F0FDF7]' : 'border-[#E5EAF2] bg-[#F7F9FC]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleSetDestinazionePredefinita(dest)}
                            title={isPredefinita ? 'Indirizzo predefinito' : 'Imposta come predefinito'}
                            className="flex-shrink-0"
                          >
                            <Star className={`w-3.5 h-3.5 ${isPredefinita ? 'text-[#17E88F] fill-current' : 'text-[#9CA3AF]'}`} />
                          </button>
                          <MapPin className="w-3.5 h-3.5 text-[#6B7280] flex-shrink-0" />
                          <p className={`text-xs truncate ${isPredefinita ? 'font-semibold text-[#0FA67A]' : 'text-[#2D2D2D]'}`}>
                            {dest.etichetta ? `${dest.etichetta} — ${formatDestinazione(dest)}` : formatDestinazione(dest)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditDest(dest)}
                            title="Modifica indirizzo"
                            className="p-1.5 rounded-lg border border-[#E5EAF2] bg-white text-[#6B7280] hover:bg-[#F7F9FC] transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="mt-1.5 text-xs text-[#9CA3AF]">Solo un indirizzo può essere predefinito.</p>
            </div>
          )}

          <div className="pt-3 border-t border-[#E5EAF2]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#2D2D2D]">Nuovi indirizzi di consegna</label>
              <button
                type="button"
                onClick={addIndirizzo}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#17E88F] hover:bg-[#F0FDF7] rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Aggiungi indirizzo
              </button>
            </div>

            {nuoviIndirizzi.length > 0 && (
              <div className="space-y-2">
                {nuoviIndirizzi.map((ind, index) => (
                  <div key={index} className="border border-[#E5EAF2] rounded-xl p-2.5 bg-[#F7F9FC] space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ind.etichetta}
                        onChange={updateIndirizzo(index, 'etichetta')}
                        placeholder="Etichetta (es. Sede, Magazzino...)"
                        className={`${miniInputClass} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleIndirizzoPredefinita(index)}
                        title="Imposta come predefinito"
                        className={`p-1.5 rounded-lg border transition-all flex-shrink-0 ${
                          ind.predefinita ? 'bg-[#F0FDF7] border-[#17E88F] text-[#17E88F]' : 'bg-white border-[#E5EAF2] text-[#9CA3AF]'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${ind.predefinita ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={ind.indirizzo}
                      onChange={updateIndirizzo(index, 'indirizzo')}
                      placeholder="Via Roma, 10"
                      className={miniInputClass}
                    />
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={ind.cap}
                        onChange={updateIndirizzo(index, 'cap')}
                        placeholder="CAP"
                        className={miniInputClass}
                      />
                      <input
                        type="text"
                        value={ind.citta}
                        onChange={updateIndirizzo(index, 'citta')}
                        placeholder="Città"
                        className={`${miniInputClass} col-span-2`}
                      />
                      <input
                        type="text"
                        value={ind.provincia}
                        onChange={updateIndirizzo(index, 'provincia')}
                        placeholder="Prov."
                        className={miniInputClass}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E5EAF2]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {mode === 'create' ? 'Crea Cliente' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
