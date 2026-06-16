import { useEffect, useState } from 'react';
import { AlertTriangle, Clock3, PieChart as PieChartIcon } from 'lucide-react';
import { acquistiApi } from '../../../api/acquistiApi';
import type { OrdineAcquistoLista, StatoOrdineAcquisto } from '../../../types/acquisti';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const ATTIVI: ReadonlySet<StatoOrdineAcquisto> = new Set(['BOZZA', 'INVIATO', 'CONFERMATO', 'IN_RICEZIONE']);
const STATI_RITARDO: ReadonlySet<StatoOrdineAcquisto> = new Set(['BOZZA', 'INVIATO', 'CONFERMATO', 'IN_RICEZIONE']);

const STATO_CONFIG: Record<StatoOrdineAcquisto, { label: string; color: string; bg: string; text: string }> = {
  BOZZA:        { label: 'Bozza',        color: '#6B7280', bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]' },
  INVIATO:      { label: 'Inviato',      color: '#3B82F6', bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]' },
  CONFERMATO:   { label: 'Confermato',   color: '#8B5CF6', bg: 'bg-[#EDE9FE]', text: 'text-[#8B5CF6]' },
  IN_RICEZIONE: { label: 'In Ricezione', color: '#F59E0B', bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]' },
  COMPLETATO:   { label: 'Completato',   color: '#22C55E', bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]' },
  ANNULLATO:    { label: 'Annullato',    color: '#EF4444', bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]' },
};

const normalizeDateOnly = (value: string) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayLocalDateOnly = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fmtData = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString('it-IT') : '—';

const giorniRitardo = (dataPrevista: string, oggi: string) =>
  Math.max(1, Math.ceil((new Date(`${oggi}T00:00:00Z`).getTime() - new Date(`${normalizeDateOnly(dataPrevista)}T00:00:00Z`).getTime()) / (1000 * 60 * 60 * 24)));

const giorniMancanti = (dataPrevista: string, oggi: string) =>
  Math.max(0, Math.ceil((new Date(`${normalizeDateOnly(dataPrevista)}T00:00:00Z`).getTime() - new Date(`${oggi}T00:00:00Z`).getTime()) / (1000 * 60 * 60 * 24)));

const addDays = (dateOnly: string, days: number) => {
  const d = new Date(`${dateOnly}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

interface PurchaseInsightsProps {
  onOrderClick: (orderId: number) => void;
}

export function PurchaseInsights({ onOrderClick }: PurchaseInsightsProps) {
  const [ordini, setOrdini] = useState<OrdineAcquistoLista[] | null>(null);

  useEffect(() => {
    acquistiApi.list().then(setOrdini).catch(() => setOrdini([]));
  }, []);

  if (!ordini) {
    return <div className="text-center py-12 text-sm text-[#6B7280]">Caricamento dettagli acquisti…</div>;
  }

  const oggiDateOnly = getTodayLocalDateOnly();
  const entroSetteGiorni = addDays(oggiDateOnly, 7);

  const totale = ordini.length;

  const statusBreakdown = (Object.keys(STATO_CONFIG) as StatoOrdineAcquisto[]).map((stato) => {
    const ordiniStato = ordini.filter((o) => o.stato === stato);
    return {
      stato,
      ...STATO_CONFIG[stato],
      count: ordiniStato.length,
      percentuale: totale > 0 ? (ordiniStato.length / totale) * 100 : 0,
      importo: ordiniStato.reduce((sum, o) => sum + Number(o.importo_totale ?? 0), 0),
    };
  });

  const ordiniInRitardo = ordini
    .filter((o) => STATI_RITARDO.has(o.stato) && o.data_prevista && normalizeDateOnly(o.data_prevista) < oggiDateOnly)
    .sort((a, b) => giorniRitardo(b.data_prevista!, oggiDateOnly) - giorniRitardo(a.data_prevista!, oggiDateOnly));

  const consegneImminenti = ordini
    .filter((o) => ATTIVI.has(o.stato) && o.data_prevista)
    .filter((o) => {
      const dataOnly = normalizeDateOnly(o.data_prevista as string);
      return dataOnly >= oggiDateOnly && dataOnly <= entroSetteGiorni;
    })
    .sort((a, b) => normalizeDateOnly(a.data_prevista!).localeCompare(normalizeDateOnly(b.data_prevista!)));

  return (
    <div className="space-y-6">
      {/* Ordini in Ritardo + Consegne Imminenti */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ordini in Ritardo - dettaglio */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#FEE2E2] rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#2D2D2D]">Ordini in Ritardo — Dettaglio</h3>
              <p className="text-xs text-[#6B7280]">Ordini ancora aperti oltre la data prevista</p>
            </div>
          </div>
          {ordiniInRitardo.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-[#6B7280]">Nessun ordine in ritardo</div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {ordiniInRitardo.map((order) => (
                <button
                  key={order.id}
                  onClick={() => onOrderClick(order.id)}
                  className="w-full flex items-center justify-between p-3 bg-[#F7F9FC] rounded-xl hover:bg-[#FEF2F2] transition-colors text-left"
                >
                  <div>
                    <div className="font-mono text-sm font-medium text-[#2D2D2D]">OA-{String(order.id).padStart(4, '0')}</div>
                    <div className="text-xs text-[#6B7280] mt-0.5">{order.fornitore} · previsto {fmtData(order.data_prevista)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-[#EF4444]">{giorniRitardo(order.data_prevista!, oggiDateOnly)}gg ritardo</div>
                    <div className="text-xs text-[#6B7280] mt-0.5">{formatCurrency(Number(order.importo_totale ?? 0))}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Consegne Imminenti */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#DBEAFE] rounded-xl flex items-center justify-center">
              <Clock3 className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#2D2D2D]">Consegne Imminenti</h3>
              <p className="text-xs text-[#6B7280]">Ordini attivi previsti nei prossimi 7 giorni</p>
            </div>
          </div>
          {consegneImminenti.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-[#6B7280]">Nessuna consegna prevista nei prossimi 7 giorni</div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {consegneImminenti.map((order) => {
                const giorni = giorniMancanti(order.data_prevista!, oggiDateOnly);
                return (
                  <button
                    key={order.id}
                    onClick={() => onOrderClick(order.id)}
                    className="w-full flex items-center justify-between p-3 bg-[#F7F9FC] rounded-xl hover:bg-[#EFF6FF] transition-colors text-left"
                  >
                    <div>
                      <div className="font-mono text-sm font-medium text-[#2D2D2D]">OA-{String(order.id).padStart(4, '0')}</div>
                      <div className="text-xs text-[#6B7280] mt-0.5">{order.fornitore} · previsto {fmtData(order.data_prevista)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-[#3B82F6]">{giorni === 0 ? 'Oggi' : `tra ${giorni}gg`}</div>
                      <div className="text-xs text-[#6B7280] mt-0.5">{formatCurrency(Number(order.importo_totale ?? 0))}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Distribuzione Ordini per Stato */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center">
            <PieChartIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2D2D2D]">Distribuzione Ordini per Stato</h3>
            <p className="text-xs text-[#6B7280]">Composizione del portafoglio ordini</p>
          </div>
        </div>
        {totale === 0 ? (
          <div className="text-center py-8 text-sm text-[#6B7280]">Nessun ordine registrato</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5EAF2]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Stato</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Ordini</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">% sul Totale</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Importo Totale</th>
                </tr>
              </thead>
              <tbody>
                {statusBreakdown.map((s) => (
                  <tr key={s.stato} className="border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${s.bg} ${s.text}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{s.count}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${s.percentuale}%`, backgroundColor: s.color }} />
                        </div>
                        <span className="text-xs text-[#6B7280]">{s.percentuale.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{formatCurrency(s.importo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
