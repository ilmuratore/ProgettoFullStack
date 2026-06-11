import { useEffect, useState } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { giacenzeApi } from '../../api/giacenzeApi';
import type { Giacenza } from '../../types/magazzino';

export function CriticalProductsAlert() {
  const [critici, setCritici] = useState<Giacenza[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    giacenzeApi
      .list({ scorta: 'sotto' })
      .then((data) => setCritici(data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        {loading && (
          <div className="text-xs text-[#92400E]/60 text-center py-2">Caricamento…</div>
        )}
        {!loading && critici.length === 0 && (
          <div className="text-xs text-[#92400E]/60 text-center py-2">Nessun prodotto sottoscorta</div>
        )}
        {critici.map((item) => (
          <div
            key={`${item.prodotto_id}-${item.ubicazione}`}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-3 hover:bg-white transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm text-[#92400E]">{item.prodotto}</div>
                <div className="text-xs text-[#92400E]/70 font-mono mt-0.5">{item.sku}</div>
              </div>
              <div className="text-right mr-2">
                <div className="text-sm font-semibold text-[#EF4444]">{item.quantita} pz</div>
                <div className="text-xs text-[#6B7280]">Min: {item.scorta_minima}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#92400E]/50 group-hover:text-[#92400E] transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}