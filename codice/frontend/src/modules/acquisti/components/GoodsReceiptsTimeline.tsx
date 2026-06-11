import { useEffect, useState } from 'react';
import { Package, Clock, User, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { ricezioniApi } from '../../../api/ricezioniApi';
import type { Ricezione, RigaRicezione } from '../../../types/acquisti';

interface GoodsReceiptsTimelineProps {
  ricezioni: Ricezione[];
  loading?: boolean;
}

const PAGE_SIZE = 6;

const fmtDataOra = (iso: string | null): string =>
  iso
    ? new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '—';

export function GoodsReceiptsTimeline({ ricezioni, loading }: GoodsReceiptsTimelineProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [righeMap, setRigheMap] = useState<Record<number, RigaRicezione[]>>({});
  const [loadingRighe, setLoadingRighe] = useState<Record<number, boolean>>({});

  const visible = ricezioni.slice(0, visibleCount);
  const visibleIds = visible.map((r) => r.id).join(',');

  useEffect(() => {
    visible.forEach((r) => {
      if (righeMap[r.id] || loadingRighe[r.id]) return;
      setLoadingRighe((prev) => ({ ...prev, [r.id]: true }));
      ricezioniApi
        .getRighe(r.id)
        .then((righe) => setRigheMap((prev) => ({ ...prev, [r.id]: righe })))
        .catch((err: any) => toast.error('Errore caricamento righe ricezione', { description: err?.message }))
        .finally(() => setLoadingRighe((prev) => ({ ...prev, [r.id]: false })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleIds]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[#2D2D2D]">Ricezioni Merce</h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#F0FDF7] border border-[#17E88F]/20 rounded-lg">
            <div className="w-2 h-2 bg-[#17E88F] rounded-full animate-pulse" />
            <span className="text-xs font-medium text-[#17E88F]">Aggiornato</span>
          </div>
        </div>
        <div className="text-xs text-[#6B7280]">Ultime ricezioni registrate</div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-[#6B7280]">Caricamento ricezioni...</div>
      ) : ricezioni.length === 0 ? (
        <div className="py-8 text-center text-sm text-[#6B7280]">Nessuna ricezione registrata.</div>
      ) : (
        <div className="space-y-4">
          {visible.map((receipt, index) => {
            const righe = righeMap[receipt.id] ?? [];
            const totaleQuantita = righe.reduce((sum, r) => sum + Number(r.quantita_ricevuta), 0);
            const prodotti = righe.map((r) => r.prodotto).join(', ');
            const ubicazioni = Array.from(new Set(righe.map((r) => r.ubicazione)));
            const ubicazioneLabel = ubicazioni.length === 0
              ? '—'
              : ubicazioni.length === 1
                ? ubicazioni[0]
                : `${ubicazioni.length} ubicazioni`;

            return (
              <div
                key={receipt.id}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#F7F9FC] transition-all group relative"
              >
                {index !== visible.length - 1 && (
                  <div className="absolute left-[30px] top-[60px] w-0.5 h-[calc(100%+16px)] bg-[#E5EAF2]" />
                )}

                <div className="w-12 h-12 bg-gradient-to-br from-[#17E88F] to-[#0FA67A] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform z-10">
                  <Package className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#2D2D2D] font-mono">OA-{String(receipt.ordine_acquisto_id).padStart(4, '0')}</span>
                        {totaleQuantita > 0 && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#DCFCE7] text-[#22C55E]">
                            {totaleQuantita} unità
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[#6B7280]">{receipt.fornitore}</div>
                      <div className="text-sm text-[#2D2D2D] font-medium mt-1">
                        {loadingRighe[receipt.id] ? 'Caricamento prodotti...' : (prodotti || '—')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-[#6B7280]">
                        <Clock className="w-3 h-3" />
                        {fmtDataOra(receipt.data_ricezione)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
                        <User className="w-3 h-3" />
                        {receipt.utente ?? '—'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-[#F7F9FC] rounded-lg inline-flex">
                    <MapPin className="w-3 h-3 text-[#6B7280]" />
                    <span className="text-xs text-[#6B7280]">Ubicazione:</span>
                    <span className="text-xs font-mono text-[#2D2D2D]">{ubicazioneLabel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {visibleCount < ricezioni.length && (
        <div className="flex items-center justify-center mt-6 pt-4 border-t border-[#E5EAF2]">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-4 py-2 text-sm text-[#17E88F] hover:bg-[#F0FDF7] rounded-lg transition-all font-medium"
          >
            Carica Altre Ricezioni
          </button>
        </div>
      )}
    </div>
  );
}
