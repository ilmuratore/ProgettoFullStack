import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, ShoppingBag, BarChart2, CheckSquare, Clock, Download } from 'lucide-react';
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
import { useAuthStore } from '../../store/authStore';
import type { OrdineVendita } from '../../types/ordini';
import type { Cliente } from '../../types/clienti';
import type { SalesKpiItem } from './components/SalesKPIs';
import type { SalesChartPoint } from './components/SalesChart';
import type { TopClienteItem } from './components/TopClienti';

type SalesTab = 'ordini' | 'kpi';

const tabs: TabConfig[] = [
  { id: 'ordini', label: 'Ordini', icon: ShoppingBag },
  { id: 'kpi', label: 'KPI Vendite', icon: BarChart2 },
];

const fmtEuro = (n: number): string =>
  `EUR ${n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtPct = (n: number): string =>
  `${n.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

const startOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1);

const monthKey = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const monthLabel = (d: Date): string =>
  d.toLocaleDateString('it-IT', { month: 'short' }).replace('.', '');

export function SalesPage() {
  const { hasPermesso } = useAuthStore();
  const canCreateOrders = hasPermesso('ordini:write');
  const accessibleTabs = useMemo(
    () => tabs
      .map((tab) => tab.id as SalesTab)
      .filter((tab) => {
        switch (tab) {
          case 'ordini': return hasPermesso('ordini:read');
          case 'picking': return hasPermesso('ordini:read');
          case 'kpi': return hasPermesso('ordini:read');
        }
      }),
    [hasPermesso]
  );
  const initialTab = accessibleTabs[0] ?? 'ordini';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<SalesTab>(initialTab);
  const [reloadKey, setReloadKey] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [salesOrders, setSalesOrders] = useState<OrdineVendita[]>([]);
  const [salesClients, setSalesClients] = useState<Cliente[]>([]);
  const [destinazioniByCliente, setDestinazioniByCliente] = useState<Record<number, number>>({});
  const navigate = useNavigate();
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab((prev) => (prev === initialTab ? prev : initialTab));
  }, [initialTab]);

  useEffect(() => {
    let alive = true;
    ordiniApi.list()
      .then((orders) => {
        if (alive) setSalesOrders(Array.isArray(orders) ? orders : []);
      })
      .catch((err: any) => {
        if (!alive) return;
        setSalesOrders([]);
        toast.error('Errore caricamento ordini vendita', { description: err?.message });
      });
    return () => { alive = false; };
  }, [reloadKey]);

  useEffect(() => {
    if (activeTab !== 'kpi') return;
    let alive = true;

    clientiApi.list()
      .then(async (clients) => {
        if (!alive) return;
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

  const scrollToTable = () =>
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const salesKpis: SalesKpiItem[] = [
    {
      title: 'Ordini Attivi',
      value: String(activeOrders.length),
      subtitle: `${activeOrdersCurr} nel mese corrente`,
      trend: trend(activeOrdersCurr, activeOrdersPrev),
      iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB]',
      onClick: scrollToTable,
    },
    {
      title: 'Valore Ordini',
      value: fmtEuro(salesOrders.reduce((sum, o) => sum + Number(o.importo_totale ?? 0), 0)),
      subtitle: 'Valore totale portafoglio',
      trend: trend(valueCurrent, valuePrev),
      iconBg: 'bg-gradient-to-br from-[#17E88F] to-[#0FA67A]',
      onClick: scrollToTable,
    },
    {
      title: 'Completati Oggi',
      value: String(completedToday),
      subtitle: 'Ordini consegnati oggi',
      trend: trend(completedToday, completedPrevToday),
      iconBg: 'bg-gradient-to-br from-[#06B6D4] to-[#0891B2]',
      onClick: () => navigate('/vendite?stato=SPEDITO'),
    },
    {
      title: 'Tasso Evasione',
      value: fmtPct(fulfillmentRate),
      subtitle: 'Consegnati su ordini non annullati',
      trend: trend(fulfillmentRate, prevFulfillmentRate),
      iconBg: 'bg-gradient-to-br from-[#17E88F] to-[#059669]',
      onClick: () => setActiveTab('kpi'),
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
          <p className="text-sm text-[#6B7280] mt-1">Gestione ordini clienti e KPI vendite</p>
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
            {canCreateOrders && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                {getActionLabel()}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
        <PageTabBar
          tabs={tabs.map((tab) => ({ ...tab, disabled: !accessibleTabs.includes(tab.id as SalesTab) }))}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as SalesTab)}
        />

        <div className="p-6 space-y-6">
          {activeTab === 'ordini' && (
            <div className="space-y-6">
              <SalesKPIs kpis={salesKpis} />
              <div ref={tableRef}>
                <SalesOrdersTable onOrderClick={setSelectedOrderId} reloadKey={reloadKey} />
              </div>
            </div>
          )}

          {activeTab === 'kpi' && (
            <div className="space-y-6">
              <SalesWidgets orders={salesOrders} />
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
        onUpdated={() => setReloadKey((k) => k + 1)}
      />

      <NewSalesOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}
