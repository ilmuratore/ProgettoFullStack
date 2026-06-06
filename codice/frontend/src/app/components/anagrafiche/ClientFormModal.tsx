import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ClientFormData) => void;
  initialData?: ClientFormData;
  mode: 'create' | 'edit';
  nextId?: number;
}

export interface ClientFormData {
  ragioneSociale: string;
  codice: string;
  pIva: string;
  citta: string;
  email: string;
  telefono: string;
  fatturato: string;
  stato: 'Attivo' | 'Sospeso' | 'Inattivo';
}

export function ClientFormModal({ open, onClose, onSave, initialData, mode, nextId }: ClientFormModalProps) {
  const [formData, setFormData] = useState<ClientFormData>(
    initialData || {
      ragioneSociale: '',
      codice: `CLI-${String(nextId || 1).padStart(3, '0')}`,
      pIva: '',
      citta: '',
      email: '',
      telefono: '',
      fatturato: '',
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                required
                value={formData.ragioneSociale}
                onChange={(e) => setFormData({ ...formData, ragioneSociale: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F]"
                placeholder="Inserisci ragione sociale"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Codice <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={mode === 'create'}
                value={formData.codice}
                onChange={(e) => setFormData({ ...formData, codice: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] font-mono bg-[#F7F9FC] disabled:opacity-60"
                placeholder="CLI-001"
              />
              {mode === 'create' && (
                <p className="text-xs text-[#6B7280] mt-1">Generato automaticamente dall'ID</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                P. IVA <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.pIva}
                onChange={(e) => setFormData({ ...formData, pIva: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] font-mono"
                placeholder="IT02345678901"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Città <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.citta}
                onChange={(e) => setFormData({ ...formData, citta: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F]"
                placeholder="Milano"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                Fatturato <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fatturato}
                onChange={(e) => setFormData({ ...formData, fatturato: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F]"
                placeholder="€ 850.000"
              />
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
                placeholder="info@cliente.it"
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
                placeholder="+39 02 1234567"
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
                <option value="Inattivo">Inattivo</option>
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
              {mode === 'create' ? 'Crea Cliente' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
