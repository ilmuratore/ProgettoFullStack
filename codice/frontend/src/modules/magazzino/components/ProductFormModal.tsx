import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import type { Prodotto, ProdottoCreateRequest, ProdottoUpdateRequest } from '../../../types/prodotti';
import type { Categoria } from '../../../types/categorie';

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProdottoCreateRequest | ProdottoUpdateRequest, id?: number) => Promise<void>;
  initialData?: Prodotto | null;
  mode: 'create' | 'edit';
  categorie?: Categoria[];
}

interface FormState {
  nome: string;
  sku: string;
  descrizione: string;
  prezzo: string;
  categoria_id: string;
  unita_misura: string;
  peso_kg: string;
  scorta_minima: string;
}

const EMPTY_FORM: FormState = {
  nome: '',
  sku: '',
  descrizione: '',
  prezzo: '',
  categoria_id: '',
  unita_misura: '',
  peso_kg: '',
  scorta_minima: '0',
};

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
        descrizione: initialData.descrizione ?? '',
        prezzo: String(initialData.prezzo),
        categoria_id: initialData.categoria_id !== null ? String(initialData.categoria_id) : '',
        unita_misura: initialData.unita_misura ?? '',
        peso_kg: initialData.peso_kg !== null ? String(initialData.peso_kg) : '',
        scorta_minima: String(initialData.scorta_minima),
      });
      return;
    }

    setForm(EMPTY_FORM);
  }, [open, mode, initialData]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};

    if (!form.nome.trim()) errs.nome = 'Il nome e obbligatorio';
    if (!form.sku.trim()) errs.sku = 'Lo SKU e obbligatorio';

    const prezzoNum = parseFloat(form.prezzo.replace(',', '.'));
    if (!form.prezzo.trim()) {
      errs.prezzo = 'Il prezzo e obbligatorio';
    } else if (Number.isNaN(prezzoNum) || prezzoNum <= 0) {
      errs.prezzo = 'Il prezzo deve essere un numero positivo';
    }

    if (form.peso_kg.trim()) {
      const pesoNum = parseFloat(form.peso_kg.replace(',', '.'));
      if (Number.isNaN(pesoNum) || pesoNum < 0) {
        errs.peso_kg = 'Il peso deve essere un numero maggiore o uguale a zero';
      }
    }

    const scortaMinima = Number(form.scorta_minima);
    if (form.scorta_minima.trim() === '') {
      errs.scorta_minima = 'La scorta minima e obbligatoria';
    } else if (!Number.isInteger(scortaMinima) || scortaMinima < 0) {
      errs.scorta_minima = 'La scorta minima deve essere un intero maggiore o uguale a zero';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const prezzo = parseFloat(form.prezzo.replace(',', '.'));
    const pesoKg = form.peso_kg.trim() ? parseFloat(form.peso_kg.replace(',', '.')) : undefined;
    const categoriaId = form.categoria_id !== '' ? parseInt(form.categoria_id, 10) : undefined;
    const scortaMinima = parseInt(form.scorta_minima, 10);

    const payload = {
      nome: form.nome.trim(),
      sku: form.sku.trim(),
      scorta_minima: scortaMinima,
      prezzo,
      ...(form.descrizione.trim() && { descrizione: form.descrizione.trim() }),
      ...(categoriaId !== undefined && { categoria_id: categoriaId }),
      ...(form.unita_misura.trim() && { unita_misura: form.unita_misura.trim() }),
      ...(pesoKg !== undefined && { peso_kg: pesoKg }),
    };

    setLoading(true);
    try {
      if (mode === 'create') {
        await onSave(payload as ProdottoCreateRequest);
      } else {
        await onSave(payload as ProdottoUpdateRequest, initialData?.id);
      }
      onClose();
    } catch {
      // Errore gia gestito dal chiamante.
    } finally {
      setLoading(false);
    }
  };

  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

  const inputClass = (err?: string) =>
    `w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all ${
      err ? 'border-red-400 bg-red-50' : 'border-[#E5EAF2]'
    }`;

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        if (!value && !loading) onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2D2D2D]">
            {mode === 'create' ? 'Nuovo Prodotto' : 'Modifica Prodotto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="mt-1 text-xs text-[#6B7280]">Lo SKU deve essere univoco.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Descrizione
                <span className="ml-1 text-xs font-normal text-[#9CA3AF]">(opzionale)</span>
              </label>
              <textarea
                value={form.descrizione}
                onChange={set('descrizione')}
                placeholder="Descrizione del prodotto"
                rows={4}
                className={`${inputClass(errors.descrizione)} resize-none`}
              />
              {errors.descrizione && <p className="mt-1 text-xs text-red-500">{errors.descrizione}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Prezzo (EUR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">EUR</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.prezzo}
                  onChange={set('prezzo')}
                  placeholder="0.00"
                  className={`w-full pl-12 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all ${
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
                <option value="">- Nessuna categoria -</option>
                {categorie.map(categoria => (
                  <option key={categoria.id} value={String(categoria.id)}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Unita di misura
                <span className="ml-1 text-xs font-normal text-[#9CA3AF]">(opzionale)</span>
              </label>
              <input
                type="text"
                value={form.unita_misura}
                onChange={set('unita_misura')}
                placeholder="Es. pz, kg, m, lt"
                className={inputClass(errors.unita_misura)}
              />
              {errors.unita_misura && <p className="mt-1 text-xs text-red-500">{errors.unita_misura}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Peso (kg)
                <span className="ml-1 text-xs font-normal text-[#9CA3AF]">(opzionale)</span>
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={form.peso_kg}
                onChange={set('peso_kg')}
                placeholder="0.000"
                className={inputClass(errors.peso_kg)}
              />
              {errors.peso_kg && <p className="mt-1 text-xs text-red-500">{errors.peso_kg}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Scorta minima <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.scorta_minima}
                onChange={set('scorta_minima')}
                placeholder="0"
                className={inputClass(errors.scorta_minima)}
              />
              {errors.scorta_minima && <p className="mt-1 text-xs text-red-500">{errors.scorta_minima}</p>}
            </div>
          </div>

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
