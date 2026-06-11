import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { acquistiApi } from '../../../api/acquistiApi';
import { fornitoriApi } from '../../../api/fornitoriApi';
import type { OrdineAcquistoLista, StatoOrdineAcquisto } from '../../../types/acquisti';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const ATTIVI: ReadonlySet<StatoOrdineAcquisto> = new Set(['BOZZA', 'INVIATO', 'CONFERMATO', 'IN_RICEZIONE']);

const STATO_CONFIG: Record<StatoOrdineAcquisto, { label: string; color: string }> = {
  BOZZA:        { label: 'Bozza',        color: '#6B7280' },
  INVIATO:      { label: 'Inviato',      color: '#3B82F6' },
  CONFERMATO:   { label: 'Confermato',   color: '#8B5CF6' },
  IN_RICEZIONE: { label: 'In Ricezione', color: '#F59E0B' },
  COMPLETATO:   { label: 'Completato',   color: '#22C55E' },
  ANNULLATO:    { label: 'Annullato',    color: '#EF4444' },
};

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const giorniRitardo = (dataPrevista: string, oggi: Date) =>
  Math.max(1, Math.ceil((oggi.getTime() - new Date(dataPrevista).getTime()) / (1000 * 60 * 60 * 24)));

export function PurchaseWidgets() {
  const [ordini, setOrdini] = useState<OrdineAcquistoLista[] | null>(null);
  const [leadTimeByFornitore, setLeadTimeByFornitore] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    acquistiApi.list().then(setOrdini).catch(() => setOrdini([]));
    fornitoriApi.list()
      .then((fornitori) => setLeadTimeByFornitore(new Map(
        fornitori.filter((f) => f.lead_time_giorni != null).map((f) => [f.id, f.lead_time_giorni as number])
      )))
      .catch(() => {});
  }, []);

  if (!ordini) {
    return <div className="text-center py-12 text-sm text-[#6B7280]">Caricamento widget acquisti…</div>;
  }

  const oggi = new Date();
  const domani = new Date(oggi.getTime() + 24 * 60 * 60 * 1000);

  const ordiniInRitardo = ordini
    .filter((o) => ATTIVI.has(o.stato) && o.data_prevista && new Date(o.data_prevista) < oggi)
    .sort((a, b) => giorniRitardo(b.data_prevista!, oggi) - giorniRitardo(a.data_prevista!, oggi));

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

  const ricezioniParziali = ordini.filter((o) => o.stato === 'IN_RICEZIONE').length;
  const consegneImminenti = ordini.filter((o) => ATTIVI.has(o.stato) && o.data_prevista && sameDay(new Date(o.data_prevista), domani)).length;

  const alerts = [
    ordiniInRitardo.length > 0 && { tipo: 'PO in ritardo', messaggio: `${ordiniInRitardo.length} ordini oltre la data prevista`, color: 'text-[#EF4444]', bg: 'bg-[#FEE2E2]' },
    ricezioniParziali > 0 && { tipo: 'In ricezione', messaggio: `${ricezioniParziali} ordini in fase di ricezione`, color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]' },
    consegneImminenti > 0 && { tipo: 'Consegna imminente', messaggio: `${consegneImminenti} ordini previsti domani`, color: 'text-[#3B82F6]', bg: 'bg-[#DBEAFE]' },
  ].filter((a): a is { tipo: string; messaggio: string; color: string; bg: string } => Boolean(a));

  return (
    <div className="space-y-6">
      {/* Ordini in Ritardo */}
      <div className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-2xl p-6 border border-[#F59E0B]/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#92400E]">Ordini in Ritardo</h3>
            <p className="text-xs text-[#92400E]/70">Richiedono azione</p>
          </div>
        </div>

        <div className="space-y-3">
          {ordiniInRitardo.length === 0 && (
            <div className="text-xs text-[#92400E]/60 text-center py-2">Nessun ordine in ritardo</div>
          )}
          {ordiniInRitardo.slice(0, 4).map((order) => (
            <div
              key={order.id}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-3 hover:bg-white transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm text-[#92400E] font-mono">OA-{String(order.id).padStart(4, '0')}</div>
                  <div className="text-xs text-[#92400E]/70 mt-0.5">{order.fornitore}</div>
                </div>
                <div className="px-2 py-1 bg-[#EF4444] text-white rounded-lg text-xs font-medium">
                  {giorniRitardo(order.data_prevista!, oggi)}gg
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stato Approvvigionamenti */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <h3 className="font-semibold text-[#2D2D2D] mb-6">Stato Approvvigionamenti</h3>

        {statusData.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#6B7280]">Nessun ordine registrato</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-[#6B7280]">{item.name}</span>
                  </div>
                  <div className="text-sm font-medium text-[#2D2D2D]">{item.value}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Top Fornitori */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#17E88F] to-[#0FA67A] rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2D2D2D]">Top Fornitori</h3>
            <p className="text-xs text-[#6B7280]">Per importo ordinato</p>
          </div>
        </div>

        <div className="space-y-3">
          {topSuppliers.length === 0 && (
            <div className="text-center py-4 text-sm text-[#6B7280]">Nessun ordine registrato</div>
          )}
          {topSuppliers.map((supplier, index) => {
            const leadTime = leadTimeByFornitore.get(supplier.fornitoreId);
            return (
              <div
                key={supplier.fornitoreId}
                className="p-3 bg-[#F7F9FC] rounded-xl hover:bg-[#F0FDF7] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-[#17E88F] text-white rounded-lg flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="font-medium text-sm text-[#2D2D2D]">{supplier.nome}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-[#6B7280]">Ordini</div>
                    <div className="font-medium text-[#2D2D2D]">{supplier.ordini}</div>
                  </div>
                  <div>
                    <div className="text-[#6B7280]">Importo</div>
                    <div className="font-medium text-[#2D2D2D]">{formatCurrency(supplier.importo)}</div>
                  </div>
                  <div>
                    <div className="text-[#6B7280]">Lead Time</div>
                    <div className="font-medium text-[#2D2D2D]">{leadTime != null ? `${leadTime} gg` : '—'}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert Operativi */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2D2D2D]">Alert Operativi</h3>
            <p className="text-xs text-[#6B7280]">Notifiche attive</p>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.length === 0 && (
            <div className="text-center py-4 text-sm text-[#6B7280]">Nessun alert operativo</div>
          )}
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-3 ${alert.bg} rounded-xl`}
            >
              <div className="flex items-start gap-2">
                <Bell className={`w-4 h-4 ${alert.color} mt-0.5`} />
                <div className="flex-1">
                  <div className={`font-medium text-sm ${alert.color}`}>{alert.tipo}</div>
                  <div className="text-xs text-[#6B7280] mt-1">{alert.messaggio}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
