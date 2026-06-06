import { X, Package, MapPin, Hash, FileText } from 'lucide-react';

interface NewMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewMovementModal({ isOpen, onClose }: NewMovementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[#E5EAF2]">
          <div>
            <h2 className="text-xl font-semibold text-[#2D2D2D]">Nuovo Movimento Stock</h2>
            <p className="text-sm text-[#6B7280] mt-1">Sposta prodotti tra ubicazioni</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-[#F7F9FC] rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-2">
              <Package className="w-4 h-4 text-[#6B7280]" />
              Prodotto
            </label>
            <select className="w-full h-11 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all">
              <option>Seleziona prodotto...</option>
              <option>PLT-EUR-001 - Pallet Standard EUR 1200x800</option>
              <option>SCT-OND-045 - Scatola Cartone Ondulato 40x30</option>
              <option>FLM-EST-012 - Film Estensibile Trasparente 50cm</option>
              <option>ETI-ADE-098 - Etichette Adesive A4 Bianche</option>
              <option>REG-PP-034 - Reggetta PP Automatica 12mm</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-2">
                <MapPin className="w-4 h-4 text-[#6B7280]" />
                Ubicazione Origine
              </label>
              <select className="w-full h-11 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all">
                <option>Seleziona origine...</option>
                <option>A-01-05</option>
                <option>A-02-12</option>
                <option>B-01-08</option>
                <option>B-02-15</option>
                <option>A-03-04</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-2">
                <MapPin className="w-4 h-4 text-[#17E88F]" />
                Ubicazione Destinazione
              </label>
              <select className="w-full h-11 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all">
                <option>Seleziona destinazione...</option>
                <option>A-01-05</option>
                <option>A-02-12</option>
                <option>B-01-08</option>
                <option>B-02-15</option>
                <option>A-03-04</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-2">
              <Hash className="w-4 h-4 text-[#6B7280]" />
              Quantità
            </label>
            <input
              type="number"
              placeholder="Inserisci quantità..."
              className="w-full h-11 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-2">
              <FileText className="w-4 h-4 text-[#6B7280]" />
              Note (opzionale)
            </label>
            <textarea
              rows={3}
              placeholder="Aggiungi note sul movimento..."
              className="w-full px-4 py-3 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all resize-none"
            />
          </div>

          <div className="bg-[#F0FDF7] border border-[#17E88F]/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#17E88F] rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-[#2D2D2D] mb-1">Riepilogo Movimento</div>
                <div className="text-xs text-[#6B7280] space-y-1">
                  <div>Tipo: <span className="font-medium text-[#2D2D2D]">Trasferimento Inter-Ubicazione</span></div>
                  <div>Operatore: <span className="font-medium text-[#2D2D2D]">Mario Rossi</span></div>
                  <div>Data/Ora: <span className="font-medium text-[#2D2D2D]">03/06/2026 10:45</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E5EAF2]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all font-medium"
          >
            Annulla
          </button>
          <button className="px-6 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Conferma Spostamento
          </button>
        </div>
      </div>
    </div>
  );
}
