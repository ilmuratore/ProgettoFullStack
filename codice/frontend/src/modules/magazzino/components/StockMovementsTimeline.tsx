import { useEffect, useState, useCallback } from 'react';
import {
  ArrowDownCircle, ArrowUpCircle, ArrowRightCircle,
  Plus, Minus, RotateCcw, Clock, RefreshCw,
} from 'lucide-react';
import { movimentiStockApi } from '../../../api/movimentiStockApi';
import type { MovimentoStock } from '../../../types/magazzino';

const TIPO_LABEL: Record<string, string> = {
  CARICO_ACQUISTO:    'Carico Acquisto',
  SCARICO_VENDITA:    'Scarico Vendita',
  SPOSTAMENTO:        'Spostamento',
  RETTIFICA_POSITIVA: 'Rettifica +',
  RETTIFICA_NEGATIVA: 'Rettifica −',
  RESO:               'Reso',
};

const TIPO_STYLE: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'Carico Acquisto': { icon: ArrowDownCircle,  color: 'text-[#16A34A]', bg: 'bg-[#DCFCE7]' },
  'Scarico Vendita': { icon: ArrowUpCircle,    color: 'text-[#DC2626]', bg: 'bg-[#FEE2E2]' },
  'Spostamento':     { icon: ArrowRightCircle, color: 'text-[#1D4ED8]', bg: 'bg-[#DBEAFE]' },
  'Rettifica +':     { icon: Plus,             color: 'text-[#D97706]', bg: 'bg-[#FEF3C7]' },
  'Rettifica −':     { icon: Minus,            color: 'text-[#D97706]', bg: 'bg-[#FEF3C7]' },
  'Reso':            { icon: RotateCcw,        color: 'text-[#7C3AED]', bg: 'bg-[#EDE9FE]' },
};

const isPositivo = (tipo: string) =>
  ['CARICO_ACQUISTO', 'RETTIFICA_POSITIVA', 'RESO'].includes(tipo) ||
  tipo === 'SPOSTAMENTO';

const formatOra = (iso: string) =>
  new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

const formatData = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });

export function StockMovementsTimeline({ refreshTrigger }: { refreshTrigger?: number }) {
  const [movimenti, setMovimenti] = useState<MovimentoStock[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await movimentiStockApi.list();
      setMovimenti(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (refreshTrigger !== undefined) load(); }, [refreshTrigger, load]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[#2D2D2D]">Movimenti Stock</h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F0FDF7] border border-[#17E88F]/20 rounded-lg">
            <div className="w-1.5 h-1.5 bg-[#17E88F] rounded-full animate-pulse" />
            <span className="text-xs font-medium text-[#17E88F]">Live</span>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#17E88F] transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Aggiorna
        </button>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 p-4">
              <div className="w-12 h-12 bg-[#E5EAF2] rounded-xl animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#E5EAF2] rounded animate-pulse w-1/3" />
                <div className="h-3 bg-[#E5EAF2] rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && movimenti.length === 0 && (
        <div className="py-12 text-center text-sm text-[#9CA3AF]">
          Nessun movimento registrato.
        </div>
      )}

      <div className="space-y-1">
        {movimenti.map((m, index) => {
          const label = TIPO_LABEL[m.tipo] ?? m.tipo;
          const style = TIPO_STYLE[label] ?? TIPO_STYLE['Spostamento'];
          const Icon  = style.icon;
          const positivo = isPositivo(m.tipo);

          return (
            <div
              key={m.id}
              className="relative flex items-start gap-4 p-4 rounded-xl hover:bg-[#F7F9FC] transition-all group"
            >
              {index !== movimenti.length - 1 && (
                <div className="absolute left-[30px] top-[60px] w-0.5 h-[calc(100%+4px)] bg-[#E5EAF2] z-0" />
              )}

              <div className={`w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center flex-shrink-0 z-10 group-hover:scale-105 transition-transform`}>
                <Icon className={`w-5 h-5 ${style.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[#2D2D2D]">{label}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      positivo ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'
                    }`}>
                      {positivo ? '+' : '−'}{m.quantita}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-medium text-[#6B7280]">{formatOra(m.created_at)}</div>
                    <div className="text-xs text-[#9CA3AF]">{formatData(m.created_at)}</div>
                  </div>
                </div>

                <div className="text-sm text-[#2D2D2D] font-medium truncate">{m.prodotto}</div>
                <div className="text-xs text-[#9CA3AF] font-mono mt-0.5">{m.sku}</div>

                {m.ubicazione && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 bg-[#F7F9FC] rounded-lg">
                    <Clock className="w-3 h-3 text-[#9CA3AF]" />
                    <span className="text-xs font-mono text-[#6B7280]">{m.ubicazione}</span>
                  </div>
                )}

                {m.riferimento && (
                  <div className="mt-1 text-xs text-[#9CA3AF] truncate">{m.riferimento}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!loading && movimenti.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#E5EAF2] flex items-center justify-between">
          <span className="text-xs text-[#9CA3AF]">{movimenti.length} movimenti</span>
          <button
            onClick={load}
            className="text-xs text-[#17E88F] hover:underline font-medium"
          >
            Ricarica
          </button>
        </div>
      )}
    </div>
  );
}
