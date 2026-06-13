import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Activity, Clock } from 'lucide-react';
import { giacenzeApi } from '../../../api/giacenzeApi';
import type { Giacenza } from '../../../types/magazzino';

export function WarehouseWidgets() {
  const [critici, setCritici] = useState<Giacenza[]>([]);
  const [loadingCritici, setLoadingCritici] = useState(true);

  useEffect(() => {
    giacenzeApi
      .list({ scorta: 'sotto' })
      .then((data) => setCritici(data.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoadingCritici(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Capacità Progress Ring — placeholder M12 */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <h3 className="font-semibold text-[#2D2D2D] mb-6">Capacità Magazzino</h3>

        <div className="flex items-center justify-center mb-6">
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="#E5EAF2" strokeWidth="12" fill="none" />
              <circle
                cx="80" cy="80" r="70"
                stroke="url(#gradient)" strokeWidth="12" fill="none"
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
              <div className="text-4xl font-bold text-[#2D2D2D]">—</div>
              <div className="text-xs text-[#6B7280] mt-1">M12</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5EAF2]">
          <div>
            <div className="text-xs text-[#6B7280] mb-1">Utilizzato</div>
            <div className="text-lg font-semibold text-[#9CA3AF]">—</div>
          </div>
          <div>
            <div className="text-xs text-[#6B7280] mb-1">Disponibile</div>
            <div className="text-lg font-semibold text-[#9CA3AF]">—</div>
          </div>
        </div>
      </div>

      {/* Alert Critici — da API reale */}
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
          {loadingCritici && (
            <div className="text-xs text-[#92400E]/60 text-center py-2">Caricamento…</div>
          )}
          {!loadingCritici && critici.length === 0 && (
            <div className="text-xs text-[#92400E]/60 text-center py-2">Nessun prodotto sottoscorta</div>
          )}
          {critici.map((item) => (
            <div key={`${item.prodotto_id}-${item.ubicazione}`} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 hover:bg-white transition-all">
              <div className="font-medium text-sm text-[#92400E]">{item.prodotto}</div>
              <div className="text-xs text-[#92400E]/70 font-mono mt-0.5">{item.sku}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-[#6B7280]">Scorta: <span className="font-medium text-[#EF4444]">{item.quantita}</span></div>
                <div className="text-xs text-[#6B7280]">Minima: <span className="font-medium">{item.scorta_minima}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ultima Sincronizzazione — placeholder M12 */}
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
              <span className="text-sm text-[#9CA3AF]">—</span>
            </div>
            <div className="text-xs text-[#9CA3AF] font-medium">M12</div>
          </div>

          <div className="pt-3 border-t border-[#E5EAF2]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
              <span className="text-xs text-[#6B7280]">Stato Sistema</span>
            </div>
            <div className="text-sm font-medium text-[#2D2D2D]">🟢 Online</div>
          </div>
        </div>
      </div>

      {/* Attività Live — placeholder M12 */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2D2D2D]">Attività Live</h3>
            <p className="text-xs text-[#6B7280]">Disponibile con M12</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
            <span className="text-[#9CA3AF]">— operatori attivi</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-pulse" />
            <span className="text-[#9CA3AF]">— movimenti in corso</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse" />
            <span className="text-[#9CA3AF]">— preparazioni aperte</span>
          </div>
        </div>
      </div>
    </div>
  );
}
