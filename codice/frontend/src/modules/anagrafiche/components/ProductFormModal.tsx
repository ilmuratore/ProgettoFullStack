import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import type { ProdottoListino, ProdottoCreateRequest, ProdottoUpdateRequest } from '../../../types/prodotti';


interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProdottoCreateRequest | ProdottoUpdateRequest, id?: number) => Promise<void>;
  initialData?: ProdottoListino | null;
  mode: 'create' | 'edit';
}


interface FormState {
  nome: string;
  sku: string;
  prezzo: string; 
}
const EMPTY_FORM: FormState = { nome: '', sku: '', prezzo: '' };


export function ProductFormModal({
  open,
  onClose,
  onSave,
  initialData,
  mode,
}: ProductFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setForm({
          nome: initialData.nome,
          sku: initialData.sku,
          prezzo: String(initialData.prezzo),
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [open, mode, initialData]);


  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};

    if (!form.nome.trim()) {
      errs.nome = 'Il nome è obbligatorio';
    }
    if (!form.sku.trim()) {
      errs.sku = 'Lo SKU è obbligatorio';
    }
    const prezzoNum = parseFloat(form.prezzo.replace(',', '.'));
    if (!form.prezzo.trim()) {
      errs.prezzo = 'Il prezzo è obbligatorio';
    } else if (isNaN(prezzoNum) || prezzoNum <= 0) {
      errs.prezzo = 'Il prezzo deve essere un numero positivo';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const prezzoNum = parseFloat(form.prezzo.replace(',', '.'));

    setLoading(true);
    try {
      if (mode === 'create') {
        const payload: ProdottoCreateRequest = {
          nome: form.nome.trim(),
          sku: form.sku.trim(),
          prezzo: prezzoNum,
        };
        await onSave(payload);
      } else {
        const payload: ProdottoUpdateRequest = {
          nome: form.nome.trim(),
          sku: form.sku.trim(),
          prezzo: prezzoNum,
        };
        await onSave(payload, initialData?.id);
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


  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2D2D2D]">
            {mode === 'create' ? 'Nuovo Prodotto' : 'Modifica Prodotto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
              Nome Prodotto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={set('nome')}
              placeholder="Es. Valvola a sfera 1/2&quot;"
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all ${
                errors.nome ? 'border-red-400 bg-red-50' : 'border-[#E5EAF2]'
              }`}
            />
            {errors.nome && (
              <p className="mt-1 text-xs text-red-500">{errors.nome}</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all font-mono ${
                errors.sku ? 'border-red-400 bg-red-50' : 'border-[#E5EAF2]'
              }`}
            />
            {errors.sku && (
              <p className="mt-1 text-xs text-red-500">{errors.sku}</p>
            )}
            <p className="mt-1 text-xs text-[#6B7280]">
              Lo SKU deve essere univoco. I prodotti eliminati liberano lo SKU dopo una nuova creazione.
            </p>
          </div>

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
            {errors.prezzo && (
              <p className="mt-1 text-xs text-red-500">{errors.prezzo}</p>
            )}
            {mode === 'edit' && (
              <p className="mt-1 text-xs text-[#6B7280]">
                La data di aggiornamento prezzo viene registrata automaticamente dal sistema.
              </p>
            )}
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