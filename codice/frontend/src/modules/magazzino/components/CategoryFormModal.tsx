import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import type { Categoria, CategoriaCreateRequest, CategoriaUpdateRequest } from '../../../types/categorie';

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  /** async — lancia eccezione in caso di errore per bloccare la chiusura del modal */
  onSave: (data: CategoriaCreateRequest | CategoriaUpdateRequest, id?: number) => Promise<void>;
  /** Categoria completa in modalità edit */
  initialData?: Categoria | null;
  mode: 'create' | 'edit';
  /** Pre-seleziona il padre (flusso "Aggiungi Sottocategoria") */
  initialParentId?: number;
  /** Lista di tutte le categorie per popolare il select padre */
  categorie: Categoria[];
}

interface FormState {
  nome: string;
  categoria_padre_id: string; // stringa vuota = nessun padre
}

export function CategoryFormModal({
  open,
  onClose,
  onSave,
  initialData,
  mode,
  initialParentId,
  categorie,
}: CategoryFormModalProps) {
  const [form, setForm] = useState<FormState>({ nome: '', categoria_padre_id: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);

  // Solo le categorie radice possono essere padre (max 2 livelli)
  const categorieRadice = categorie
  .filter(c => c.categoria_padre_id === null)
  .sort((a, b) => a.nome.localeCompare(b.nome));

  useEffect(() => {
    if (!open) return;
    setErrors({});

    if (mode === 'edit' && initialData) {
      setForm({
        nome: initialData.nome,
        categoria_padre_id: initialData.categoria_padre_id != null
          ? String(initialData.categoria_padre_id)
          : '',
      });
    } else {
      setForm({
        nome: '',
        categoria_padre_id: initialParentId != null ? String(initialParentId) : '',
      });
    }
  }, [open, mode, initialData, initialParentId]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.nome.trim()) errs.nome = 'Il nome è obbligatorio';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const padreId = form.categoria_padre_id !== ''
      ? parseInt(form.categoria_padre_id, 10)
      : null;

    setLoading(true);
    try {
      if (mode === 'create') {
        const payload: CategoriaCreateRequest = {
          nome: form.nome.trim(),
          ...(padreId !== null && { categoria_padre_id: padreId }),
        };
        await onSave(payload);
      } else {
        const payload: CategoriaUpdateRequest = {
          nome: form.nome.trim(),
          // Invia categoria_padre_id solo se è cambiato rispetto all'initialData
          ...(padreId !== (initialData?.categoria_padre_id ?? null) && {
            categoria_padre_id: padreId,
          }),
        };
        await onSave(payload, initialData?.id);
      }
      onClose();
    } catch {
      // errore già gestito e toastato dal chiamante
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () =>
    mode === 'edit' ? 'Modifica Categoria' : 'Nuova Categoria';

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2D2D2D]">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
              Nome Categoria <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={e => {
                setForm(p => ({ ...p, nome: e.target.value }));
                if (errors.nome) setErrors(p => ({ ...p, nome: undefined }));
              }}
              placeholder="Es. Valvolame"
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all ${
                errors.nome ? 'border-red-400 bg-red-50' : 'border-[#E5EAF2]'
              }`}
            />
            {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome}</p>}
          </div>

          {/* Categoria padre */}
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
              Categoria padre
              <span className="ml-1 text-xs font-normal text-[#9CA3AF]">(opzionale — max 2 livelli)</span>
            </label>
            <select
              value={form.categoria_padre_id}
              onChange={e => setForm(p => ({ ...p, categoria_padre_id: e.target.value }))}
              disabled={false}
              className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all"
            >
              <option value="">— Nessuna (categoria radice) —</option>
              {categorieRadice
                // In edit mode, escludi la categoria stessa dal select
                .filter(c => mode !== 'edit' || c.id !== initialData?.id)
                .map(c => (
                  <option key={c.id} value={String(c.id)}>
                    {c.nome}
                    {c.prodotti_count > 0 ? ` (${c.prodotti_count} prodotti)` : ''}
                  </option>
                ))
              }
            </select>
            {categorieRadice.length === 0 && (
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Nessuna categoria radice disponibile. Questa sarà la prima.
              </p>
            )}
          </div>

          {/* Banner info sottocategoria pre-selezionata */}
          {form.categoria_padre_id !== '' && (
            <div className="p-3 bg-[#F0FDF7] border border-[#D1FAE5] rounded-xl">
              <p className="text-sm text-[#16A34A]">
                Questa sarà una sottocategoria di{' '}
                <strong>
                  {categorieRadice.find(c => String(c.id) === form.categoria_padre_id)?.nome ?? '—'}
                </strong>
              </p>
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
              {mode === 'edit' ? 'Salva Modifiche' : 'Crea Categoria'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
