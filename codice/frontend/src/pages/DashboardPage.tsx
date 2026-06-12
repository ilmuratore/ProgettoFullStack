import { useState, useEffect } from 'react';
import {
  Package, ClipboardList, AlertTriangle, Truck,
  Bell, BellDot, Check, Filter, RotateCcw
} from 'lucide-react';

import { KPICard } from '../components/shared/KPICard';
import { OrdersBarChart } from '../components/shared/OrdersBarChart';
import { OrdersPieChart } from '../components/shared/OrdersPieChart';
import { ActivityTable } from '../components/shared/ActivityTable';
import { WarehouseCapacity } from '../components/shared/WarehouseCapacity';
import { CriticalProductsAlert } from '../components/shared/CriticalProductsAlert';
import { MiniCalendar } from '../components/shared/MiniCalendar';
import { PageTabBar } from '../components/ui/PageTabBar';
import { useAuthStore, RUOLO_ID_TO_NOME } from '../store/authStore';
import { giacenzeApi } from '../api/giacenzeApi';
import { prodottiApi } from '../api/prodottiApi';
import { acquistiApi } from '../api/acquistiApi';
import { ordiniApi } from '../api/ordiniApi';
import { spedizioniApi } from '../api/spedizioniApi';
import { magazzinoApi } from '../api/magazzinoApi';
import { notificheApi } from '../api/notificheApi';
import type { Notifica, NotifType } from '../types/notifiche';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

type DashboardTab = 'dashboard' | 'alert';

const notifTypeConfig: Record<NotifType, { label: string; bg: string; text: string; dot: string }> = {
  SOTTO_SCORTA:            { label: 'Sotto Scorta',  bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', dot: 'bg-[#D97706]' },
  RICEZIONE_PARZIALE:      { label: 'Ric. Parziale', bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]', dot: 'bg-[#3B82F6]' },
  PO_IN_RITARDO:           { label: 'PO in Ritardo', bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', dot: 'bg-[#DC2626]' },
  CAMBIO_STATO_SPEDIZIONE: { label: 'Stato Sped.',   bg: 'bg-[#F0FDF7]', text: 'text-[#16A34A]', dot: 'bg-[#16A34A]' },
  RICHIESTA_ACCETTATA:     { label: 'Rich. Accettata', bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', dot: 'bg-[#16A34A]' },
  RICHIESTA_RIFIUTATA:     { label: 'Rich. Rifiutata', bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', dot: 'bg-[#DC2626]' },
  MESSAGGIO_FORNITORE:     { label: 'Mess. Fornitore', bg: 'bg-[#EDE9FE]', text: 'text-[#8B5CF6]', dot: 'bg-[#8B5CF6]' },
  ALTRO:                   { label: 'Altro', bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', dot: 'bg-[#6B7280]' },
};

export function DashboardPage() {
  const { utente } = useAuthStore();

  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('dashboard');
  const [notificheState, setNotificheState] = useState<Notifica[]>([]);
  const [filterTipo, setFilterTipo] = useState<NotifType | 'tutti'>('tutti');
  const [filterLetta, setFilterLetta] = useState<'tutti' | 'lette' | 'non_lette'>('tutti');

  const [valoreStock, setValoreStock] = useState<number | null>(null);
  const [ordiniAperti, setOrdiniAperti] = useState<number | null>(null);
  const [sottoScorta, setSottoScorta] = useState<number | null>(null);
  const [spedizioniOggi, setSpedizioniOggi] = useState<number | null>(null);
  const [barChartData, setBarChartData] = useState([
    { name: 'Ricevuti', value: 0, color: '#17E88F' },
    { name: 'Confermati', value: 0, color: '#22C55E' },
    { name: 'In Elaborazione', value: 0, color: '#3B82F6' },
    { name: 'Completati', value: 0, color: '#0FA67A' },
    { name: 'Annullati', value: 0, color: '#EF4444' },
  ]);
  const [pieChartData, setPieChartData] = useState([
    { name: 'Bozza', value: 0, color: '#6B7280' },
    { name: 'In Picking', value: 0, color: '#F59E0B' },
    { name: 'In Preparazione', value: 0, color: '#3B82F6' },
    { name: 'Spedito', value: 0, color: '#17E88F' },
  ]);
  const [warehouseCapacity, setWarehouseCapacity] = useState({ capacity: 0, occupied: 0, available: 0 });

  useEffect(() => {
    Promise.all([
      giacenzeApi.list(),
      prodottiApi.list(),
      acquistiApi.list(),
      ordiniApi.list(),
      spedizioniApi.list(),
      magazzinoApi.listUbicazioni(),
    ])
      .then(([giacenze, prodotti, ordiniAcquisto, ordiniVendita, spedizioni, ubicazioni]) => {
        const prezzoByProdotto = new Map(prodotti.map((p) => [p.id, Number(p.prezzo ?? 0)]));
        const totale = giacenze.reduce((sum, g) => sum + g.quantita * (prezzoByProdotto.get(g.prodotto_id) ?? 0), 0);
        setValoreStock(totale);
        setSottoScorta(giacenze.filter((g) => g.sotto_scorta).length);
        setOrdiniAperti(ordiniAcquisto.filter((o) => o.stato !== 'COMPLETATO' && o.stato !== 'ANNULLATO').length);

        const today = new Date().toDateString();
        setSpedizioniOggi(spedizioni.filter((s) => new Date(s.created_at).toDateString() === today).length);

        const last30 = new Date();
        last30.setDate(last30.getDate() - 30);
        const ordiniAcquisto30 = ordiniAcquisto.filter((o) => new Date(o.created_at) >= last30);
        setBarChartData([
          { name: 'Ricevuti', value: ordiniAcquisto30.filter((o) => o.totale_ricevuto > 0).length, color: '#17E88F' },
          { name: 'Confermati', value: ordiniAcquisto30.filter((o) => o.stato === 'CONFERMATO').length, color: '#22C55E' },
          { name: 'In Elaborazione', value: ordiniAcquisto30.filter((o) => o.stato === 'INVIATO' || o.stato === 'IN_RICEZIONE').length, color: '#3B82F6' },
          { name: 'Completati', value: ordiniAcquisto30.filter((o) => o.stato === 'COMPLETATO').length, color: '#0FA67A' },
          { name: 'Annullati', value: ordiniAcquisto30.filter((o) => o.stato === 'ANNULLATO').length, color: '#EF4444' },
        ]);

        setPieChartData([
          { name: 'Bozza', value: ordiniVendita.filter((o) => o.stato === 'BOZZA').length, color: '#6B7280' },
          { name: 'In Picking', value: ordiniVendita.filter((o) => o.stato === 'CONFERMATO' && o.stato_picking === 'IN_PICKING').length, color: '#F59E0B' },
          { name: 'In Preparazione', value: ordiniVendita.filter((o) => o.stato === 'CONFERMATO' && o.stato_picking !== 'IN_PICKING').length, color: '#3B82F6' },
          { name: 'Spedito', value: ordiniVendita.filter((o) => o.stato === 'SPEDITO').length, color: '#17E88F' },
        ]);

        const occupiedSet = new Set(giacenze.filter((g) => Number(g.quantita) > 0).map((g) => g.ubicazione_id));
        const totalUbicazioni = ubicazioni.length;
        const occupied = occupiedSet.size;
        const available = Math.max(0, totalUbicazioni - occupied);
        const capacity = totalUbicazioni > 0 ? Math.round((occupied / totalUbicazioni) * 100) : 0;
        setWarehouseCapacity({ capacity, occupied, available });
      })
      .catch(() => {});

    notificheApi.list()
      .then((data) => setNotificheState(Array.isArray(data) ? data : []))
      .catch(() => setNotificheState([]));
  }, []);

  if (!utente) return null;

  const ruoloNome = utente.ruolo_nome ?? RUOLO_ID_TO_NOME[utente.ruolo_id] ?? 'Utente';

  const markAsRead = (id: number) => {
    setNotificheState((prev) => prev.map((n) => (n.id === id ? { ...n, letto: true } : n)));
    notificheApi.markAsRead(id).catch(() => {});
  };

  const markAllRead = () => {
    setNotificheState((prev) => prev.map((n) => ({ ...n, letto: true })));
    notificheApi.markAllAsRead().catch(() => {});
  };

  const nonLette = notificheState.filter((n) => !n.letto).length;

  const filteredNotifiche = notificheState.filter((n) => {
    if (filterTipo !== 'tutti' && n.tipo !== filterTipo) return false;
    if (filterLetta === 'lette' && !n.letto) return false;
    if (filterLetta === 'non_lette' && n.letto) return false;
    return true;
  });

  const alertTabConfig = [
    { id: 'dashboard', label: 'Dashboard', icon: Package },
    { id: 'alert', label: 'Alert & Notifiche', icon: Bell, count: nonLette > 0 ? nonLette : undefined },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Generale</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Benvenuto, <span className="font-medium text-[#374151]">{utente.nome} {utente.cognome}</span>
            {' · '}
            <span className="font-medium text-[#374151]">{ruoloNome}</span>
          </p>
        </div>
        {dashboardTab === 'alert' && nonLette > 0 && (
          <button
            onClick={markAllRead}
            className="px-4 py-2 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all flex items-center gap-2 text-sm"
          >
            <Check className="w-4 h-4" />Segna tutte come lette
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
        <PageTabBar tabs={alertTabConfig} activeTab={dashboardTab} onTabChange={(id) => setDashboardTab(id as DashboardTab)} />
        <div className="p-6">
          {dashboardTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard icon={Package} title="Valore Totale Stock" value={valoreStock !== null ? formatCurrency(valoreStock) : '...'} iconBgColor="bg-gradient-to-br from-[#3B82F6] to-[#2563EB]" iconColor="text-white" />
                <KPICard icon={ClipboardList} title="Ordini da Evadere" value={ordiniAperti !== null ? String(ordiniAperti) : '...'} iconBgColor="bg-gradient-to-br from-[#F59E0B] to-[#D97706]" iconColor="text-white" />
                <KPICard icon={AlertTriangle} title="Prodotti Sottoscorta" value={sottoScorta !== null ? String(sottoScorta) : '...'} iconBgColor="bg-gradient-to-br from-[#EF4444] to-[#DC2626]" iconColor="text-white" />
                <KPICard icon={Truck} title="Spedizioni Odierne" value={spedizioniOggi !== null ? String(spedizioniOggi) : '...'} iconBgColor="bg-gradient-to-br from-[#17E88F] to-[#0FA67A]" iconColor="text-white" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2"><OrdersBarChart data={barChartData} /></div>
                <div><OrdersPieChart data={pieChartData} /></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <WarehouseCapacity capacity={warehouseCapacity.capacity} occupied={warehouseCapacity.occupied} available={warehouseCapacity.available} /><CriticalProductsAlert /><MiniCalendar />
              </div>
              <ActivityTable />
            </div>
          )}

          {dashboardTab === 'alert' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm text-[#6B7280]">Filtri:</span>
                </div>
                <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value as NotifType | 'tutti')} className="px-3 py-1.5 border border-[#E5EAF2] rounded-lg text-sm text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#17E88F]">
                  <option value="tutti">Tutti i tipi</option>
                  {Object.keys(notifTypeConfig).map((tipo) => (
                    <option key={tipo} value={tipo}>{notifTypeConfig[tipo as NotifType].label}</option>
                  ))}
                </select>
                <select value={filterLetta} onChange={(e) => setFilterLetta(e.target.value as 'tutti' | 'lette' | 'non_lette')} className="px-3 py-1.5 border border-[#E5EAF2] rounded-lg text-sm text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#17E88F]">
                  <option value="tutti">Tutte</option>
                  <option value="non_lette">Non lette</option>
                  <option value="lette">Lette</option>
                </select>
                <button onClick={() => { setFilterTipo('tutti'); setFilterLetta('tutti'); }} className="px-3 py-1.5 border border-[#E5EAF2] rounded-lg text-sm text-[#6B7280] bg-white hover:bg-[#F7F9FC] flex items-center gap-1.5 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />Reset
                </button>
                <div className="ml-auto flex items-center gap-3">
                  {(Object.keys(notifTypeConfig) as NotifType[]).map((tipo) => {
                    const count = notificheState.filter((n) => n.tipo === tipo && !n.letto).length;
                    if (!count) return null;
                    const cfg = notifTypeConfig[tipo];
                    return (
                      <span key={tipo} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}: {count}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                {filteredNotifiche.length === 0 && (
                  <div className="text-center py-12 text-[#9CA3AF]">
                    <BellDot className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Nessuna notifica trovata</p>
                  </div>
                )}
                {filteredNotifiche.map((n) => {
                  const cfg = notifTypeConfig[n.tipo];
                  return (
                    <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${n.letto ? 'bg-white border-[#E5EAF2] opacity-60' : 'bg-[#FAFFFE] border-[#D1FAE5] shadow-sm'}`}>
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.letto ? 'bg-[#E5EAF2]' : cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                          <span className="text-xs text-[#9CA3AF]">{new Date(n.created_at).toLocaleString('it-IT')}</span>
                        </div>
                        <p className="text-sm text-[#374151] leading-snug">{n.messaggio}</p>
                      </div>
                      {!n.letto && (
                        <button onClick={() => markAsRead(n.id)} className="flex-shrink-0 px-2.5 py-1 text-xs text-[#6B7280] border border-[#E5EAF2] rounded-lg hover:bg-[#F7F9FC] transition-colors">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
