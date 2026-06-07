import { useState } from 'react';
import { Plus, Truck, FileText, BarChart2, Download, Eye } from 'lucide-react';
import { LogisticsKPIs } from './logistics/LogisticsKPIs';
import { ShipmentsTable } from './logistics/ShipmentsTable';
import { LogisticsWidgets } from './logistics/LogisticsWidgets';
import { CourierPerformance } from './logistics/CourierPerformance';
import { AdvancedKPIs } from './logistics/AdvancedKPIs';
import { ShipmentDrawer } from './logistics/ShipmentDrawer';
import { NewShipmentModal } from './logistics/NewShipmentModal';
import { PageTabBar, TabConfig } from './ui/PageTabBar';

type LogisticsTab = 'spedizioni' | 'ddt' | 'kpi';

const tabs: TabConfig[] = [
  { id: 'spedizioni', label: 'Spedizioni', icon: Truck, count: 87 },
  { id: 'ddt', label: 'DDT', icon: FileText, count: 312 },
  { id: 'kpi', label: 'KPI Logistica', icon: BarChart2 },
];

const ddtData = [
  { id: 'DDT/2025/0312', spedizione: 'SHP-2025-312', ordine: 'ORD-2025-089', cliente: 'Logistica Express S.r.l.', corriere: 'BRT Express', dataEmissione: '2025-06-03', peso: '125 kg', colli: 8, stato: 'CONSEGNATA' },
  { id: 'DDT/2025/0311', spedizione: 'SHP-2025-311', ordine: 'ORD-2025-085', cliente: 'Transport Solutions S.p.A.', corriere: 'GLS Logistics', dataEmissione: '2025-06-03', peso: '340 kg', colli: 22, stato: 'SPEDITA' },
  { id: 'DDT/2025/0310', spedizione: 'SHP-2025-310', ordine: 'ORD-2025-081', cliente: 'Supply Chain Pro S.r.l.', corriere: 'DHL Italia', dataEmissione: '2025-06-02', peso: '89 kg', colli: 5, stato: 'CONSEGNATA' },
  { id: 'DDT/2025/0309', spedizione: 'SHP-2025-309', ordine: 'ORD-2025-078', cliente: 'Logistica Express S.r.l.', corriere: 'BRT Express', dataEmissione: '2025-06-01', peso: '210 kg', colli: 14, stato: 'CONSEGNATA' },
  { id: 'DDT/2025/0308', spedizione: 'SHP-2025-308', ordine: 'ORD-2025-076', cliente: 'Transport Solutions S.p.A.', corriere: 'GLS Logistics', dataEmissione: '2025-05-31', peso: '55 kg', colli: 3, stato: 'PROBLEMA' },
];

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
