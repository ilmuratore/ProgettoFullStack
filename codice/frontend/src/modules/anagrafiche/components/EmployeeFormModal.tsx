import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import type { Dipendente, DipendenteCreateRequest, DipendenteUpdateRequest } from '../../../types/corrieri';

interface EmployeeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: DipendenteCreateRequest | DipendenteUpdateRequest, id?: number) => Promise<void>;
  initialData?: Dipendente | null;
  mode: 'create' | 'edit';
}

interface FormState {
  nome: string;
  cognome: string;
  codice_fiscale: string;
  ruolo_operativo: string;
  data_assunzione: string;
}

const EMPTY: FormState = {
  nome: '',
  cognome: '',
  codice_fiscale: '',
  ruolo_operativo: '',
  data_assunzione: '',
};

export function EmployeeFormModal({ open, onClose, onSave, initialData, mode }: EmployeeFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setForm({
          nome: initialData.nome,
          cognome: initialData.cognome,
          codice_fiscale: initialData.codice_fiscale,
          ruolo_operativo: initialData.ruolo_operativo ?? '',
          data_assunzione: initialData.data_assunzione ?? '',
        });
      } else {
        setForm(EMPTY);
      }
      setErrors({});
    }
  }, [open, mode, initialData]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.nome.trim()) errs.nome = 'Il nome è obbligatorio';
    if (!form.cognome.trim()) errs.cognome = 'Il cognome è obbligatorio';
    if (!form.codice_fiscale.trim()) {
      errs.codice_fiscale = 'Il codice fiscale è obbligatorio';
    } else if (form.codice_fiscale.trim().length !== 16) {
      errs.codice_fiscale = 'Il codice fiscale deve essere di 16 caratteri';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: DipendenteCreateRequest | DipendenteUpdateRequest = {
        nome: form.nome.trim(),
        cognome: form.cognome.trim(),
        codice_fiscale: form.codice_fiscale.trim().toUpperCase(),
        ...(form.ruolo_operativo.trim() && { ruolo_operativo: form.ruolo_operativo.trim() }),
        ...(form.data_assunzione && { data_assunzione: form.data_assunzione }),
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
            {mode === 'create' ? 'Nuovo Dipendente' : 'Modifica Dipendente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={set('nome')}
                placeholder="Giuseppe"
                className={inputClass('nome')}
              />
              {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Cognome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.cognome}
                onChange={set('cognome')}
                placeholder="Esposito"
                className={inputClass('cognome')}
              />
              {errors.cognome && <p className="mt-1 text-xs text-red-500">{errors.cognome}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Codice Fiscale <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.codice_fiscale}
                onChange={set('codice_fiscale')}
                placeholder="SPSGPP85M12F839W"
                maxLength={16}
                className={`${inputClass('codice_fiscale')} font-mono uppercase`}
              />
              {errors.codice_fiscale && <p className="mt-1 text-xs text-red-500">{errors.codice_fiscale}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Ruolo Operativo
              </label>
              <input
                type="text"
                value={form.ruolo_operativo}
                onChange={set('ruolo_operativo')}
                placeholder="Magazziniere"
                className={inputClass('ruolo_operativo')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Data Assunzione
              </label>
              <input
                type="date"
                value={form.data_assunzione}
                onChange={set('data_assunzione')}
                className={inputClass('data_assunzione')}
              />
            </div>

          </div>

          {mode === 'edit' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              L'eliminazione di un dipendente è permanente (hard delete). Le spedizioni collegate manterranno lo storico con autista non assegnato.
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
              {mode === 'create' ? 'Crea Dipendente' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}