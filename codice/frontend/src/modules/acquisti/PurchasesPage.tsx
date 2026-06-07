import { useState } from 'react';
import { Plus, ShoppingCart, PackageCheck, BarChart2, CheckCircle2, Clock } from 'lucide-react';
import { PurchaseKPIs } from './components/PurchaseKPIs';
import { PurchaseOrdersTable } from './components/PurchaseOrdersTable';
import { PurchaseWidgets } from './components/PurchaseWidgets';
import { GoodsReceiptsTimeline } from './components/GoodsReceiptsTimeline';
import { SuppliersPerformance } from './components/SuppliersPerformance';
import { OrderDetailDrawer } from './components/OrderDetailDrawer';
import { NewPurchaseOrderModal } from './components/NewPurchaseOrderModal';
import { PageTabBar, type TabConfig } from '../../components/ui/PageTabBar';

type PurchaseTab = 'ordini' | 'ricezioni' | 'kpi';

const tabs: TabConfig[] = [
  { id: 'ordini', label: 'Ordini', icon: ShoppingCart },
  { id: 'ricezioni', label: 'Ricezioni', icon: PackageCheck },
  { id: 'kpi', label: 'KPI Acquisti', icon: BarChart2 },
];

const ricezioniData: {id:string;poId:string;fornitore:string;dataRicezione:string;righe:number;totaleRicevuto:number;totaleAtteso:number;ubicazione:string;stato:string}[] = [];

export function PurchasesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PurchaseTab>('ordini');

  const getActionLabel = () => {
    switch (activeTab) {
      case 'ordini': return 'Nuovo Ordine Acquisto';
      case 'ricezioni': return 'Registra Ricezione';
      default: return 'Nuovo Ordine Acquisto';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Acquisti</h1>
          <p className="text-sm text-[#6B7280] mt-1">Gestione ordini, ricezioni merci e KPI</p>
        </div>
        {activeTab !== 'kpi' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            {getActionLabel()}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
        <PageTabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as PurchaseTab)} />

        <div className="p-6 space-y-6">
          {activeTab === 'ordini' && (
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              <div className="lg:col-span-7">
                <PurchaseOrdersTable onOrderClick={setSelectedOrderId} />
              </div>
              <div className="lg:col-span-3">
                <PurchaseWidgets />
              </div>
            </div>
          )}

          {activeTab === 'ricezioni' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F7F9FC] border-b border-[#E5EAF2]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ricezione</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ordine</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Fornitore</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Data</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Righe</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ubicazione</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Avanzamento</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Stato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAF2]">
                    {ricezioniData.map((r) => {
                      const pct = Math.round((r.totaleRicevuto / r.totaleAtteso) * 100);
                      return (
                        <tr key={r.id} className="hover:bg-[#F7F9FC] transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-[#17E88F]">{r.id}</td>
                          <td className="px-4 py-3 text-sm text-[#374151]">{r.poId}</td>
                          <td className="px-4 py-3 text-sm text-[#374151] max-w-[180px] truncate">{r.fornitore}</td>
                          <td className="px-4 py-3 text-sm text-[#6B7280]">{r.dataRicezione}</td>
                          <td className="px-4 py-3 text-sm text-center text-[#374151]">{r.righe}</td>
                          <td className="px-4 py-3 text-sm text-[#6B7280]">{r.ubicazione}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-[#E5EAF2] rounded-full h-1.5 min-w-[60px]">
                                <div
                                  className={`h-1.5 rounded-full ${pct === 100 ? 'bg-[#16A34A]' : 'bg-[#D97706]'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-[#6B7280] whitespace-nowrap">{r.totaleRicevuto}/{r.totaleAtteso}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              r.stato === 'Completa'
                                ? 'bg-[#DCFCE7] text-[#16A34A]'
                                : 'bg-[#FEF3C7] text-[#D97706]'
                            }`}>
                              {r.stato === 'Completa' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {r.stato}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <GoodsReceiptsTimeline />
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
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />

      <NewPurchaseOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
