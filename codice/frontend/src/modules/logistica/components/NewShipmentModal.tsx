import { useState } from 'react';
import { X, ChevronRight, Search, CheckCircle, ShoppingCart, Truck, Package, FileText, Check } from 'lucide-react';

interface NewShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ordini = [
  { id: 'SO-2026-0160', cliente: 'Ferrero S.p.A.', prodotti: 8, peso: '124 kg', totale: '€ 2.840,00' },
  { id: 'SO-2026-0159', cliente: 'Barilla Group', prodotti: 12, peso: '186 kg', totale: '€ 3.120,00' },
  { id: 'SO-2026-0158', cliente: 'Lavazza S.p.A.', prodotti: 6, peso: '92 kg', totale: '€ 1.980,00' },
];

const corrieri = [
  { id: '1', nome: 'BRT Express', tempoMedio: '1,8 gg', costo: '€ 45,00', rating: 4.8 },
  { id: '2', nome: 'SDA', tempoMedio: '2,1 gg', costo: '€ 38,00', rating: 4.6 },
  { id: '3', nome: 'GLS Italy', tempoMedio: '2,0 gg', costo: '€ 42,00', rating: 4.7 },
  { id: '4', nome: 'TNT', tempoMedio: '1,9 gg', costo: '€ 48,00', rating: 4.7 },
];

const steps = [
  { num: 1, label: 'Selezione Ordine', icon: ShoppingCart },
  { num: 2, label: 'Selezione Corriere', icon: Truck },
  { num: 3, label: 'Dati Spedizione', icon: Package },
  { num: 4, label: 'Generazione Tracking', icon: FileText },
  { num: 5, label: 'Conferma', icon: Check },
];

export function NewShipmentModal({ isOpen, onClose }: NewShipmentModalProps) {
  const [step, setStep] = useState(1);
  const [selectedOrdine, setSelectedOrdine] = useState<typeof ordini[0] | null>(null);
  const [selectedCorriere, setSelectedCorriere] = useState<typeof corrieri[0] | null>(null);
  const [peso, setPeso] = useState('');
  const [colli, setColli] = useState('');
  const [note, setNote] = useState('');
  const [tracking, setTracking] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const generateTracking = () => {
    const randomTracking = 'TRK' + Math.floor(Math.random() * 10000000000);
    setTracking(randomTracking);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedOrdine(null);
    setSelectedCorriere(null);
    setPeso('');
    setColli('');
    setNote('');
    setTracking('');
    setConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5EAF2]">
          <h2 className="font-semibold text-[#2D2D2D]">Nuova Spedizione</h2>
          <button onClick={handleClose} className="p-2 hover:bg-[#F7F9FC] rounded-xl transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Step Indicator */}
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
                    isDone ? 'bg-[#DCFCE7] text-[#22C55E]' :
                    'text-[#9CA3AF]'
                  }`}>
                    {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    <span className="text-xs font-medium">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-[#9CA3AF] flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Selezione Ordine */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Seleziona l'ordine cliente da spedire.</p>
              <div className="space-y-2">
                {ordini.map((ordine) => (
                  <div
                    key={ordine.id}
                    onClick={() => setSelectedOrdine(ordine)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedOrdine?.id === ordine.id
                        ? 'border-[#17E88F] bg-[#F0FDF7]'
                        : 'border-[#E5EAF2] hover:border-[#17E88F]/40 hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D]">{ordine.id}</p>
                        <p className="text-xs text-[#9CA3AF] mt-1">{ordine.cliente}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-[#6B7280]">{ordine.prodotti} prodotti</span>
                          <span className="text-xs text-[#6B7280]">•</span>
                          <span className="text-xs text-[#6B7280]">{ordine.peso}</span>
                          <span className="text-xs text-[#6B7280]">•</span>
                          <span className="text-xs font-medium text-[#17E88F]">{ordine.totale}</span>
                        </div>
                      </div>
                      {selectedOrdine?.id === ordine.id && <CheckCircle className="w-5 h-5 text-[#17E88F]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Selezione Corriere */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Seleziona il corriere per la spedizione.</p>
              <div className="space-y-3">
                {corrieri.map((corriere) => (
                  <div
                    key={corriere.id}
                    onClick={() => setSelectedCorriere(corriere)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedCorriere?.id === corriere.id
                        ? 'border-[#17E88F] bg-[#F0FDF7]'
                        : 'border-[#E5EAF2] hover:border-[#17E88F]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center">
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2D2D2D]">{corriere.nome}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-[#6B7280]">Consegna: {corriere.tempoMedio}</span>
                            <span className="text-xs text-[#6B7280]">•</span>
                            <span className="text-xs font-medium text-[#17E88F]">{corriere.costo}</span>
                            <span className="text-xs text-[#6B7280]">•</span>
                            <span className="text-xs text-[#6B7280]">⭐ {corriere.rating}</span>
                          </div>
                        </div>
                      </div>
                      {selectedCorriere?.id === corriere.id && <CheckCircle className="w-5 h-5 text-[#17E88F]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Dati Spedizione */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Inserisci i dettagli della spedizione.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#9CA3AF] mb-2 block">Peso Totale (kg)</label>
                  <input
                    type="number"
                    placeholder="Es. 124"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#9CA3AF] mb-2 block">Numero Colli</label>
                  <input
                    type="number"
                    placeholder="Es. 12"
                    value={colli}
                    onChange={(e) => setColli(e.target.value)}
                    className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#9CA3AF] mb-2 block">Note Spedizione (opzionale)</label>
                <textarea
                  placeholder="Aggiungi note per il corriere..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="w-full p-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Generazione Tracking */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Genera il codice tracking per la spedizione.</p>
              {!tracking ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-[#DBEAFE] rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-[#3B82F6]" />
                  </div>
                  <button
                    onClick={generateTracking}
                    className="px-6 py-3 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    Genera Codice Tracking
                  </button>
                </div>
              ) : (
                <div className="bg-[#F0FDF7] border-2 border-[#17E88F] rounded-2xl p-6 text-center">
                  <p className="text-xs text-[#6B7280] mb-2">Codice Tracking Generato</p>
                  <p className="text-2xl font-mono font-bold text-[#17E88F]">{tracking}</p>
                  <p className="text-xs text-[#9CA3AF] mt-4">Il tracking è stato registrato nel sistema</p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Conferma */}
          {step === 5 && (
            <div className="space-y-4">
              {!confirmed ? (
                <>
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-[#22C55E]" />
                    </div>
                    <h3 className="font-semibold text-[#2D2D2D]">Spedizione pronta per la conferma</h3>
                    <p className="text-sm text-[#6B7280] mt-2">Verifica i dati prima di confermare</p>
                  </div>
                  <div className="bg-[#F7F9FC] rounded-xl p-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Ordine</span>
                      <span className="font-medium text-[#2D2D2D]">{selectedOrdine?.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Cliente</span>
                      <span className="font-medium text-[#2D2D2D]">{selectedOrdine?.cliente}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Corriere</span>
                      <span className="font-medium text-[#2D2D2D]">{selectedCorriere?.nome}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Tracking</span>
                      <span className="font-mono text-[#2D2D2D]">{tracking}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Peso / Colli</span>
                      <span className="font-medium text-[#2D2D2D]">{peso} kg / {colli} colli</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <CheckCircle className="w-8 h-8 text-[#22C55E]" />
                  </div>
                  <h3 className="font-semibold text-[#2D2D2D]">Spedizione SH-2026-NEW creata!</h3>
                  <p className="text-sm text-[#6B7280] mt-2">Il tracking è attivo e il corriere è stato notificato</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E5EAF2] flex justify-between gap-3">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : handleClose()}
            className="px-5 py-2.5 bg-[#F7F9FC] border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-white transition-all text-sm font-medium"
          >
            {step === 1 ? 'Annulla' : 'Indietro'}
          </button>
          {step < 5 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={
                (step === 1 && !selectedOrdine) ||
                (step === 2 && !selectedCorriere) ||
                (step === 3 && (!peso || !colli)) ||
                (step === 4 && !tracking)
              }
              className="px-5 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Avanti
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : !confirmed ? (
            <button
              onClick={() => setConfirmed(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Conferma Spedizione
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="px-5 py-2.5 bg-[#17E88F]/10 text-[#17E88F] rounded-xl hover:bg-[#17E88F]/20 transition-all text-sm font-medium"
            >
              Chiudi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
