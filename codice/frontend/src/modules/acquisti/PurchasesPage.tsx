import { useState } from 'react';
import { Plus, ShoppingCart, BarChart2 } from 'lucide-react';
import { PurchaseKPIs } from './components/PurchaseKPIs';
import { PurchaseOrdersTable } from './components/PurchaseOrdersTable';
import { PurchaseWidgets } from './components/PurchaseWidgets';
import { SuppliersPerformance } from './components/SuppliersPerformance';
import { OrderDetailDrawer } from './components/OrderDetailDrawer';
import { NewPurchaseOrderModal } from './components/NewPurchaseOrderModal';
import { PageTabBar, type TabConfig } from '../../components/ui/PageTabBar';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Acquisti</h1>
          <p className="text-sm text-[#6B7280] mt-1">Gestione ordini e KPI acquisti</p>
        </div>
        {activeTab !== 'kpi' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Nuovo Ordine Acquisto
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
        <PageTabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as PurchaseTab)} />

        <div className="p-6 space-y-6">
          {activeTab === 'ordini' && (
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              <div className="lg:col-span-7">
                <PurchaseOrdersTable onOrderClick={setSelectedOrderId} reloadKey={reloadKey} />
              </div>
              <div className="lg:col-span-3">
                <PurchaseWidgets />
              </div>
            </div>
          )}

          {activeTab === 'kpi' && (
            <div className="space-y-6">
              <PurchaseKPIs />
              <SuppliersPerformance />
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
