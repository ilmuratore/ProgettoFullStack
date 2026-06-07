import { AlertTriangle, ChevronRight } from 'lucide-react';

const criticalProducts = [
  { name: 'Film Estensibile Trasparente', sku: 'FLM-EST-012', stock: 12, min: 50 },
  { name: 'Etichette Termiche 100x150mm', sku: 'ETI-TRM-112', stock: 45, min: 100 },
  { name: 'Nastro Adesivo Avana 50mm', sku: 'NST-AVA-056', stock: 8, min: 30 },
];

export function CriticalProductsAlert() {
  return (
    <div className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-2xl p-6 border border-[#F59E0B]/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
        </div>
        <div>
          <h3 className="font-semibold text-[#92400E]">Prodotti Critici</h3>
          <p className="text-xs text-[#92400E]/70">Scorta minima raggiunta</p>
        </div>
      </div>

      <div className="space-y-3">
        {criticalProducts.map((product, index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-3 hover:bg-white transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm text-[#92400E]">{product.name}</div>
                <div className="text-xs text-[#92400E]/70 font-mono mt-0.5">{product.sku}</div>
              </div>
              <div className="text-right mr-2">
                <div className="text-sm font-semibold text-[#EF4444]">{product.stock} pz</div>
                <div className="text-xs text-[#6B7280]">Min: {product.min}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#92400E]/50 group-hover:text-[#92400E] transition-colors" />
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 bg-white text-[#F59E0B] rounded-xl font-medium text-sm hover:bg-[#92400E] hover:text-white transition-all">
        Genera Ordine Automatico
      </button>
    </div>
  );
}
