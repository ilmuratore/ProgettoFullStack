import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import type { ProdottoListino, ProdottoCreateRequest, ProdottoUpdateRequest } from '../../../types/prodotti';
import type { Categoria } from '../../../types/categorie';

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProdottoCreateRequest | ProdottoUpdateRequest, id?: number) => Promise<void>;
  initialData?: ProdottoListino | null;
  mode: 'create' | 'edit';
  /** Lista categorie per il select — passata dal componente padre che le ha già caricate */
  categorie?: Categoria[];
}

interface FormState {
  nome: string;
  sku: string;
  prezzo: string;
  categoria_id: string; // stringa vuota = nessuna categoria selezionata
}

const EMPTY_FORM: FormState = { nome: '', sku: '', prezzo: '', categoria_id: '' };

export function ProductFormModal({
  open,
  onClose,
  onSave,
  initialData,
  mode,
  categorie = [],
}: ProductFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (mode === 'edit' && initialData) {
      setForm({
        nome: initialData.nome,
        sku: initialData.sku,
        prezzo: String(initialData.prezzo),
        // ProdottoListino non contiene categoria_id: l'utente può solo aggiungerne una.
        // Il campo parte vuoto ("nessuna modifica") — la categoria esistente è preservata.
        categoria_id: '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, mode, initialData]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.nome.trim()) errs.nome = 'Il nome è obbligatorio';
    if (!form.sku.trim()) errs.sku = 'Lo SKU è obbligatorio';
    const prezzoNum = parseFloat(form.prezzo.replace(',', '.'));
    if (!form.prezzo.trim()) errs.prezzo = 'Il prezzo è obbligatorio';
    else if (isNaN(prezzoNum) || prezzoNum <= 0) errs.prezzo = 'Il prezzo deve essere un numero positivo';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const prezzoNum = parseFloat(form.prezzo.replace(',', '.'));
    const categoriaId = form.categoria_id !== '' ? parseInt(form.categoria_id, 10) : undefined;

    setLoading(true);
    try {
      if (mode === 'create') {
        const payload: ProdottoCreateRequest = {
          nome: form.nome.trim(),
          sku: form.sku.trim(),
          prezzo: prezzoNum,
          ...(categoriaId !== undefined && { categoria_id: categoriaId }),
        };
        await onSave(payload);
      } else {
        const payload: ProdottoUpdateRequest = {
          nome: form.nome.trim(),
          sku: form.sku.trim(),
          prezzo: prezzoNum,
          // Invia categoria_id solo se l'utente ha selezionato qualcosa
          ...(categoriaId !== undefined && { categoria_id: categoriaId }),
        };
        await onSave(payload, initialData?.id);
      }
      onClose();
    } catch {
      // errore già toastato dal chiamante
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormState]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const inputClass = (err?: string) =>
    `w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all ${
      err ? 'border-red-400 bg-red-50' : 'border-[#E5EAF2]'
    }`;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2D2D2D]">
            {mode === 'create' ? 'Nuovo Prodotto' : 'Modifica Prodotto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
              Nome Prodotto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={set('nome')}
              placeholder='Es. Valvola a sfera 1/2"'
              className={inputClass(errors.nome)}
            />
            {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome}</p>}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.sku}
              onChange={set('sku')}
              placeholder="Es. VLV-001"
              className={`${inputClass(errors.sku)} font-mono`}
            />
            {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku}</p>}
            <p className="mt-1 text-xs text-[#6B7280]">
              Lo SKU deve essere univoco.
            </p>
          </div>

          {/* Prezzo */}
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
              Prezzo (€) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">€</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.prezzo}
                onChange={set('prezzo')}
                placeholder="0.00"
                className={`w-full pl-7 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all ${
                  errors.prezzo ? 'border-red-400 bg-red-50' : 'border-[#E5EAF2]'
                }`}
              />
            </div>
            {errors.prezzo && <p className="mt-1 text-xs text-red-500">{errors.prezzo}</p>}
            {mode === 'edit' && (
              <p className="mt-1 text-xs text-[#6B7280]">
                La data di aggiornamento prezzo viene registrata automaticamente.
              </p>
            )}
          </div>

          {/* Categoria */}
          {categorie.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Categoria
                <span className="ml-1 text-xs font-normal text-[#9CA3AF]">(opzionale)</span>
              </label>
              <select
                value={form.categoria_id}
                onChange={set('categoria_id')}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all"
              >
                <option value="">
                  {mode === 'edit' ? '— Nessuna modifica alla categoria —' : '— Nessuna categoria —'}
                </option>
                {categorie.map(c => (
                  <option key={c.id} value={String(c.id)}>
                    {c.categoria_padre_id !== null ? `  ↳ ${c.nome}` : c.nome}
                  </option>
                ))}
              </select>
              {mode === 'edit' && (
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  Seleziona una categoria per cambiarla. Lascia vuoto per mantenerla invariata.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5EAF2]">
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
              {mode === 'create' ? 'Crea Prodotto' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
