import { useEffect, useRef, useState } from 'react';
import { Plus, ShoppingCart, BarChart2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { PurchaseKPIs } from './components/PurchaseKPIs';
import { PurchaseOrdersTable } from './components/PurchaseOrdersTable';
import { PurchaseWidgets } from './components/PurchaseWidgets';
import { PurchaseInsights } from './components/PurchaseInsights';
import { SuppliersPerformance } from './components/SuppliersPerformance';
import { OrderDetailDrawer } from './components/OrderDetailDrawer';
import { NewPurchaseOrderModal } from './components/NewPurchaseOrderModal';
import { PageTabBar, type TabConfig } from '../../components/ui/PageTabBar';
import { downloadBlob } from '../../api/client';

type PurchaseTab = 'ordini' | 'kpi';

const tabs: TabConfig[] = [
  { id: 'ordini', label: 'Ordini', icon: ShoppingCart },
  { id: 'kpi', label: 'KPI Acquisti', icon: BarChart2 },
];

export function PurchasesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<PurchaseTab>('ordini');
  const [reloadKey, setReloadKey] = useState(0);
  const [exporting, setExporting] = useState(false);

  const ordersTableRef = useRef<HTMLDivElement>(null);
  const overdueRef = useRef<HTMLDivElement>(null);
  const leadTimeRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef<'orders' | 'overdue' | 'leadtime' | null>(null);

  useEffect(() => {
    const target = pendingScrollRef.current;
    if (!target) return;
    pendingScrollRef.current = null;
    const ref = target === 'orders' ? ordersTableRef : target === 'overdue' ? overdueRef : leadTimeRef;
    requestAnimationFrame(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [activeTab]);

  const scrollToOrdersTable = () => {
    if (activeTab !== 'ordini') {
      pendingScrollRef.current = 'orders';
      setActiveTab('ordini');
    } else {
      ordersTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToOverdue = () => {
    if (activeTab !== 'kpi') {
      pendingScrollRef.current = 'overdue';
      setActiveTab('kpi');
    } else {
      overdueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToLeadTime = () => {
    if (activeTab !== 'kpi') {
      pendingScrollRef.current = 'leadtime';
      setActiveTab('kpi');
    } else {
      leadTimeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadBlob('/ordini-acquisto/export', 'ordini-acquisto.xlsx');
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
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Acquisti</h1>
          <p className="text-sm text-[#6B7280] mt-1">Gestione ordini e KPI acquisti</p>
        </div>
        {activeTab !== 'kpi' && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all flex items-center gap-2 font-medium disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Export...' : 'Esporta Excel'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Nuovo Ordine Acquisto
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
        <PageTabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as PurchaseTab)} />

        <div className="p-6 space-y-6">
          {activeTab === 'ordini' && (
            <div className="space-y-6">
              <PurchaseKPIs
                onOrdiniAttiviClick={scrollToOrdersTable}
                onValoreApertoClick={scrollToOrdersTable}
                onOrdiniRitardoClick={scrollToOverdue}
                onLeadTimeClick={scrollToLeadTime}
              />
              <div ref={ordersTableRef}>
                <PurchaseOrdersTable onOrderClick={setSelectedOrderId} reloadKey={reloadKey} />
              </div>
              <PurchaseWidgets />
            </div>
          )}

          {activeTab === 'kpi' && (
            <div className="space-y-6">
              <div ref={overdueRef}>
                <PurchaseInsights onOrderClick={setSelectedOrderId} />
              </div>
              <div ref={leadTimeRef}>
                <SuppliersPerformance />
              </div>
            </div>
          )}
        </div>
      </div>

      <OrderDetailDrawer
        orderId={selectedOrderId}
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        onStatusChange={() => setReloadKey((k) => k + 1)}
      />

      <NewPurchaseOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}
