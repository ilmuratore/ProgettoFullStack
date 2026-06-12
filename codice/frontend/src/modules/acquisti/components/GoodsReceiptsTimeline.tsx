import { useState } from 'react';
import { Package, Clock, User, MapPin, ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { Ricezione } from '../../../types/acquisti';
import { applySort, compareDate, compareNumber, compareText, toggleSort, type SortConfig } from '../../../utils/sorting';

interface GoodsReceiptsTimelineProps {
  ricezioni: Ricezione[];
  loading?: boolean;
}

type SortKey = 'ordine_acquisto_id' | 'fornitore' | 'data_ricezione' | 'utente';

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'ordine_acquisto_id', label: 'Ordine' },
  { key: 'fornitore', label: 'Fornitore' },
  { key: 'data_ricezione', label: 'Data' },
  { key: 'utente', label: 'Responsabile' },
];

const compareReceiptsByKey = (left: Ricezione, right: Ricezione, key: SortKey) => {
  switch (key) {
    case 'ordine_acquisto_id':
      return compareNumber(left.ordine_acquisto_id, right.ordine_acquisto_id);
    case 'fornitore':
      return compareText(left.fornitore ?? '', right.fornitore ?? '');
    case 'data_ricezione':
      return compareDate(left.data_ricezione, right.data_ricezione);
    case 'utente':
      return compareText(left.utente ?? '', right.utente ?? '');
    default:
      return 0;
  }
};

const PAGE_SIZE = 6;

const fmtDataOra = (iso: string | null): string =>
  iso
    ? new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '-';

export function GoodsReceiptsTimeline({ ricezioni, loading }: GoodsReceiptsTimelineProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sort, setSort] = useState<SortConfig<SortKey> | null>(null);

  const handleSort = (key: SortKey) => setSort((prev) => toggleSort(prev, key));

  const sorted = applySort(ricezioni, sort, compareReceiptsByKey);
  const visible = sorted.slice(0, visibleCount);

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

      <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-[#E5EAF2]">
        <span className="text-xs text-[#9CA3AF] mr-1">Ordina per:</span>
        {sortOptions.map((opt) => {
          const active = sort?.key === opt.key;
          const Icon = !active ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleSort(opt.key)}
              aria-sort={!active ? 'none' : sort.direction === 'asc' ? 'ascending' : 'descending'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                active ? 'text-[#2D2D2D] bg-[#F7F9FC]' : 'text-[#9CA3AF] hover:text-[#2D2D2D]'
              }`}
            >
              <span>{opt.label}</span>
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#2D2D2D]' : 'text-[#9CA3AF]'}`} />
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-[#6B7280]">Caricamento ricezioni...</div>
      ) : ricezioni.length === 0 ? (
        <div className="py-8 text-center text-sm text-[#6B7280]">Nessuna ricezione registrata.</div>
      ) : (
        <div className="space-y-4">
          {visible.map((receipt, index) => {
            const detailLabel = receipt.note?.trim() || 'Ricezione registrata';
            const ubicazioneLabel = receipt.note?.trim() || 'Dettaglio righe non disponibile';

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
                      </div>
                      <div className="text-sm text-[#6B7280]">{receipt.fornitore}</div>
                      <div className="text-sm text-[#2D2D2D] font-medium mt-1">
                        {detailLabel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-[#6B7280]">
                        <Clock className="w-3 h-3" />
                        {fmtDataOra(receipt.data_ricezione)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
                        <User className="w-3 h-3" />
                        {receipt.utente ?? '-'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-[#F7F9FC] rounded-lg inline-flex">
                    <MapPin className="w-3 h-3 text-[#6B7280]" />
                    <span className="text-xs text-[#6B7280]">Nota:</span>
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
