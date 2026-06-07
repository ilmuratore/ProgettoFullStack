import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import type { Fornitore, FornitoreCreateRequest, FornitoreUpdateRequest } from '../../../types/fornitori';

interface SupplierFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: FornitoreCreateRequest | FornitoreUpdateRequest, id?: number) => Promise<void>;
  initialData?: Fornitore | null;
  mode: 'create' | 'edit';
}

interface FormState {
  ragione_sociale: string;
  piva: string;
  indirizzo: string;
  email: string;
  telefono: string;
  sito_web: string;
  descrizione_aziendale: string;
}

const EMPTY: FormState = {
  ragione_sociale: '',
  piva: '',
  indirizzo: '',
  email: '',
  telefono: '',
  sito_web: '',
  descrizione_aziendale: '',
};

export function SupplierFormModal({ open, onClose, onSave, initialData, mode }: SupplierFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setForm({
          ragione_sociale: initialData.ragione_sociale,
          piva: initialData.piva ?? '',
          indirizzo: initialData.indirizzo ?? '',
          email: initialData.email ?? '',
          telefono: initialData.telefono ?? '',
          sito_web: initialData.sito_web ?? '',
          descrizione_aziendale: initialData.descrizione_aziendale ?? '',
        });
      } else {
        setForm(EMPTY);
      }
      setErrors({});
    }
  }, [open, mode, initialData]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.ragione_sociale.trim()) {
      errs.ragione_sociale = 'La ragione sociale è obbligatoria';
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
      const payload: FornitoreCreateRequest | FornitoreUpdateRequest = {
        ragione_sociale: form.ragione_sociale.trim(),
        ...(form.piva.trim() && { piva: form.piva.trim() }),
        ...(form.indirizzo.trim() && { indirizzo: form.indirizzo.trim() }),
        ...(form.email.trim() && { email: form.email.trim() }),
        ...(form.telefono.trim() && { telefono: form.telefono.trim() }),
        ...(form.sito_web.trim() && { sito_web: form.sito_web.trim() }),
        ...(form.descrizione_aziendale.trim() && { descrizione_aziendale: form.descrizione_aziendale.trim() }),
      };
      await onSave(payload, initialData?.id);
      onClose();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const inputClass = (field: keyof FormState) =>
    `w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-[#E5EAF2]'
    }`;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2D2D2D]">
            {mode === 'create' ? 'Nuovo Fornitore' : 'Modifica Fornitore'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">

            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Ragione Sociale <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.ragione_sociale}
                onChange={set('ragione_sociale')}
                placeholder="Es. Tecnofluid S.r.l."
                className={inputClass('ragione_sociale')}
              />
              {errors.ragione_sociale && (
                <p className="mt-1 text-xs text-red-500">{errors.ragione_sociale}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Partita IVA
              </label>
              <input
                type="text"
                value={form.piva}
                onChange={set('piva')}
                placeholder="02345678901"
                className={`${inputClass('piva')} font-mono`}
              />
              <p className="mt-1 text-xs text-[#6B7280]">Opzionale per fornitori esteri</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Indirizzo
              </label>
              <input
                type="text"
                value={form.indirizzo}
                onChange={set('indirizzo')}
                placeholder="Via dell'Industria 22, 20090 Segrate MI"
                className={inputClass('indirizzo')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="info@fornitore.it"
                className={inputClass('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Telefono
              </label>
              <input
                type="tel"
                value={form.telefono}
                onChange={set('telefono')}
                placeholder="02 9876543"
                className={inputClass('telefono')}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Sito Web
              </label>
              <input
                type="url"
                value={form.sito_web}
                onChange={set('sito_web')}
                placeholder="https://www.fornitore.it"
                className={inputClass('sito_web')}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Descrizione Aziendale
              </label>
              <textarea
                rows={3}
                value={form.descrizione_aziendale}
                onChange={set('descrizione_aziendale')}
                placeholder="Descrizione dell'attività aziendale..."
                className={`${inputClass('descrizione_aziendale')} resize-none`}
              />
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
              {mode === 'create' ? 'Crea Fornitore' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}