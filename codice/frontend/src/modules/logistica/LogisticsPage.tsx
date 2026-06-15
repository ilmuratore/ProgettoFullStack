import { useEffect, useState } from 'react';
import { Plus, Truck, FileText, BarChart2, Download, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LogisticsKPIs } from '../logistica/components/LogisticsKPIs';
import { ShipmentsTable } from '../logistica/components/ShipmentsTable';
import { LogisticsWidgets } from '../logistica/components/LogisticsWidgets';
import { CourierPerformance } from '../logistica/components/CourierPerformance';
import { AdvancedKPIs } from '../logistica/components/AdvancedKPIs';
import { ShipmentDrawer } from '../logistica/components/ShipmentDrawer';
import { NewShipmentModal } from '../logistica/components/NewShipmentModal';
import { PageTabBar, type TabConfig } from '../../components/ui/PageTabBar';
import { spedizioniApi } from '../../api/spedizioniApi';
import { corrieriApi } from '../../api/corrieriApi';
import type { Spedizione, Ddt } from '../../types/spedizioni';
import type { Corriere } from '../../types/corrieri';
import type { LogisticsKpiItem } from './components/LogisticsKPIs';
import type { CourierPerformanceItem } from './components/CourierPerformance';
import type { AdvancedLogisticsData } from './components/AdvancedKPIs';
import { SortableHeader } from '../../components/shared/SortableHeader';
import { applySort, compareDate, compareNumber, compareText, toggleSort, type SortConfig } from '../../utils/sorting';

type LogisticsTab = 'spedizioni' | 'ddt' | 'kpi';

const tabs: TabConfig[] = [
  { id: 'spedizioni', label: 'Spedizioni', icon: Truck },
  { id: 'ddt', label: 'DDT', icon: FileText },
  { id: 'kpi', label: 'KPI Logistica', icon: BarChart2 },
];

type DdtRow = { id: string; spedizioneId: number; spedizione: string; ordine: string; cliente: string; corriere: string; dataEmissione: string; peso: string; colli: number; stato: string };

type DdtSortKey = 'id' | 'spedizione' | 'ordine' | 'cliente' | 'corriere' | 'dataEmissione' | 'colli' | 'stato';

const fmtDate = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleDateString('it-IT') : '-';

const compareDdtByKey = (left: DdtRow, right: DdtRow, key: DdtSortKey) => {
  switch (key) {
    case 'id':
      return compareText(left.id, right.id);
    case 'spedizione':
      return compareText(left.spedizione, right.spedizione);
    case 'ordine':
      return compareText(left.ordine, right.ordine);
    case 'cliente':
      return compareText(left.cliente, right.cliente);
    case 'corriere':
      return compareText(left.corriere, right.corriere);
    case 'dataEmissione':
      return compareDate(left.dataEmissione, right.dataEmissione);
    case 'colli':
      return compareNumber(left.colli, right.colli);
    case 'stato':
      return compareText(left.stato, right.stato);
    default:
      return 0;
  }
};

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
  const [selectedShipmentId, setSelectedShipmentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<LogisticsTab>('spedizioni');
  const [shipments, setShipments] = useState<Spedizione[]>([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [couriers, setCouriers] = useState<Corriere[]>([]);
  const [ddts, setDdts] = useState<Ddt[]>([]);
  const [loadingDdts, setLoadingDdts] = useState(false);
  const [exportingDdt, setExportingDdt] = useState(false);
  const [ddtSort, setDdtSort] = useState<SortConfig<DdtSortKey> | null>(null);

  const handleDdtSort = (key: DdtSortKey) => setDdtSort((prev) => toggleSort(prev, key));

  const ddtData: DdtRow[] = ddts.map((ddt) => {
    const ship = shipments.find((s) => s.id === ddt.spedizione_id);
    return {
      id: ddt.numero_ddt,
      spedizioneId: ddt.spedizione_id,
      spedizione: `SH-${String(ddt.spedizione_id).padStart(4, '0')}`,
      ordine: ship ? `SO-${String(ship.ordine_id).padStart(4, '0')}` : '-',
      cliente: ship?.cliente ?? '-',
      corriere: ddt.trasportatore ?? ship?.corriere ?? '-',
      dataEmissione: ddt.data_ddt,
      peso: '-',
      colli: 0,
      stato: ship?.stato ?? 'IN_PREPARAZIONE',
    };
  });

  const sortedDdtData = applySort(ddtData, ddtSort, compareDdtByKey);

  const handleDownloadDdtPdf = async (spedizioneId: number) => {
    try {
      await spedizioniApi.downloadDdtPdf(spedizioneId);
    } catch (err: any) {
      toast.error('Errore download PDF DDT', { description: err?.message });
    }
  };

  const handleExportAllDdt = async () => {
    if (sortedDdtData.length === 0) {
      toast.info('Nessun DDT da esportare');
      return;
    }
    setExportingDdt(true);
    try {
      for (const ddt of sortedDdtData) {
        await spedizioniApi.downloadDdtPdf(ddt.spedizioneId);
      }
    } catch (err: any) {
      toast.error('Errore esportazione DDT', { description: err?.message });
    } finally {
      setExportingDdt(false);
    }
  };

  const loadLogisticsData = () => {
    setLoadingShipments(true);
    Promise.all([
      spedizioniApi.list(),
      corrieriApi.list(),
    ])
      .then(([shipmentsData, couriersData]) => {
        setShipments(Array.isArray(shipmentsData) ? shipmentsData : []);
        setCouriers(Array.isArray(couriersData) ? couriersData : []);
      })
      .catch((err: any) => {
        setShipments([]);
        setCouriers([]);
        if (err?.status !== 404) {
          toast.error('Errore caricamento logistica', { description: err?.message });
        }
      })
      .finally(() => {
        setLoadingShipments(false);
      });
  };

  useEffect(() => {
    loadLogisticsData();
  }, []);

  useEffect(() => {
    if (activeTab !== 'ddt' || shipments.length === 0) {
      if (shipments.length === 0) setDdts([]);
      return;
    }
    let alive = true;
    setLoadingDdts(true);
    Promise.all(shipments.map((s) => spedizioniApi.getDdt(s.id).catch(() => null)))
      .then((results) => {
        if (!alive) return;
        setDdts(results.filter((d): d is Ddt => d != null));
      })
      .finally(() => {
        if (alive) setLoadingDdts(false);
      });
    return () => { alive = false; };
  }, [activeTab, shipments]);

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = currentMonthStart;
  const todayKey = now.toDateString();

  const currentMonthShipments = shipments.filter((s) => new Date(s.created_at) >= currentMonthStart);
  const previousMonthShipments = shipments.filter((s) => {
    const date = new Date(s.created_at);
    return date >= previousMonthStart && date < previousMonthEnd;
  });

  const calcTrend = (curr: number, prev: number): number => {
    if (prev === 0) return curr === 0 ? 0 : 100;
    return ((curr - prev) / prev) * 100;
  };

  const activeShipments = shipments.filter((s) => s.stato === 'IN_PREPARAZIONE' || s.stato === 'SPEDITA');
  const deliveriesToday = shipments.filter((s) => s.stato === 'CONSEGNATA' && new Date(s.updated_at).toDateString() === todayKey);
  const completedCurrentMonth = currentMonthShipments.filter((s) => s.stato === 'CONSEGNATA').length;
  const issueCount = shipments.filter((s) => s.stato === 'PROBLEMA').length;
  const activeCouriers = couriers.filter((c) => c.attivo);
  const successRate = shipments.length > 0
    ? (shipments.filter((s) => s.stato === 'CONSEGNATA').length / shipments.length) * 100
    : 0;

  const logisticsKpis: LogisticsKpiItem[] = [
    {
      title: 'Spedizioni Attive',
      value: String(activeShipments.length),
      subtitle: 'In preparazione o spedite',
      trend: calcTrend(
        currentMonthShipments.filter((s) => s.stato === 'IN_PREPARAZIONE' || s.stato === 'SPEDITA').length,
        previousMonthShipments.filter((s) => s.stato === 'IN_PREPARAZIONE' || s.stato === 'SPEDITA').length
      ),
      iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB]',
    },
    {
      title: 'Consegne Oggi',
      value: String(deliveriesToday.length),
      subtitle: 'Consegnate oggi',
      iconBg: 'bg-gradient-to-br from-[#17E88F] to-[#0FA67A]',
    },
    {
      title: 'Spedizioni Completate',
      value: String(completedCurrentMonth),
      subtitle: 'Mese corrente',
      iconBg: 'bg-gradient-to-br from-[#22C55E] to-[#16A34A]',
    },
    {
      title: 'Problemi di Consegna',
      value: String(issueCount),
      subtitle: 'Spedizioni in stato problema',
      iconBg: 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]',
      alert: issueCount > 0,
    },
    {
      title: 'Corrieri Operativi',
      value: String(activeCouriers.length),
      subtitle: `${couriers.length} totali`,
      iconBg: 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]',
    },
    {
      title: 'Delivery Success Rate',
      value: `${successRate.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
      subtitle: 'Consegne completate su totale',
      iconBg: 'bg-gradient-to-br from-[#17E88F] to-[#0FA67A]',
    },
  ];

  const shipmentDurationDays = (s: Spedizione): number =>
    Math.max(0, (new Date(s.updated_at).getTime() - new Date(s.created_at).getTime()) / 86400000);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - i));
    return date;
  });

  const leadTimeData = last7Days.map((date, index) => {
    const shippedDay = shipments.filter((s) => {
      const updated = new Date(s.updated_at);
      return updated.toDateString() === date.toDateString() && (s.stato === 'CONSEGNATA' || s.stato === 'SPEDITA');
    });
    const avg = shippedDay.length > 0
      ? shippedDay.reduce((sum, s) => sum + shipmentDurationDays(s), 0) / shippedDay.length
      : 0;
    return { day: index + 1, value: Number(avg.toFixed(1)) };
  });

  const onTimeData = last7Days.map((date, index) => {
    const dayShipments = shipments.filter((s) => new Date(s.updated_at).toDateString() === date.toDateString());
    const good = dayShipments.filter((s) => s.stato !== 'PROBLEMA').length;
    const rate = dayShipments.length > 0 ? (good / dayShipments.length) * 100 : 0;
    return { day: index + 1, rate: Number(rate.toFixed(1)) };
  });

  const shipments30 = shipments.filter((s) => new Date(s.created_at) >= new Date(now.getTime() - 30 * 86400000));
  const previous30 = shipments.filter((s) => {
    const date = new Date(s.created_at);
    return date >= new Date(now.getTime() - 60 * 86400000) && date < new Date(now.getTime() - 30 * 86400000);
  });
  const problemi30 = shipments30.filter((s) => s.stato === 'PROBLEMA').length;
  const complete30 = shipments30.filter((s) => s.stato === 'CONSEGNATA').length;
  const completePrev30 = previous30.filter((s) => s.stato === 'CONSEGNATA').length;
  const avgLeadTime = shipments.length > 0
    ? shipments.reduce((sum, s) => sum + shipmentDurationDays(s), 0) / shipments.length
    : 0;
  const onTimeRate = shipments.length > 0
    ? (shipments.filter((s) => s.stato !== 'PROBLEMA').length / shipments.length) * 100
    : 0;

  const advancedData: AdvancedLogisticsData = {
    leadTimeMedio: `${avgLeadTime.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} giorni`,
    onTimeRate: `${onTimeRate.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
    problemi30gg: problemi30,
    problemiRate: `${shipments30.length > 0 ? ((problemi30 / shipments30.length) * 100).toFixed(1) : '0.0'}%`,
    completate30gg: complete30,
    completateTrend: `${calcTrend(complete30, completePrev30) >= 0 ? '+' : ''}${calcTrend(complete30, completePrev30).toFixed(1)}%`,
    leadTimeData,
    onTimeData,
  };

  const courierPerformance: CourierPerformanceItem[] = couriers
    .map((courier) => {
      const related = shipments.filter((s) => s.corriere_id === courier.id);
      const completate = related.filter((s) => s.stato === 'CONSEGNATA').length;
      const problemi = related.filter((s) => s.stato === 'PROBLEMA').length;
      const avgTime = related.length > 0
        ? related.reduce((sum, s) => sum + shipmentDurationDays(s), 0) / related.length
        : 0;
      const success = related.length > 0 ? (completate / related.length) * 100 : 0;
      const valutazione = Math.max(1, Math.min(5, 5 - (problemi * 0.2) - (avgTime * 0.3)));

      return {
        nome: courier.nome,
        totali: related.length,
        completate,
        problemi,
        tempoMedio: `${avgTime.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} gg`,
        successRate: success,
        valutazione,
        stato: courier.attivo ? 'online' as const : 'offline' as const,
      };
    })
    .sort((a, b) => b.totali - a.totali);

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
                <ShipmentsTable
                  onShipmentClick={setSelectedShipmentId}
                  shipments={shipments}
                  loading={loadingShipments}
                />
              </div>
              <div className="lg:col-span-3">
                <LogisticsWidgets
                  shipments={shipments}
                  couriers={couriers}
                  onShipmentClick={setSelectedShipmentId}
                />
              </div>
            </div>
          )}

          {activeTab === 'ddt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6B7280]">Documenti di Trasporto — numerazione progressiva anno/numero</p>
                <button
                  onClick={handleExportAllDdt}
                  disabled={exportingDdt || sortedDdtData.length === 0}
                  className="px-3 py-1.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all flex items-center gap-2 text-sm disabled:opacity-40"
                >
                  {exportingDdt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Esporta tutti i DDT
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F7F9FC] border-b border-[#E5EAF2]">
                      <SortableHeader label="Numero DDT" sortKey="id" sort={ddtSort} onSort={handleDdtSort} thClassName="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider" />
                      <SortableHeader label="Spedizione" sortKey="spedizione" sort={ddtSort} onSort={handleDdtSort} thClassName="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider" />
                      <SortableHeader label="Ordine" sortKey="ordine" sort={ddtSort} onSort={handleDdtSort} thClassName="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider" />
                      <SortableHeader label="Cliente" sortKey="cliente" sort={ddtSort} onSort={handleDdtSort} thClassName="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider" />
                      <SortableHeader label="Corriere" sortKey="corriere" sort={ddtSort} onSort={handleDdtSort} thClassName="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider" />
                      <SortableHeader label="Data Emissione" sortKey="dataEmissione" sort={ddtSort} onSort={handleDdtSort} thClassName="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider" />
                      <SortableHeader label="Colli / Peso" sortKey="colli" sort={ddtSort} onSort={handleDdtSort} align="center" thClassName="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider" />
                      <SortableHeader label="Stato" sortKey="stato" sort={ddtSort} onSort={handleDdtSort} thClassName="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider" />
                      <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAF2]">
                    {loadingDdts ? (
                      <tr><td colSpan={9} className="py-8 text-center text-sm text-[#6B7280]">
                        <Loader2 className="w-4 h-4 mx-auto mb-2 animate-spin" />
                        Caricamento DDT...
                      </td></tr>
                    ) : sortedDdtData.length === 0 ? (
                      <tr><td colSpan={9} className="py-8 text-center text-sm text-[#6B7280]">Nessun DDT generato.</td></tr>
                    ) : sortedDdtData.map((ddt) => (
                      <tr key={ddt.id} className="hover:bg-[#F7F9FC] transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-[#17E88F]">{ddt.id}</td>
                        <td className="px-4 py-3 text-sm text-[#374151]">{ddt.spedizione}</td>
                        <td className="px-4 py-3 text-sm text-[#374151]">{ddt.ordine}</td>
                        <td className="px-4 py-3 text-sm text-[#374151] max-w-[160px] truncate">{ddt.cliente}</td>
                        <td className="px-4 py-3 text-sm text-[#6B7280]">{ddt.corriere}</td>
                        <td className="px-4 py-3 text-sm text-[#6B7280]">{fmtDate(ddt.dataEmissione)}</td>
                        <td className="px-4 py-3 text-sm text-center text-[#374151]">{ddt.colli} colli / {ddt.peso}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${shippingStateBadge(ddt.stato)}`}>
                            {ddt.stato.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedShipmentId(ddt.spedizioneId)}
                              className="p-1.5 hover:bg-[#E5EAF2] rounded-lg transition-colors"
                              title="Visualizza"
                            >
                              <Eye className="w-4 h-4 text-[#6B7280]" />
                            </button>
                            <button
                              onClick={() => handleDownloadDdtPdf(ddt.spedizioneId)}
                              className="p-1.5 hover:bg-[#E5EAF2] rounded-lg transition-colors"
                              title="Scarica PDF"
                            >
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
              <LogisticsKPIs items={logisticsKpis} />
              <CourierPerformance couriers={courierPerformance} />
              <AdvancedKPIs data={advancedData} />
            </div>
          )}
        </div>
      </div>

      <ShipmentDrawer
        shipmentId={selectedShipmentId}
        isOpen={!!selectedShipmentId}
        onClose={() => setSelectedShipmentId(null)}
        onUpdated={(updated) => setShipments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))}
      />

      <NewShipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        couriers={couriers.filter((courier) => courier.attivo)}
        existingOrdineIds={shipments.map((shipment) => shipment.ordine_id)}
        onCreated={() => {
          setIsModalOpen(false);
          loadLogisticsData();
        }}
      />
    </div>
  );
}
