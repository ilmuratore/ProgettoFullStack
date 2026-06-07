import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

interface CourierFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CourierFormData) => void;
  initialData?: CourierFormData;
  mode: 'create' | 'edit';
}

export interface CourierFormData {
  nome: string;
  codice: string;
  email: string;
  telefono: string;
  spedizioniAttive: number;
  stato: 'Attivo' | 'Sospeso';
}

export function CourierFormModal({ open, onClose, onSave, initialData, mode }: CourierFormModalProps) {
  const [formData, setFormData] = useState<CourierFormData>(
    initialData || {
      nome: '',
      codice: '',
      email: '',
      telefono: '',
      spedizioniAttive: 0,
      stato: 'Attivo',
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
            {mode === 'create' ? 'Nuovo Corriere' : 'Modifica Corriere'}
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
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F]"
                placeholder="BRT Express"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Codice <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.codice}
                onChange={(e) => setFormData({ ...formData, codice: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] font-mono"
                placeholder="BRT"
              />
              <p className="text-xs text-[#6B7280] mt-1">Da inserire manualmente</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F]"
                placeholder="operativo@corriere.it"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Telefono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F]"
                placeholder="+39 02 123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Spedizioni Attive
              </label>
              <input
                type="number"
                min="0"
                value={formData.spedizioniAttive}
                onChange={(e) => setFormData({ ...formData, spedizioniAttive: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F]"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Stato <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.stato}
                onChange={(e) => setFormData({ ...formData, stato: e.target.value as any })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F]"
              >
                <option value="Attivo">Attivo</option>
                <option value="Sospeso">Sospeso</option>
              </select>
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
              {mode === 'create' ? 'Crea Corriere' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
