import { useState } from 'react';
import { Plus, GitMerge, Package, ArrowLeftRight, ClipboardEdit } from 'lucide-react';
import { WarehouseKPIs } from './components/WarehouseKPIs';
import { WarehouseTreeView } from './components/WarehouseTreeView';
import { WarehouseWidgets } from './components/WarehouseWidgets';
import { StockTable } from './components/StockTable';
import { StockMovementsTimeline } from './components/StockMovementsTimeline';
import { NewMovementModal } from './components/NewMovementModal';
import { PageTabBar, TabConfig } from '../../components/ui/PageTabBar';

type WarehouseTab = 'struttura' | 'giacenze' | 'movimenti' | 'rettifiche';

const tabs: TabConfig[] = [
  { id: 'struttura', label: 'Struttura', icon: GitMerge },
  { id: 'giacenze', label: 'Giacenze', icon: Package },
  { id: 'movimenti', label: 'Movimenti', icon: ArrowLeftRight },
  { id: 'rettifiche', label: 'Rettifiche', icon: ClipboardEdit },
];

const rettificheData: {id:number;prodotto:string;sku:string;ubicazione:string;quantitaPrecedente:number;quantitaNuova:number;nota:string;utente:string;data:string}[] = [];

export function WarehousePage() {
  const [activeTab, setActiveTab] = useState<WarehouseTab>('struttura');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getActionButton = () => {
    switch (activeTab) {
      case 'struttura': return { label: 'Nuova Ubicazione', icon: Plus };
      case 'giacenze': return { label: 'Aggiorna Giacenze', icon: Plus };
      case 'movimenti': return { label: 'Nuovo Movimento', icon: Plus };
      case 'rettifiche': return { label: 'Nuova Rettifica', icon: Plus };
    }
  };

  const action = getActionButton();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Magazzino</h1>
          <p className="text-sm text-[#6B7280] mt-1">Gestione struttura, giacenze e movimenti</p>
        </div>
        <button
          onClick={() => activeTab === 'movimenti' && setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
        <PageTabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as WarehouseTab)} />

        <div className="p-6 space-y-6">
          {activeTab === 'struttura' && (
            <>
              <WarehouseKPIs />
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                <div className="lg:col-span-7">
                  <WarehouseTreeView />
                </div>
                <div className="lg:col-span-3">
                  <WarehouseWidgets />
                </div>
              </div>
            </>
          )}

          {activeTab === 'giacenze' && (
            <StockTable />
          )}

          {activeTab === 'movimenti' && (
            <StockMovementsTimeline />
          )}

          {activeTab === 'rettifiche' && (
            <div className="space-y-6">
              <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4 flex items-start gap-3">
                <ClipboardEdit className="w-5 h-5 text-[#D97706] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#92400E]">Rettifiche manuali giacenza</p>
                  <p className="text-xs text-[#B45309] mt-0.5">Le rettifiche manuali generano un movimento di tipo RETTIFICA e richiedono una nota obbligatoria. Solo Admin e Responsabile Magazzino possono eseguire rettifiche.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F7F9FC] border-b border-[#E5EAF2]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Prodotto / SKU</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ubicazione</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Qtà Precedente</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Qtà Nuova</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Delta</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Nota</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Utente / Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAF2]">
                    {rettificheData.map((r) => {
                      const delta = r.quantitaNuova - r.quantitaPrecedente;
                      return (
                        <tr key={r.id} className="hover:bg-[#F7F9FC] transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-[#2D2D2D] truncate max-w-[180px]">{r.prodotto}</p>
                            <p className="text-xs text-[#6B7280]">{r.sku}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#374151]">{r.ubicazione}</td>
                          <td className="px-4 py-3 text-sm text-right text-[#374151]">{r.quantitaPrecedente}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-[#2D2D2D]">{r.quantitaNuova}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm font-semibold ${delta < 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                              {delta > 0 ? '+' : ''}{delta}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#6B7280] max-w-[200px] truncate">{r.nota}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-[#374151]">{r.utente}</p>
                            <p className="text-xs text-[#9CA3AF]">{r.data}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <NewMovementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
