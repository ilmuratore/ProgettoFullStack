import { useState } from 'react';
import { X, ChevronRight, Search, CheckCircle, User, Package, Calculator, Calendar, Check } from 'lucide-react';

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  { num: 1, label: 'Cliente/Fornitore', icon: User },
  { num: 2, label: 'Righe', icon: Package },
  { num: 3, label: 'Imposte', icon: Calculator },
  { num: 4, label: 'Scadenza', icon: Calendar },
  { num: 5, label: 'Conferma', icon: Check },
];

export function NewInvoiceModal({ isOpen, onClose }: NewInvoiceModalProps) {
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#E5EAF2]">
          <h2 className="font-semibold text-[#2D2D2D]">Nuova Fattura</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F9FC] rounded-xl transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-[#E5EAF2]">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <div key={s.num} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    isActive ? 'bg-[#17E88F]/10 text-[#17E88F]' :
                    isDone ? 'bg-[#DCFCE7] text-[#22C55E]' : 'text-[#9CA3AF]'
                  }`}>
                    {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    <span className="text-xs font-medium">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-[#9CA3AF]" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && <div className="space-y-4"><p className="text-sm text-[#6B7280]">Seleziona il cliente o fornitore per questo documento.</p></div>}
          {step === 2 && <div className="space-y-4"><p className="text-sm text-[#6B7280]">Inserisci le righe documento con prodotti/servizi.</p></div>}
          {step === 3 && <div className="space-y-4"><p className="text-sm text-[#6B7280]">Calcola imposte e verifica il totale.</p></div>}
          {step === 4 && <div className="space-y-4"><p className="text-sm text-[#6B7280]">Imposta scadenza e metodo di pagamento.</p></div>}
          {step === 5 && !confirmed ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-[#22C55E]" />
              </div>
              <h3 className="font-semibold text-[#2D2D2D]">Documento pronto per la conferma</h3>
              <p className="text-sm text-[#6B7280] mt-2">Il documento verrà registrato nel sistema</p>
            </div>
          ) : confirmed ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mb-4 animate-bounce">
                <CheckCircle className="w-8 h-8 text-[#22C55E]" />
              </div>
              <h3 className="font-semibold text-[#2D2D2D]">Fattura FT-2026-NEW creata!</h3>
              <p className="text-sm text-[#6B7280] mt-2">Il documento è stato registrato correttamente</p>
            </div>
          ) : null}
        </div>

        <div className="p-6 border-t border-[#E5EAF2] flex justify-between gap-3">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()} className="px-5 py-2.5 bg-[#F7F9FC] border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-white transition-all text-sm font-medium">
            {step === 1 ? 'Annulla' : 'Indietro'}
          </button>
          {step < 5 ? (
            <button onClick={() => setStep(s => s + 1)} className="px-5 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2">
              Avanti <ChevronRight className="w-4 h-4" />
            </button>
          ) : !confirmed ? (
            <button onClick={() => setConfirmed(true)} className="px-5 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Conferma Documento
            </button>
          ) : (
            <button onClick={onClose} className="px-5 py-2.5 bg-[#17E88F]/10 text-[#17E88F] rounded-xl hover:bg-[#17E88F]/20 transition-all text-sm font-medium">
              Chiudi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
