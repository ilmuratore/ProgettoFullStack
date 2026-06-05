import { useState } from 'react';
import { X, Building2, Package, FileText, CheckCircle, ChevronRight, Plus, Trash2 } from 'lucide-react';

interface NewPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3 | 4;

interface OrderLine {
  id: number;
  sku: string;
  prodotto: string;
  quantita: number;
  prezzoUnitario: number;
}

export function NewPurchaseOrderModal({ isOpen, onClose }: NewPurchaseOrderModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [dataPrevista, setDataPrevista] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const steps = [
    { number: 1, label: 'Fornitore', icon: Building2 },
    { number: 2, label: 'Prodotti', icon: Package },
    { number: 3, label: 'Riepilogo', icon: FileText },
    { number: 4, label: 'Conferma', icon: CheckCircle },
  ];

  const suppliers = [
    'Packaging Solutions Italia S.p.A.',
    'Pallet Systems Europe S.p.A.',
    'Film Protezione Italia S.p.A.',
    'Etichette Professionali S.r.l.',
    'Nastri & Reggette S.r.l.',
  ];

  const products = [
    { sku: 'PLT-EUR-001', nome: 'Pallet Standard EUR 1200x800', prezzo: 12.50 },
    { sku: 'SCT-OND-045', nome: 'Scatola Cartone Ondulato 40x30', prezzo: 0.85 },
    { sku: 'FLM-EST-012', nome: 'Film Estensibile Trasparente 50cm', prezzo: 18.90 },
    { sku: 'ETI-ADE-098', nome: 'Etichette Adesive A4 Bianche', prezzo: 24.50 },
    { sku: 'REG-PP-034', nome: 'Reggetta PP Automatica 12mm', prezzo: 32.00 },
  ];

  const addOrderLine = () => {
    const newLine: OrderLine = {
      id: Date.now(),
      sku: '',
      prodotto: '',
      quantita: 1,
      prezzoUnitario: 0,
    };
    setOrderLines([...orderLines, newLine]);
  };

  const removeOrderLine = (id: number) => {
    setOrderLines(orderLines.filter(line => line.id !== id));
  };

  const updateOrderLine = (id: number, field: keyof OrderLine, value: string | number) => {
    setOrderLines(orderLines.map(line => {
      if (line.id === id) {
        if (field === 'sku') {
          const product = products.find(p => p.sku === value);
          if (product) {
            return { ...line, sku: product.sku, prodotto: product.nome, prezzoUnitario: product.prezzo };
          }
        }
        return { ...line, [field]: value };
      }
      return line;
    }));
  };

  const totaleOrdine = orderLines.reduce((sum, line) => sum + (line.quantita * line.prezzoUnitario), 0);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleConfirm = () => {
    onClose();
    setCurrentStep(1);
    setSelectedSupplier('');
    setOrderLines([]);
    setDataPrevista('');
    setNote('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl animate-in fade-in duration-200 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#E5EAF2]">
          <div>
            <h2 className="text-xl font-semibold text-[#2D2D2D]">Nuovo Ordine di Acquisto</h2>
            <p className="text-sm text-[#6B7280] mt-1">Step {currentStep} di 4</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-[#F7F9FC] rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-6 border-b border-[#E5EAF2]">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-[#17E88F] text-white' :
                      isActive ? 'bg-[#F0FDF7] text-[#17E88F] border-2 border-[#17E88F]' :
                      'bg-[#F7F9FC] text-[#6B7280]'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className={`text-xs mt-2 font-medium ${
                      isActive ? 'text-[#17E88F]' : isCompleted ? 'text-[#22C55E]' : 'text-[#6B7280]'
                    }`}>
                      {step.label}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className={`w-5 h-5 mx-2 ${
                      isCompleted ? 'text-[#17E88F]' : 'text-[#E5EAF2]'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Selezione Fornitore */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#2D2D2D] mb-4">Seleziona Fornitore</h3>
              <div className="grid grid-cols-1 gap-3">
                {suppliers.map((supplier) => (
                  <label
                    key={supplier}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-[#17E88F] ${
                      selectedSupplier === supplier ? 'border-[#17E88F] bg-[#F0FDF7]' : 'border-[#E5EAF2]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="supplier"
                      value={supplier}
                      checked={selectedSupplier === supplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedSupplier === supplier ? 'border-[#17E88F]' : 'border-[#E5EAF2]'
                      }`}>
                        {selectedSupplier === supplier && (
                          <div className="w-3 h-3 bg-[#17E88F] rounded-full" />
                        )}
                      </div>
                      <Building2 className="w-5 h-5 text-[#6B7280]" />
                      <span className="font-medium text-[#2D2D2D]">{supplier}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Prodotti */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#2D2D2D]">Aggiungi Prodotti</h3>
                <button
                  onClick={addOrderLine}
                  className="px-4 py-2 bg-[#17E88F] text-white rounded-xl hover:bg-[#0FA67A] transition-all flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi Riga
                </button>
              </div>

              {orderLines.length === 0 ? (
                <div className="text-center py-12 text-[#6B7280]">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun prodotto aggiunto. Clicca "Aggiungi Riga" per iniziare.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderLines.map((line) => (
                    <div key={line.id} className="p-4 bg-[#F7F9FC] rounded-xl">
                      <div className="grid grid-cols-12 gap-3 items-start">
                        <div className="col-span-4">
                          <label className="text-xs text-[#6B7280] mb-1 block">SKU</label>
                          <select
                            value={line.sku}
                            onChange={(e) => updateOrderLine(line.id, 'sku', e.target.value)}
                            className="w-full h-9 px-3 bg-white border border-[#E5EAF2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20"
                          >
                            <option value="">Seleziona...</option>
                            {products.map((product) => (
                              <option key={product.sku} value={product.sku}>
                                {product.sku} - {product.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-3">
                          <label className="text-xs text-[#6B7280] mb-1 block">Quantità</label>
                          <input
                            type="number"
                            value={line.quantita}
                            onChange={(e) => updateOrderLine(line.id, 'quantita', parseInt(e.target.value) || 0)}
                            className="w-full h-9 px-3 bg-white border border-[#E5EAF2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-[#6B7280] mb-1 block">Prezzo €</label>
                          <input
                            type="number"
                            step="0.01"
                            value={line.prezzoUnitario}
                            onChange={(e) => updateOrderLine(line.id, 'prezzoUnitario', parseFloat(e.target.value) || 0)}
                            className="w-full h-9 px-3 bg-white border border-[#E5EAF2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-[#6B7280] mb-1 block">Totale</label>
                          <div className="h-9 px-3 bg-[#F0FDF7] border border-[#17E88F]/20 rounded-lg flex items-center text-sm font-medium text-[#17E88F]">
                            € {(line.quantita * line.prezzoUnitario).toFixed(2)}
                          </div>
                        </div>
                        <div className="col-span-1 flex items-end justify-center">
                          <button
                            onClick={() => removeOrderLine(line.id)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-[#FEE2E2] text-[#EF4444] rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Riepilogo */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-[#2D2D2D] mb-4">Riepilogo Ordine</h3>

              <div className="bg-[#F7F9FC] rounded-xl p-4">
                <div className="text-sm text-[#6B7280] mb-1">Fornitore Selezionato</div>
                <div className="font-medium text-[#2D2D2D]">{selectedSupplier}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#2D2D2D] mb-2 block">Data Consegna Prevista</label>
                <input
                  type="date"
                  value={dataPrevista}
                  onChange={(e) => setDataPrevista(e.target.value)}
                  className="w-full h-11 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#2D2D2D] mb-2 block">Note (opzionale)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 resize-none"
                  placeholder="Aggiungi note sull'ordine..."
                />
              </div>

              <div className="bg-white border border-[#E5EAF2] rounded-xl overflow-hidden">
                <div className="bg-[#F7F9FC] px-4 py-3 font-medium text-[#2D2D2D]">Prodotti ({orderLines.length})</div>
                <div className="divide-y divide-[#E5EAF2]">
                  {orderLines.map((line) => (
                    <div key={line.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-[#2D2D2D] text-sm">{line.prodotto}</div>
                        <div className="text-xs text-[#6B7280] font-mono mt-0.5">{line.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#6B7280]">{line.quantita} × € {line.prezzoUnitario.toFixed(2)}</div>
                        <div className="font-medium text-[#2D2D2D]">€ {(line.quantita * line.prezzoUnitario).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#F0FDF7] px-4 py-3 flex items-center justify-between border-t-2 border-[#17E88F]">
                  <span className="font-semibold text-[#2D2D2D]">Totale Ordine</span>
                  <span className="text-2xl font-bold text-[#17E88F]">€ {totaleOrdine.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Conferma */}
          {currentStep === 4 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-[#22C55E]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-2">Ordine Pronto</h3>
              <p className="text-[#6B7280] mb-6">Conferma per creare l'ordine di acquisto</p>

              <div className="bg-[#F7F9FC] rounded-xl p-6 max-w-md mx-auto text-left">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Fornitore:</span>
                    <span className="font-medium text-[#2D2D2D]">{selectedSupplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Prodotti:</span>
                    <span className="font-medium text-[#2D2D2D]">{orderLines.length} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Data Prevista:</span>
                    <span className="font-medium text-[#2D2D2D]">{dataPrevista || 'Non specificata'}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[#E5EAF2]">
                    <span className="font-medium text-[#2D2D2D]">Totale:</span>
                    <span className="text-xl font-bold text-[#17E88F]">€ {totaleOrdine.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-[#E5EAF2]">
          <button
            onClick={currentStep === 1 ? onClose : handleBack}
            className="px-6 py-2.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all font-medium"
          >
            {currentStep === 1 ? 'Annulla' : 'Indietro'}
          </button>
          <button
            onClick={currentStep === 4 ? handleConfirm : handleNext}
            disabled={
              (currentStep === 1 && !selectedSupplier) ||
              (currentStep === 2 && orderLines.length === 0)
            }
            className="px-6 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 4 ? 'Conferma Ordine' : 'Avanti'}
          </button>
        </div>
      </div>
    </div>
  );
}
