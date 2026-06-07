import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData) => void;
  initialData?: ProductFormData;
  mode: 'create' | 'edit';
}

export interface ProductFormData {
  nome: string;
  sku: string;
  categoria: string;
  fornitore: string;
  prezzo: string;
}

export function ProductFormModal({ open, onClose, onSave, initialData, mode }: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      nome: '',
      sku: '',
      categoria: '',
      fornitore: '',
      prezzo: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2D2D2D]">
            {mode === 'create' ? 'Nuovo Prodotto' : 'Modifica Prodotto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Nome Prodotto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F]"
                placeholder="Inserisci nome prodotto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] font-mono"
                placeholder="PLT-EUR-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F]"
              >
                <option value="">Seleziona categoria</option>
                <option value="Pallet">Pallet</option>
                <option value="Scatole">Scatole</option>
                <option value="Film">Film</option>
                <option value="Etichette">Etichette</option>
                <option value="Nastri">Nastri</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Fornitore <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.fornitore}
                onChange={(e) => setFormData({ ...formData, fornitore: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F]"
              >
                <option value="">Seleziona fornitore</option>
                <option value="Packaging Solutions Italia">Packaging Solutions Italia</option>
                <option value="Pallet Systems Europe">Pallet Systems Europe</option>
                <option value="Etichette Professionali">Etichette Professionali</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Prezzo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.prezzo}
                onChange={(e) => setFormData({ ...formData, prezzo: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F]"
                placeholder="€ 12,50"
              />
            </div>
          </div>

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
              {mode === 'create' ? 'Crea Prodotto' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
