import { useEffect, useState } from 'react';
import { Plus, ShoppingCart, PackageCheck, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { PurchaseKPIs } from './components/PurchaseKPIs';
import { PurchaseOrdersTable } from './components/PurchaseOrdersTable';
import { PurchaseWidgets } from './components/PurchaseWidgets';
import { GoodsReceiptsTimeline } from './components/GoodsReceiptsTimeline';
import { SuppliersPerformance } from './components/SuppliersPerformance';
import { OrderDetailDrawer } from './components/OrderDetailDrawer';
import { NewPurchaseOrderModal } from './components/NewPurchaseOrderModal';
import { PageTabBar, type TabConfig } from '../../components/ui/PageTabBar';
import { ricezioniApi } from '../../api/ricezioniApi';
import type { Ricezione, StatoOrdineAcquisto } from '../../types/acquisti';

type PurchaseTab = 'ordini' | 'ricezioni' | 'kpi';

const tabs: TabConfig[] = [
  { id: 'ordini', label: 'Ordini', icon: ShoppingCart },
  { id: 'ricezioni', label: 'Ricezioni', icon: PackageCheck },
  { id: 'kpi', label: 'KPI Acquisti', icon: BarChart2 },
];

const fmtDataOra = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString('it-IT') : '—';

const statoLabel: Record<StatoOrdineAcquisto, { bg: string; text: string; label: string }> = {
  BOZZA: { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Bozza' },
  INVIATO: { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]', label: 'Inviato' },
  CONFERMATO: { bg: 'bg-[#EDE9FE]', text: 'text-[#8B5CF6]', label: 'Confermato' },
  IN_RICEZIONE: { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]', label: 'In Ricezione' },
  COMPLETATO: { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', label: 'Completato' },
  ANNULLATO: { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Annullato' },
};

export function PurchasesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<PurchaseTab>('ordini');
  const [reloadKey, setReloadKey] = useState(0);
  const [ricezioni, setRicezioni] = useState<Ricezione[]>([]);
  const [loadingRic, setLoadingRic] = useState(false);

  useEffect(() => {
    if (activeTab !== 'ricezioni') return;
    let alive = true;
    setLoadingRic(true);
    ricezioniApi
      .list()
      .then((d) => { if (alive) setRicezioni(d); })
      .catch((err: any) => toast.error('Errore caricamento ricezioni', { description: err?.message }))
      .finally(() => { if (alive) setLoadingRic(false); });
    return () => { alive = false; };
  }, [activeTab, reloadKey]);

  const getActionLabel = () => {
    switch (activeTab) {
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
                <PurchaseOrdersTable onOrderClick={setSelectedOrderId} reloadKey={reloadKey} />
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
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Data Ricezione</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Stato Ordine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAF2]">
                    {loadingRic ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#6B7280]">Caricamento ricezioni...</td></tr>
                    ) : ricezioni.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#6B7280]">Nessuna ricezione registrata.</td></tr>
                    ) : ricezioni.map((r) => {
                      const badge = statoLabel[r.stato_ordine] ?? statoLabel.BOZZA;
                      return (
                        <tr key={r.id} className="hover:bg-[#F7F9FC] transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-[#17E88F]">RIC-{String(r.id).padStart(4, '0')}</td>
                          <td className="px-4 py-3 text-sm text-[#374151]">OA-{String(r.ordine_acquisto_id).padStart(4, '0')}</td>
                          <td className="px-4 py-3 text-sm text-[#374151] max-w-[220px] truncate">{r.fornitore}</td>
                          <td className="px-4 py-3 text-sm text-[#6B7280]">{fmtDataOra(r.data_ricezione)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                              {badge.label}
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
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
      />

      <NewPurchaseOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}
