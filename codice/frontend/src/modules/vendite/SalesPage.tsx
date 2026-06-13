import { useEffect, useState } from 'react';
import { Plus, ShoppingBag, BarChart2, MapPin, CheckSquare, Clock, Download } from 'lucide-react';
import { toast } from 'sonner';
import { SalesKPIs } from './components/SalesKPIs';
import { SalesOrdersTable } from './components/SalesOrdersTable';
import { SalesWidgets } from './components/SalesWidgets';
import { SalesChart } from './components/SalesChart';
import { TopClienti } from './components/TopClienti';
import { SalesOrderDrawer } from './components/SalesOrderDrawer';
import { NewSalesOrderModal } from './components/NewSalesOrderModal';
import { PageTabBar, type TabConfig } from '../../components/ui/PageTabBar';
import { ordiniApi } from '../../api/ordiniApi';
import { clientiApi } from '../../api/clientiApi';
import { downloadBlob } from '../../api/client';
import type { OrdineVendita } from '../../types/ordini';
import type { Cliente } from '../../types/clienti';
import type { SalesKpiItem } from './components/SalesKPIs';
import type { SalesChartPoint } from './components/SalesChart';
import type { TopClienteItem } from './components/TopClienti';

type SalesTab = 'ordini' | 'picking' | 'kpi';

const tabs: TabConfig[] = [
  { id: 'ordini', label: 'Ordini', icon: ShoppingBag },
  { id: 'kpi', label: 'KPI Vendite', icon: BarChart2 },
];

const pickingData: {id:string;ordine:string;cliente:string;dataConsegna:string;righe:{sku:string;prodotto:string;ubicazione:string;qtaRichiesta:number;qtaPrelevata:number;completato:boolean}[];stato:string;operatore:string}[] = [];

const fmtEuro = (n: number): string =>
  `EUR ${n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtPct = (n: number): string =>
  `${n.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

const startOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1);

const monthKey = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const monthLabel = (d: Date): string =>
  d.toLocaleDateString('it-IT', { month: 'short' }).replace('.', '');

export function SalesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<SalesTab>('ordini');
  const [expandedPicking, setExpandedPicking] = useState<string | null>('PCK-001');
  const [reloadKey, setReloadKey] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [salesOrders, setSalesOrders] = useState<OrdineVendita[]>([]);
  const [salesClients, setSalesClients] = useState<Cliente[]>([]);
  const [destinazioniByCliente, setDestinazioniByCliente] = useState<Record<number, number>>({});

  useEffect(() => {
    if (activeTab !== 'kpi') return;
    let alive = true;

    Promise.all([
      ordiniApi.list(),
      clientiApi.list(),
    ])
      .then(async ([orders, clients]) => {
        if (!alive) return;
        setSalesOrders(Array.isArray(orders) ? orders : []);
        setSalesClients(Array.isArray(clients) ? clients : []);

        const counts = await Promise.all(
          (Array.isArray(clients) ? clients : []).map(async (cliente) => {
            try {
              const dest = await clientiApi.listDestinazioni(cliente.id);
              return [cliente.id, Array.isArray(dest) ? dest.length : 0] as const;
            } catch {
              return [cliente.id, 0] as const;
            }
          })
        );

        if (!alive) return;
        setDestinazioniByCliente(Object.fromEntries(counts));
      })
      .catch((err: any) => {
        if (!alive) return;
        setSalesOrders([]);
        setSalesClients([]);
        setDestinazioniByCliente({});
        toast.error('Errore caricamento KPI vendite', { description: err?.message });
      });

    return () => { alive = false; };
  }, [activeTab, reloadKey]);

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = currentMonthStart;
  const todayKey = now.toDateString();

  const currentMonthOrders = salesOrders.filter((o) => new Date(o.data_ordine) >= currentMonthStart);
  const previousMonthOrders = salesOrders.filter((o) => {
    const date = new Date(o.data_ordine);
    return date >= previousMonthStart && date < previousMonthEnd;
  });

  const activeOrders = salesOrders.filter((o) => o.stato !== 'SPEDITO' && o.stato !== 'ANNULLATO');
  const activeOrdersPrev = previousMonthOrders.filter((o) => o.stato !== 'SPEDITO' && o.stato !== 'ANNULLATO').length;
  const activeOrdersCurr = currentMonthOrders.filter((o) => o.stato !== 'SPEDITO' && o.stato !== 'ANNULLATO').length;
  const valueCurrent = currentMonthOrders.reduce((sum, o) => sum + Number(o.importo_totale ?? 0), 0);
  const valuePrev = previousMonthOrders.reduce((sum, o) => sum + Number(o.importo_totale ?? 0), 0);
  const toShip = salesOrders.filter((o) => o.stato === 'CONFERMATO' && o.stato_picking === 'PICKING_COMPLETATO').length;
  const toShipPrev = previousMonthOrders.filter((o) => o.stato === 'CONFERMATO' && o.stato_picking === 'PICKING_COMPLETATO').length;
  const inPicking = salesOrders.filter((o) => o.stato === 'CONFERMATO' && o.stato_picking === 'IN_PICKING').length;
  const inPickingPrev = previousMonthOrders.filter((o) => o.stato === 'CONFERMATO' && o.stato_picking === 'IN_PICKING').length;
  const completedToday = salesOrders.filter((o) => o.stato === 'SPEDITO' && new Date(o.updated_at).toDateString() === todayKey).length;
  const completedPrevToday = previousMonthOrders.filter((o) => o.stato === 'SPEDITO').length;
  const fulfilled = salesOrders.filter((o) => o.stato === 'SPEDITO').length;
  const fulfillableBase = salesOrders.filter((o) => o.stato !== 'ANNULLATO').length;
  const fulfillmentRate = fulfillableBase > 0 ? (fulfilled / fulfillableBase) * 100 : 0;
  const prevFulfillableBase = previousMonthOrders.filter((o) => o.stato !== 'ANNULLATO').length;
  const prevFulfilled = previousMonthOrders.filter((o) => o.stato === 'SPEDITO').length;
  const prevFulfillmentRate = prevFulfillableBase > 0 ? (prevFulfilled / prevFulfillableBase) * 100 : 0;

  const trend = (curr: number, prev: number): number => {
    if (prev === 0) return curr === 0 ? 0 : 100;
    return ((curr - prev) / prev) * 100;
  };

  const salesKpis: SalesKpiItem[] = [
    {
      title: 'Ordini Attivi',
      value: String(activeOrders.length),
      subtitle: `${activeOrdersCurr} nel mese corrente`,
      trend: trend(activeOrdersCurr, activeOrdersPrev),
      iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB]',
    },
    {
      title: 'Valore Ordini',
      value: fmtEuro(salesOrders.reduce((sum, o) => sum + Number(o.importo_totale ?? 0), 0)),
      subtitle: 'Valore totale portafoglio',
      trend: trend(valueCurrent, valuePrev),
      iconBg: 'bg-gradient-to-br from-[#17E88F] to-[#0FA67A]',
    },
    {
      title: 'Ordini da Spedire',
      value: String(toShip),
      subtitle: 'Picking completato, pronti spedizione',
      trend: trend(toShip, toShipPrev),
      iconBg: 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]',
      isWarning: toShip > 0,
    },
    {
      title: 'Ordini in Picking',
      value: String(inPicking),
      subtitle: 'In lavorazione magazzino',
      trend: trend(inPicking, inPickingPrev),
      iconBg: 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]',
    },
    {
      title: 'Completati Oggi',
      value: String(completedToday),
      subtitle: 'Ordini spediti oggi',
      trend: trend(completedToday, completedPrevToday),
      iconBg: 'bg-gradient-to-br from-[#06B6D4] to-[#0891B2]',
    },
    {
      title: 'Tasso Evasione',
      value: fmtPct(fulfillmentRate),
      subtitle: 'Spediti su ordini non annullati',
      trend: trend(fulfillmentRate, prevFulfillmentRate),
      iconBg: 'bg-gradient-to-br from-[#17E88F] to-[#059669]',
    },
  ];

  const salesChartData: SalesChartPoint[] = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
    const key = monthKey(date);
    const monthOrders = salesOrders.filter((o) => monthKey(new Date(o.data_ordine)) === key);
    return {
      mese: monthLabel(date),
      fatturato: monthOrders.reduce((sum, o) => sum + Number(o.importo_totale ?? 0), 0),
      ordini: monthOrders.length,
    };
  });

  const topClienti: TopClienteItem[] = salesClients
    .map((cliente) => {
      const ordiniCliente = salesOrders.filter((o) => o.cliente_id === cliente.id);
      const shipped = ordiniCliente.filter((o) => o.stato === 'SPEDITO').length;
      const performance = ordiniCliente.length > 0 ? Math.round((shipped / ordiniCliente.length) * 100) : 0;
      const latest = ordiniCliente
        .map((o) => new Date(o.data_ordine))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      return {
        nome: cliente.ragione_sociale,
        ordiniTotali: ordiniCliente.length,
        valoreOrdini: fmtEuro(ordiniCliente.reduce((sum, o) => sum + Number(o.importo_totale ?? 0), 0)),
        ultimoOrdine: latest ? latest.toLocaleDateString('it-IT') : '-',
        destinazioni: destinazioniByCliente[cliente.id] ?? 0,
        performance,
      };
    })
    .filter((c) => c.ordiniTotali > 0)
    .sort((a, b) => b.ordiniTotali - a.ordiniTotali || b.performance - a.performance)
    .slice(0, 8);

  const getActionLabel = () => {
    switch (activeTab) {
      case 'ordini': return 'Nuovo Ordine Cliente';
      default: return 'Nuovo Ordine Cliente';
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadBlob('/ordini/export', 'ordini-vendita.xlsx');
    } catch (err: any) {
      toast.error('Export fallito', { description: err?.message });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Vendite</h1>
          <p className="text-sm text-[#6B7280] mt-1">Gestione ordini clienti, picking e KPI vendite</p>
        </div>
        {activeTab !== 'kpi' && (
          <div className="flex items-center gap-3">
            {activeTab === 'ordini' && (
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all flex items-center gap-2 font-medium disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Export...' : 'Esporta Excel'}
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              {getActionLabel()}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
        <PageTabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as SalesTab)} />

        <div className="p-6 space-y-6">
          {activeTab === 'ordini' && (
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              <div className="lg:col-span-7">
                <SalesOrdersTable onOrderClick={setSelectedOrderId} reloadKey={reloadKey} />
              </div>
              <div className="lg:col-span-3">
                <SalesWidgets />
              </div>
            </div>
          )}

          {activeTab === 'picking' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6B7280]">Lista picking attivi — ordina per ubicazione per ottimizzare il percorso</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-[#D97706]"><Clock className="w-3 h-3" /> IN_PICKING</span>
                  <span className="flex items-center gap-1 text-[#22C55E]"><CheckSquare className="w-3 h-3" /> PICKING_COMPLETATO</span>
                </div>
              </div>

              {pickingData.map((pick) => {
                const completate = pick.righe.filter(r => r.completato).length;
                const pct = Math.round((completate / pick.righe.length) * 100);
                const isExpanded = expandedPicking === pick.id;
                return (
                  <div key={pick.id} className="border border-[#E5EAF2] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedPicking(isExpanded ? null : pick.id)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F7F9FC] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-[#17E88F]">{pick.id}</span>
                        <span className="text-sm text-[#374151]">{pick.ordine}</span>
                        <span className="text-sm text-[#6B7280]">{pick.cliente}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pick.stato === 'PICKING_COMPLETATO'
                            ? 'bg-[#DCFCE7] text-[#16A34A]'
                            : 'bg-[#FEF3C7] text-[#D97706]'
                        }`}>
                          {pick.stato === 'PICKING_COMPLETATO' ? <CheckSquare className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {pick.stato.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-[#E5EAF2] rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${pct === 100 ? 'bg-[#16A34A]' : 'bg-[#D97706]'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-[#6B7280]">{completate}/{pick.righe.length}</span>
                        </div>
                        <span className="text-xs text-[#9CA3AF]">Cons. {pick.dataConsegna}</span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-[#E5EAF2]">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#F7F9FC]">
                              <th className="text-left px-5 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ubicazione</th>
                              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">SKU</th>
                              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Prodotto</th>
                              <th className="text-center px-4 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Qtà</th>
                              <th className="text-center px-4 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Prelevato</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5EAF2]">
                            {pick.righe.map((riga, i) => (
                              <tr key={i} className={`transition-colors ${riga.completato ? 'bg-[#F0FFF8]' : 'hover:bg-[#FAFAFA]'}`}>
                                <td className="px-5 py-3 text-sm text-[#374151] flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                  {riga.ubicazione}
                                </td>
                                <td className="px-4 py-3 text-xs font-mono text-[#6B7280]">{riga.sku}</td>
                                <td className="px-4 py-3 text-sm text-[#374151]">{riga.prodotto}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-[#2D2D2D]">{riga.qtaRichiesta}</td>
                                <td className="px-4 py-3 text-center">
                                  {riga.completato
                                    ? <CheckSquare className="w-5 h-5 text-[#16A34A] mx-auto" />
                                    : <span className="text-sm text-[#D97706]">{riga.qtaPrelevata}/{riga.qtaRichiesta}</span>
                                  }
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'kpi' && (
            <div className="space-y-6">
              <SalesKPIs kpis={salesKpis} />
              <SalesChart data={salesChartData} />
              <TopClienti clienti={topClienti} />
            </div>
          )}
        </div>
      </div>

      <SalesOrderDrawer
        orderId={selectedOrderId}
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />

      <NewSalesOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}
