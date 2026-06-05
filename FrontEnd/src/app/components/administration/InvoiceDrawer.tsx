import { X, FileText, Euro, Calendar, User, Paperclip } from 'lucide-react';

interface InvoiceDrawerProps {
  invoiceId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceDrawer({ invoiceId, isOpen, onClose }: InvoiceDrawerProps) {
  if (!isOpen || !invoiceId) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E5EAF2] p-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#2D2D2D]">Dettaglio Documento</h2>
            <p className="text-sm text-[#6B7280] mt-1">{invoiceId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F9FC] rounded-xl transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-[#F7F9FC] rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#2D2D2D]">Informazioni Generali</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-[#9CA3AF] mb-1">Numero Documento</p><p className="text-sm font-medium text-[#2D2D2D]">{invoiceId}</p></div>
              <div><p className="text-xs text-[#9CA3AF] mb-1">Tipologia</p><span className="text-xs px-2 py-1 bg-[#DBEAFE] text-[#3B82F6] rounded">Fattura Attiva</span></div>
              <div><p className="text-xs text-[#9CA3AF] mb-1">Cliente</p><p className="text-sm font-medium text-[#2D2D2D]">Ferrero S.p.A.</p></div>
              <div><p className="text-xs text-[#9CA3AF] mb-1">Data Emissione</p><p className="text-sm text-[#2D2D2D]">01/06/2026</p></div>
              <div><p className="text-xs text-[#9CA3AF] mb-1">Data Scadenza</p><p className="text-sm text-[#2D2D2D]">01/07/2026</p></div>
              <div><p className="text-xs text-[#9CA3AF] mb-1">Stato</p><span className="text-xs px-2 py-1 bg-[#DBEAFE] text-[#3B82F6] rounded">Da Incassare</span></div>
            </div>
          </div>

          <div className="bg-white border border-[#E5EAF2] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Euro className="w-5 h-5 text-[#17E88F]" />
              <h3 className="text-sm font-semibold text-[#2D2D2D]">Riepilogo Economico</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between pb-2 border-b border-[#E5EAF2]">
                <span className="text-xs text-[#9CA3AF]">Imponibile</span><span className="text-sm font-medium text-[#2D2D2D]">€ 20.000,00</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#E5EAF2]">
                <span className="text-xs text-[#9CA3AF]">IVA (22%)</span><span className="text-sm font-medium text-[#2D2D2D]">€ 4.400,00</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#E5EAF2]">
                <span className="text-xs text-[#9CA3AF]">Totale Documento</span><span className="text-sm font-bold text-[#17E88F]">€ 24.400,00</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#E5EAF2]">
                <span className="text-xs text-[#9CA3AF]">Importo Incassato</span><span className="text-sm text-[#22C55E]">€ 0,00</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-xs font-medium text-[#2D2D2D]">Residuo</span><span className="text-sm font-bold text-[#EF4444]">€ 24.400,00</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E5EAF2] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <Calendar className="w-5 h-5 text-[#3B82F6]" />
              <h3 className="text-sm font-semibold text-[#2D2D2D]">Storico Operazioni</h3>
            </div>
            <div className="relative">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[#E5EAF2]" />
              <div className="space-y-4">
                <div className="relative flex items-start gap-4">
                  <div className="relative z-10 w-5 h-5 bg-[#3B82F6] rounded-full border-4 border-white" />
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-[#2D2D2D] mb-1">Documento Creato</p>
                    <span className="text-xs text-[#9CA3AF]">01/06/2026 09:30 - Maria Rossi</span>
                  </div>
                </div>
                <div className="relative flex items-start gap-4">
                  <div className="relative z-10 w-5 h-5 bg-[#22C55E] rounded-full border-4 border-white" />
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-[#2D2D2D] mb-1">Documento Inviato</p>
                    <span className="text-xs text-[#9CA3AF]">01/06/2026 10:15 - Sistema</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E5EAF2] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Paperclip className="w-5 h-5 text-[#6B7280]" />
              <h3 className="text-sm font-semibold text-[#2D2D2D]">Allegati</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-[#F7F9FC] rounded-xl hover:bg-[#F0FDF7] transition-colors cursor-pointer">
                <FileText className="w-4 h-4 text-[#3B82F6]" />
                <span className="text-sm text-[#2D2D2D]">Fattura_FT-2026-0842.pdf</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
