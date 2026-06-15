import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { acquistiApi } from '../../../api/acquistiApi';
import type { OrdineAcquistoLista, StatoOrdineAcquisto } from '../../../types/acquisti';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const STATI_RITARDO: ReadonlySet<StatoOrdineAcquisto> = new Set(['BOZZA', 'INVIATO', 'CONFERMATO', 'IN_RICEZIONE']);

const STATO_CONFIG: Record<StatoOrdineAcquisto, { label: string; color: string }> = {
  BOZZA:        { label: 'Bozza',        color: '#6B7280' },
  INVIATO:      { label: 'Inviato',      color: '#3B82F6' },
  CONFERMATO:   { label: 'Confermato',   color: '#8B5CF6' },
  IN_RICEZIONE: { label: 'In Ricezione', color: '#F59E0B' },
  COMPLETATO:   { label: 'Completato',   color: '#22C55E' },
  ANNULLATO:    { label: 'Annullato',    color: '#EF4444' },
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

const giorniRitardo = (dataPrevista: string, oggi: string) =>
  Math.max(1, Math.ceil((new Date(`${oggi}T00:00:00Z`).getTime() - new Date(`${normalizeDateOnly(dataPrevista)}T00:00:00Z`).getTime()) / (1000 * 60 * 60 * 24)));

export function PurchaseWidgets() {
  const [ordini, setOrdini] = useState<OrdineAcquistoLista[] | null>(null);

  useEffect(() => {
    acquistiApi.list().then(setOrdini).catch(() => setOrdini([]));
  }, []);

  if (!ordini) {
    return <div className="text-center py-12 text-sm text-[#6B7280]">Caricamento widget acquisti…</div>;
  }

  const oggiDateOnly = getTodayLocalDateOnly();

  const ordiniInRitardo = ordini
    .filter((o) => STATI_RITARDO.has(o.stato) && o.data_prevista && normalizeDateOnly(o.data_prevista) < oggiDateOnly)
    .sort((a, b) => giorniRitardo(b.data_prevista!, oggiDateOnly) - giorniRitardo(a.data_prevista!, oggiDateOnly));

  const statusData = (Object.keys(STATO_CONFIG) as StatoOrdineAcquisto[])
    .map((stato) => ({ name: STATO_CONFIG[stato].label, value: ordini.filter((o) => o.stato === stato).length, color: STATO_CONFIG[stato].color }))
    .filter((s) => s.value > 0);

  const fornitoriMap = new Map<number, { nome: string; ordini: number; importo: number; fornitoreId: number }>();
  for (const o of ordini) {
    const entry = fornitoriMap.get(o.fornitore_id) ?? { nome: o.fornitore, ordini: 0, importo: 0, fornitoreId: o.fornitore_id };
    entry.ordini += 1;
    entry.importo += Number(o.importo_totale ?? 0);
    fornitoriMap.set(o.fornitore_id, entry);
  }
  const topSuppliers = Array.from(fornitoriMap.values())
    .sort((a, b) => b.importo - a.importo)
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Stato Approvvigionamenti */}
      <div className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center">
            <PieChartIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2D2D2D]">Stato Approvvigionamenti</h3>
            <p className="text-xs text-[#6B7280]">Distribuzione ordini per stato</p>
          </div>
        </div>

        {statusData.length === 0 ? (
          <div className="text-center py-4 text-xs text-[#6B7280]">Nessun ordine registrato</div>
        ) : (
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={80} height={80}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={24}
                  outerRadius={38}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="flex-1 space-y-1">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-[#6B7280]">{item.name}</span>
                  </div>
                  <div className="text-xs font-medium text-[#2D2D2D]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ordini in Ritardo */}
      <div className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-xl p-4 border border-[#F59E0B]/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#92400E]">Ordini in Ritardo</h3>
            <p className="text-xs text-[#92400E]/70">Richiedono azione</p>
          </div>
        </div>

        <div className="space-y-1.5">
          {ordiniInRitardo.length === 0 && (
            <div className="text-xs text-[#92400E]/60 text-center py-2">Nessun ordine in ritardo</div>
          )}
          {ordiniInRitardo.slice(0, 2).map((order) => (
            <div
              key={order.id}
              className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-xs text-[#92400E] font-mono">OA-{String(order.id).padStart(4, '0')}</div>
                <div className="text-xs text-[#92400E]/70">{order.fornitore}</div>
              </div>
              <div className="px-1.5 py-0.5 bg-[#EF4444] text-white rounded text-xs font-medium">
                {giorniRitardo(order.data_prevista!, oggiDateOnly)}gg
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Fornitori */}
      <div className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#17E88F] to-[#0FA67A] rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2D2D2D]">Top Fornitori</h3>
            <p className="text-xs text-[#6B7280]">Per importo ordinato</p>
          </div>
        </div>

        <div className="space-y-1.5">
          {topSuppliers.length === 0 && (
            <div className="text-center py-2 text-xs text-[#6B7280]">Nessun ordine registrato</div>
          )}
          {topSuppliers.slice(0, 2).map((supplier, index) => (
            <div
              key={supplier.fornitoreId}
              className="flex items-center justify-between px-3 py-2 bg-[#F7F9FC] rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#17E88F] text-white rounded-md flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <span className="text-xs font-medium text-[#2D2D2D] truncate">{supplier.nome}</span>
              </div>
              <span className="text-xs font-medium text-[#2D2D2D]">{formatCurrency(supplier.importo)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
