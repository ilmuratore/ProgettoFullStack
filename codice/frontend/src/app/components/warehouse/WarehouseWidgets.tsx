import { AlertTriangle, RefreshCw, Activity, Clock } from 'lucide-react';

const criticalProducts = [
  { sku: 'SKU-10045', name: 'Bulloni M8 Zincati', stock: 12, min: 50 },
  { sku: 'SKU-20512', name: 'Rondelle Zincate Ø8', stock: 4, min: 40 },
  { sku: 'SKU-15078', name: 'Dadi M8 Autobloccanti', stock: 8, min: 35 },
];

export function WarehouseWidgets() {
  return (
    <div className="space-y-6">
      {/* Capacità Progress Ring */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <h3 className="font-semibold text-[#2D2D2D] mb-6">Capacità Magazzino</h3>

        <div className="flex items-center justify-center mb-6">
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#E5EAF2"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - 0.78)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#17E88F" />
                  <stop offset="100%" stopColor="#0FA67A" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="text-4xl font-bold text-[#2D2D2D]">78%</div>
              <div className="text-xs text-[#6B7280] mt-1">Occupato</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5EAF2]">
          <div>
            <div className="text-xs text-[#6B7280] mb-1">Utilizzato</div>
            <div className="text-lg font-semibold text-[#2D2D2D]">3.900 m²</div>
          </div>
          <div>
            <div className="text-xs text-[#6B7280] mb-1">Disponibile</div>
            <div className="text-lg font-semibold text-[#17E88F]">1.100 m²</div>
          </div>
        </div>
      </div>

      {/* Alert Critici */}
      <div className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-2xl p-6 border border-[#F59E0B]/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#92400E]">Alert Critici</h3>
            <p className="text-xs text-[#92400E]/70">Prodotti sottoscorta</p>
          </div>
        </div>

        <div className="space-y-3">
          {criticalProducts.map((product, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-3 hover:bg-white transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm text-[#92400E]">{product.name}</div>
                  <div className="text-xs text-[#92400E]/70 font-mono mt-0.5">{product.sku}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-[#6B7280]">Scorta: <span className="font-medium text-[#EF4444]">{product.stock}</span></div>
                <div className="text-xs text-[#6B7280]">Minima: <span className="font-medium">{product.min}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ultima Sincronizzazione */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2D2D2D]">Ultima Sincronizzazione</h3>
            <p className="text-xs text-[#6B7280]">ERP Sync</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#F7F9FC] rounded-xl">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#6B7280]" />
              <span className="text-sm text-[#2D2D2D]">08:42:15</span>
            </div>
            <div className="text-xs text-[#22C55E] font-medium">Aggiornato</div>
          </div>

          <div className="pt-3 border-t border-[#E5EAF2]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
              <span className="text-xs text-[#6B7280]">Stato Sistema</span>
            </div>
            <div className="text-sm font-medium text-[#2D2D2D]">🟢 Online</div>
            <div className="text-xs text-[#6B7280] mt-1">99,98% uptime</div>
          </div>
        </div>
      </div>

      {/* Attività in Tempo Reale */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2D2D2D]">Attività Live</h3>
            <p className="text-xs text-[#6B7280]">Ultimi 5 minuti</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
            <span className="text-[#6B7280]">12 operatori attivi</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-pulse" />
            <span className="text-[#6B7280]">8 movimenti in corso</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse" />
            <span className="text-[#6B7280]">3 picking aperti</span>
          </div>
        </div>
      </div>
    </div>
  );
}
