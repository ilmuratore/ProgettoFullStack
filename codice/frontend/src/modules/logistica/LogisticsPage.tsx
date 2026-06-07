import { useState } from 'react';
import { Plus, Truck, FileText, BarChart2, Download, Eye } from 'lucide-react';
import { LogisticsKPIs } from '../logistica/components/LogisticsKPIs';
import { ShipmentsTable } from '../logistica/components/ShipmentsTable';
import { LogisticsWidgets } from '../logistica/components/LogisticsWidgets';
import { CourierPerformance } from '../logistica/components/CourierPerformance';
import { AdvancedKPIs } from '../logistica/components/AdvancedKPIs';
import { ShipmentDrawer } from '../logistica/components/ShipmentDrawer';
import { NewShipmentModal } from '../logistica/components/NewShipmentModal';
import { PageTabBar, type TabConfig } from '../../components/ui/PageTabBar';

type LogisticsTab = 'spedizioni' | 'ddt' | 'kpi';

const tabs: TabConfig[] = [
  { id: 'spedizioni', label: 'Spedizioni', icon: Truck },
  { id: 'ddt', label: 'DDT', icon: FileText },
  { id: 'kpi', label: 'KPI Logistica', icon: BarChart2 },
];

const ddtData: {id:string;spedizione:string;ordine:string;cliente:string;corriere:string;dataEmissione:string;peso:string;colli:number;stato:string}[] = [];

const shippingStateBadge = (stato: string) => {
  switch (stato) {
    case 'IN_PREPARAZIONE': return 'bg-[#E2E8F0] text-[#64748B]';
    case 'SPEDITA': return 'bg-[#DBEAFE] text-[#3B82F6]';
    case 'CONSEGNATA': return 'bg-[#DCFCE7] text-[#16A34A]';
    case 'PROBLEMA': return 'bg-[#FEE2E2] text-[#DC2626]';
    default: return 'bg-[#F3F4F6] text-[#6B7280]';
  }
};

export function LogisticsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LogisticsTab>('spedizioni');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Logistica</h1>
          <p className="text-sm text-[#6B7280] mt-1">Gestione spedizioni, DDT e KPI logistici</p>
        </div>
        {activeTab === 'spedizioni' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Nuova Spedizione
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
        <PageTabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as LogisticsTab)} />

        <div className="p-6 space-y-6">
          {activeTab === 'spedizioni' && (
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              <div className="lg:col-span-7">
                <ShipmentsTable onShipmentClick={setSelectedShipmentId} />
              </div>
              <div className="lg:col-span-3">
                <LogisticsWidgets />
              </div>
            </div>
          )}

          {activeTab === 'ddt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6B7280]">Documenti di Trasporto — numerazione progressiva anno/numero</p>
                <button className="px-3 py-1.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Esporta DDT
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F7F9FC] border-b border-[#E5EAF2]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Numero DDT</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Spedizione</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ordine</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Cliente</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Corriere</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Data Emissione</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Colli / Peso</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Stato</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAF2]">
                    {ddtData.map((ddt) => (
                      <tr key={ddt.id} className="hover:bg-[#F7F9FC] transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-[#17E88F]">{ddt.id}</td>
                        <td className="px-4 py-3 text-sm text-[#374151]">{ddt.spedizione}</td>
                        <td className="px-4 py-3 text-sm text-[#374151]">{ddt.ordine}</td>
                        <td className="px-4 py-3 text-sm text-[#374151] max-w-[160px] truncate">{ddt.cliente}</td>
                        <td className="px-4 py-3 text-sm text-[#6B7280]">{ddt.corriere}</td>
                        <td className="px-4 py-3 text-sm text-[#6B7280]">{ddt.dataEmissione}</td>
                        <td className="px-4 py-3 text-sm text-center text-[#374151]">{ddt.colli} colli / {ddt.peso}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${shippingStateBadge(ddt.stato)}`}>
                            {ddt.stato.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-1.5 hover:bg-[#E5EAF2] rounded-lg transition-colors" title="Visualizza">
                              <Eye className="w-4 h-4 text-[#6B7280]" />
                            </button>
                            <button className="p-1.5 hover:bg-[#E5EAF2] rounded-lg transition-colors" title="Scarica PDF">
                              <Download className="w-4 h-4 text-[#6B7280]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'kpi' && (
            <div className="space-y-6">
              <LogisticsKPIs />
              <CourierPerformance />
              <AdvancedKPIs />
            </div>
          )}
        </div>
      </div>

      <ShipmentDrawer
        shipmentId={selectedShipmentId}
        isOpen={!!selectedShipmentId}
        onClose={() => setSelectedShipmentId(null)}
      />

      <NewShipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
