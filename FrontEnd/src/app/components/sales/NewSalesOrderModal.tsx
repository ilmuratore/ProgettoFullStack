import { useState } from 'react';
import { X, ChevronRight, Search, Plus, Trash2, CheckCircle, User, MapPin, Package, ClipboardList, Check } from 'lucide-react';

interface NewSalesOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const clienti = [
  { id: '1', nome: 'Ferrero S.p.A.', piva: 'IT00144010050', destinazioni: ['Torino - Via Eugenio Ferrero 1', 'Milano - Via Dante 12', 'Roma - Via Appia 88'] },
  { id: '2', nome: 'Barilla Group S.p.A.', piva: 'IT01131870345', destinazioni: ['Parma - Via Mantova 166', 'Milano - Viale Fulvio Testi 280'] },
  { id: '3', nome: 'Lavazza S.p.A.', piva: 'IT00248560010', destinazioni: ['Torino - Corso Novara 59', 'Roma - Via Sistina 31'] },
  { id: '4', nome: 'Mutti S.p.A.', piva: 'IT00360820341', destinazioni: ['Montechiarugolo - Via Traversante 106'] },
];

const prodotti = [
  { sku: 'PKG-BOX-001', nome: 'Scatola Cartone 40x30x20', disponibilita: 1200, prezzo: 0.85 },
  { sku: 'PKG-PAL-002', nome: 'Pallet Europeo 120x80', disponibilita: 220, prezzo: 12.50 },
  { sku: 'PKG-STR-003', nome: 'Nastro Adesivo 50mm', disponibilita: 850, prezzo: 2.40 },
  { sku: 'PKG-ETI-004', nome: 'Etichette Codice a Barre', disponibilita: 8500, prezzo: 0.023 },
  { sku: 'PKG-FIL-001', nome: 'Film Estensibile 17 mic', disponibilita: 180, prezzo: 8.75 },
  { sku: 'PKG-BOX-002', nome: 'Scatola Microonda 30x25x15', disponibilita: 600, prezzo: 1.20 },
];

const steps = [
  { num: 1, label: 'Cliente', icon: User },
  { num: 2, label: 'Destinazione', icon: MapPin },
  { num: 3, label: 'Prodotti', icon: Package },
  { num: 4, label: 'Riepilogo', icon: ClipboardList },
  { num: 5, label: 'Conferma', icon: Check },
];

interface OrderLine { sku: string; nome: string; disponibilita: number; prezzo: number; qty: number; }

export function NewSalesOrderModal({ isOpen, onClose }: NewSalesOrderModalProps) {
  const [step, setStep] = useState(1);
  const [selectedCliente, setSelectedCliente] = useState<typeof clienti[0] | null>(null);
  const [clienteSearch, setClienteSearch] = useState('');
  const [selectedDest, setSelectedDest] = useState('');
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [prodSearch, setProdSearch] = useState('');
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const filteredClienti = clienti.filter(c =>
    c.nome.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    c.piva.includes(clienteSearch)
  );

  const filteredProdotti = prodotti.filter(p =>
    p.sku.toLowerCase().includes(prodSearch.toLowerCase()) ||
    p.nome.toLowerCase().includes(prodSearch.toLowerCase())
  );

  const addLine = (p: typeof prodotti[0]) => {
    if (!orderLines.find(l => l.sku === p.sku)) {
      setOrderLines(prev => [...prev, { ...p, qty: 1 }]);
    }
  };

  const updateQty = (sku: string, qty: number) => {
    setOrderLines(prev => prev.map(l => l.sku === sku ? { ...l, qty } : l));
  };

  const removeLine = (sku: string) => {
    setOrderLines(prev => prev.filter(l => l.sku !== sku));
  };

  const totale = orderLines.reduce((sum, l) => sum + l.prezzo * l.qty, 0);
  const pesoTotale = orderLines.reduce((sum, l) => sum + l.qty * 0.5, 0);

  const handleClose = () => {
    setStep(1); setSelectedCliente(null); setClienteSearch('');
    setSelectedDest(''); setOrderLines([]); setNote(''); setConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5EAF2]">
          <h2 className="font-semibold text-[#2D2D2D]">Nuovo Ordine Cliente</h2>
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
          {/* Step 1: Cliente */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Seleziona il cliente per questo ordine di vendita.</p>
              <div className="relative">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cerca per ragione sociale o P.IVA..."
                  value={clienteSearch}
                  onChange={e => setClienteSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                {filteredClienti.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCliente(c)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedCliente?.id === c.id
                        ? 'border-[#17E88F] bg-[#F0FDF7]'
                        : 'border-[#E5EAF2] hover:border-[#17E88F]/40 hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D]">{c.nome}</p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">{c.piva}</p>
                      </div>
                      {selectedCliente?.id === c.id && <CheckCircle className="w-5 h-5 text-[#17E88F]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Destinazione */}
          {step === 2 && selectedCliente && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Seleziona la destinazione di consegna per <strong>{selectedCliente.nome}</strong>.</p>
              <div className="space-y-2">
                {selectedCliente.destinazioni.map((dest, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedDest(dest)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      selectedDest === dest
                        ? 'border-[#17E88F] bg-[#F0FDF7]'
                        : 'border-[#E5EAF2] hover:border-[#17E88F]/40'
                    }`}
                  >
                    <MapPin className={`w-5 h-5 flex-shrink-0 ${selectedDest === dest ? 'text-[#17E88F]' : 'text-[#9CA3AF]'}`} />
                    <span className="text-sm text-[#2D2D2D]">{dest}</span>
                    {selectedDest === dest && <CheckCircle className="w-5 h-5 text-[#17E88F] ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Prodotti */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cerca SKU o prodotto..."
                  value={prodSearch}
                  onChange={e => setProdSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 text-sm"
                />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredProdotti.map(p => (
                  <div key={p.sku} className="flex items-center justify-between p-3 bg-[#F7F9FC] rounded-xl hover:bg-[#F0FDF7] transition-colors">
                    <div>
                      <span className="text-xs font-mono text-[#9CA3AF]">{p.sku}</span>
                      <p className="text-sm text-[#2D2D2D]">{p.nome}</p>
                      <span className="text-xs text-[#22C55E]">Disp: {p.disponibilita}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#17E88F]">€ {p.prezzo.toFixed(2)}</span>
                      <button
                        onClick={() => addLine(p)}
                        disabled={!!orderLines.find(l => l.sku === p.sku)}
                        className="p-1.5 bg-[#17E88F]/10 text-[#17E88F] rounded-lg hover:bg-[#17E88F]/20 transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {orderLines.length > 0 && (
                <div className="space-y-2 border-t border-[#E5EAF2] pt-4">
                  <p className="text-xs font-medium text-[#6B7280]">Righe ordine ({orderLines.length})</p>
                  {orderLines.map(l => (
                    <div key={l.sku} className="flex items-center gap-3 p-3 bg-white border border-[#E5EAF2] rounded-xl">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-[#2D2D2D]">{l.nome}</p>
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={l.disponibilita}
                        value={l.qty}
                        onChange={e => updateQty(l.sku, parseInt(e.target.value) || 1)}
                        className="w-20 h-8 text-center bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#17E88F]"
                      />
                      <span className="text-sm font-semibold text-[#17E88F] w-20 text-right">€ {(l.prezzo * l.qty).toFixed(2)}</span>
                      <button onClick={() => removeLine(l.sku)} className="p-1.5 text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Riepilogo */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-[#F7F9FC] rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Cliente</span>
                  <span className="font-medium text-[#2D2D2D]">{selectedCliente?.nome}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Destinazione</span>
                  <span className="font-medium text-[#2D2D2D] text-right max-w-[60%]">{selectedDest}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Righe prodotto</span>
                  <span className="font-medium text-[#2D2D2D]">{orderLines.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Peso totale stimato</span>
                  <span className="font-medium text-[#2D2D2D]">{pesoTotale.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between text-sm border-t border-[#E5EAF2] pt-2 mt-2">
                  <span className="font-semibold text-[#2D2D2D]">Totale Ordine</span>
                  <span className="font-bold text-[#17E88F]">€ {totale.toFixed(2)}</span>
                </div>
              </div>
              <textarea
                placeholder="Note aggiuntive (opzionale)..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                className="w-full p-3 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 resize-none"
              />
            </div>
          )}

          {/* Step 5: Conferma */}
          {step === 5 && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              {!confirmed ? (
                <>
                  <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#22C55E]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2D2D2D]">Ordine pronto per la conferma</h3>
                    <p className="text-sm text-[#6B7280] mt-1">Verranno generate automaticamente le righe di picking</p>
                  </div>
                  <div className="bg-[#F7F9FC] rounded-xl p-4 w-full text-left space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Cliente</span>
                      <span className="font-medium">{selectedCliente?.nome}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Totale</span>
                      <span className="font-bold text-[#17E88F]">€ {totale.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-8 h-8 text-[#22C55E]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2D2D2D]">Ordine SO-2026-NEW creato!</h3>
                    <p className="text-sm text-[#6B7280] mt-1">Il picking è stato avviato automaticamente</p>
                  </div>
                </>
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
                (step === 1 && !selectedCliente) ||
                (step === 2 && !selectedDest) ||
                (step === 3 && orderLines.length === 0)
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
              Conferma Ordine
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
