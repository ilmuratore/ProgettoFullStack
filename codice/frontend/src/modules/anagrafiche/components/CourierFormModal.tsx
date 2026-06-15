import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import type { Corriere, CorriereCreateRequest, CorriereUpdateRequest } from '../../../types/corrieri';

interface CourierFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CorriereCreateRequest | CorriereUpdateRequest, id?: number) => Promise<void>;
  initialData?: Corriere | null;
  mode: 'create' | 'edit';
}

interface FormState {
  codice: string;
  nome: string;
  telefono: string;
  email: string;
}

const EMPTY: FormState = { codice: '', nome: '', telefono: '', email: '' };

export function CourierFormModal({ open, onClose, onSave, initialData, mode }: CourierFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setForm({
          codice: initialData.codice,
          nome: initialData.nome,
          telefono: initialData.telefono ?? '',
          email: initialData.email ?? '',
        });
      } else {
        setForm(EMPTY);
      }
      setErrors({});
    }
  }, [open, mode, initialData]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.codice.trim()) errs.codice = 'Il codice è obbligatorio';
    if (!form.nome.trim()) errs.nome = 'Il nome è obbligatorio';
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
      const payload: CorriereCreateRequest | CorriereUpdateRequest = {
        codice: form.codice.trim().toUpperCase(),
        nome: form.nome.trim(),
        ...(form.telefono.trim() && { telefono: form.telefono.trim() }),
        ...(form.email.trim() && { email: form.email.trim() }),
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
            {mode === 'create' ? 'Nuovo Corriere' : 'Modifica Corriere'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Codice <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.codice}
                onChange={set('codice')}
                placeholder="BRT"
                className={`${inputClass('codice')} font-mono uppercase`}
              />
              {errors.codice && <p className="mt-1 text-xs text-red-500">{errors.codice}</p>}
              <p className="mt-1 text-xs text-[#6B7280]">Codice operativo univoco (es. BRT, GLS, DHL)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={set('nome')}
                placeholder="BRT Bartolini"
                className={inputClass('nome')}
              />
              {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="operativo@corriere.it"
                className={inputClass('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Telefono</label>
              <input
                type="tel"
                value={form.telefono}
                onChange={set('telefono')}
                placeholder="02 1234567"
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
              {mode === 'create' ? 'Crea Corriere' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}