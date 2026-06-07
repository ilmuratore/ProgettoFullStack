import { useState } from 'react';
import { Plus, ShoppingBag, ListChecks, BarChart2, MapPin, CheckSquare, Clock } from 'lucide-react';
import { SalesKPIs } from './components/SalesKPIs';
import { SalesOrdersTable } from './components/SalesOrdersTable';
import { SalesWidgets } from './components/SalesWidgets';
import { SalesChart } from './components/SalesChart';
import { TopClienti } from './components/TopClienti';
import { SalesOrderDrawer } from './components/SalesOrderDrawer';
import { NewSalesOrderModal } from './components/NewSalesOrderModal';
import { PageTabBar, TabConfig } from '../../components/ui/PageTabBar';

type SalesTab = 'ordini' | 'picking' | 'kpi';

const tabs: TabConfig[] = [
  { id: 'ordini', label: 'Ordini', icon: ShoppingBag },
  { id: 'picking', label: 'Picking', icon: ListChecks },
  { id: 'kpi', label: 'KPI Vendite', icon: BarChart2 },
];

const pickingData: {id:string;ordine:string;cliente:string;dataConsegna:string;righe:{sku:string;prodotto:string;ubicazione:string;qtaRichiesta:number;qtaPrelevata:number;completato:boolean}[];stato:string;operatore:string}[] = [];

export function SalesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SalesTab>('ordini');
  const [expandedPicking, setExpandedPicking] = useState<string | null>('PCK-001');

  const getActionLabel = () => {
    switch (activeTab) {
      case 'ordini': return 'Nuovo Ordine Cliente';
      case 'picking': return 'Avvia Picking';
      default: return 'Nuovo Ordine Cliente';
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
        <PageTabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as SalesTab)} />

        <div className="p-6 space-y-6">
          {activeTab === 'ordini' && (
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              <div className="lg:col-span-7">
                <SalesOrdersTable onOrderClick={setSelectedOrderId} />
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
              <SalesKPIs />
              <SalesChart />
              <TopClienti />
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
      />
    </div>
  );
}
