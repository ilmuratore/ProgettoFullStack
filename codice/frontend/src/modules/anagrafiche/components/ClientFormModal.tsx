import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import type { Cliente, ClienteCreateRequest, ClienteUpdateRequest } from '../../../types/clienti';

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ClienteCreateRequest | ClienteUpdateRequest, id?: number) => Promise<void>;
  initialData?: Cliente | null;
  mode: 'create' | 'edit';
}

interface FormState {
  ragione_sociale: string;
  piva_cf: string;
  email: string;
  telefono: string;
}

const EMPTY: FormState = {
  ragione_sociale: '',
  piva_cf: '',
  email: '',
  telefono: '',
};

export function ClientFormModal({ open, onClose, onSave, initialData, mode }: ClientFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setForm({
          ragione_sociale: initialData.ragione_sociale,
          piva_cf: initialData.piva_cf ?? '',
          email: initialData.email ?? '',
          telefono: initialData.telefono ?? '',
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
      const payload: ClienteCreateRequest | ClienteUpdateRequest = {
        ragione_sociale: form.ragione_sociale.trim(),
        ...(form.piva_cf.trim() && { piva_cf: form.piva_cf.trim() }),
        ...(form.email.trim() && { email: form.email.trim() }),
        ...(form.telefono.trim() && { telefono: form.telefono.trim() }),
      };
      await onSave(payload, initialData?.id);
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

  const inputClass = (field: keyof FormState) =>
    `w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-[#E5EAF2]'
    }`;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2D2D2D]">
            {mode === 'create' ? 'Nuovo Cliente' : 'Modifica Cliente'}
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
                placeholder="Es. Officine Manzoni S.r.l."
                className={inputClass('ragione_sociale')}
              />
              {errors.ragione_sociale && (
                <p className="mt-1 text-xs text-red-500">{errors.ragione_sociale}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                P. IVA / Codice Fiscale
              </label>
              <input
                type="text"
                value={form.piva_cf}
                onChange={set('piva_cf')}
                placeholder="03456789012"
                className={`${inputClass('piva_cf')} font-mono`}
              />
              <p className="mt-1 text-xs text-[#6B7280]">Opzionale per clienti esteri</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Email</label>
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
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Telefono</label>
              <input
                type="tel"
                value={form.telefono}
                onChange={set('telefono')}
                placeholder="035 456789"
                className={inputClass('telefono')}
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
              {mode === 'create' ? 'Crea Cliente' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}