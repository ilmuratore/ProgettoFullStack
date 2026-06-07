import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => void;
  initialData?: CategoryFormData;
  mode: 'create' | 'edit' | 'subcategory';
  parentCategory?: string;
}

export interface CategoryFormData {
  nome: string;
  padre?: string;
}

export function CategoryFormModal({ open, onClose, onSave, initialData, mode, parentCategory }: CategoryFormModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>(
    initialData || {
      nome: '',
      padre: parentCategory || undefined,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const getTitle = () => {
    if (mode === 'subcategory') return `Nuova Sottocategoria - ${parentCategory}`;
    if (mode === 'edit') return 'Modifica Categoria';
    return 'Nuova Categoria';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2D2D2D]">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
              Nome Categoria <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F]"
              placeholder="Inserisci nome categoria"
            />
          </div>

          {mode === 'subcategory' && (
            <div className="p-3 bg-[#F0FDF7] border border-[#D1FAE5] rounded-xl">
              <p className="text-sm text-[#16A34A]">
                Questa categoria sarà una sottocategoria di <strong>{parentCategory}</strong>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5EAF2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all"
            >
              {mode === 'edit' ? 'Salva Modifiche' : 'Crea Categoria'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
