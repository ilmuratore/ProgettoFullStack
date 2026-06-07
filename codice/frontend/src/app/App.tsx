import { useState } from 'react';
import { Package, ClipboardList, AlertTriangle, Truck, Bell, BellDot, Check, Filter, RotateCcw } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KPICard } from './components/KPICard';
import { OrdersBarChart } from './components/OrdersBarChart';
import { OrdersPieChart } from './components/OrdersPieChart';
import { ActivityTable } from './components/ActivityTable';
import { WarehouseCapacity } from './components/WarehouseCapacity';
import { CriticalProductsAlert } from './components/CriticalProductsAlert';
import { MiniCalendar } from './components/MiniCalendar';
import { AnagrafichePage } from './components/AnagrafichePage';
import { WarehousePage } from './components/WarehousePage';
import { PurchasesPage } from './components/PurchasesPage';
import { SalesPage } from './components/SalesPage';
import { LogisticsPage } from './components/LogisticsPage';
import { AdministrationPage } from './components/AdministrationPage';
import { PageTabBar } from './components/ui/PageTabBar';
import { Toaster } from 'sonner';
import { LoginPage } from './components/LogiChain_Auth';
import type { User, Role } from './components/LogiChain_Auth';

type Page = 'dashboard' | 'anagrafiche' | 'magazzino' | 'acquisti' | 'vendite' | 'logistica' | 'amministrazione';
type DashboardTab = 'dashboard' | 'alert';
type NotifType = 'SOTTO_SCORTA' | 'RICEZIONE_PARZIALE' | 'PO_IN_RITARDO' | 'CAMBIO_STATO_SPEDIZIONE';

interface Notifica {
  id: number; tipo: NotifType; messaggio: string; utente: string; data: string; letta: boolean;
}

const SIDEBAR_ACCESS: Record<Role, Page[]> = {
  Admin:                    ['dashboard','anagrafiche','magazzino','acquisti','vendite','logistica','amministrazione'],
  'Responsabile Acquisti':  ['dashboard','anagrafiche','acquisti'],
  'Responsabile Magazzino': ['dashboard','magazzino','vendite','logistica'],
  Operatore:                ['dashboard','anagrafiche','vendite','magazzino'],
  Corriere:                 ['dashboard','logistica'],
};

const ROLE_COLORS: Record<Role, string> = {
  Admin: '#0F172A', 'Responsabile Acquisti': '#1D4ED8',
  'Responsabile Magazzino': '#0D9488', Operatore: '#16A34A', Corriere: '#EA580C',
};

const notificheIniziali: Notifica[] = [
  { id:1, tipo:'SOTTO_SCORTA',            messaggio:'Film Estensibile Trasparente 50cm (FLM-EST-012) sotto scorta minima. Giacenza: 12, minimo: 50',       utente:'Sistema',       data:'2025-06-05 08:14', letta:false },
  { id:2, tipo:'PO_IN_RITARDO',           messaggio:'PO-2025-028 — Packaging Solutions Italia S.p.A. scaduto il 02/06/2025. Nessuna conferma ricevuta.',  utente:'Sistema',       data:'2025-06-05 07:00', letta:false },
  { id:3, tipo:'RICEZIONE_PARZIALE',      messaggio:'PO-2025-042 ricevuto parzialmente: 120/150 unità. Ubicazione COR-A/SCA-1.',                          utente:'Marco Rossi',   data:'2025-06-04 16:45', letta:false },
  { id:4, tipo:'CAMBIO_STATO_SPEDIZIONE', messaggio:'Spedizione SHP-2025-311 → SPEDITA. Tracking: GLS-IT-98765432. Corriere: GLS Logistics.',             utente:'Sistema',       data:'2025-06-04 14:22', letta:false },
  { id:5, tipo:'SOTTO_SCORTA',            messaggio:'Etichette Adesive 10x5cm (ETH-ADH-007) sotto scorta minima. Giacenza: 200, minimo: 500',             utente:'Sistema',       data:'2025-06-04 09:30', letta:false },
  { id:6, tipo:'CAMBIO_STATO_SPEDIZIONE', messaggio:'Spedizione SHP-2025-309 → CONSEGNATA. Firma ricevuta presso cliente.',                               utente:'Carlo Ricci',   data:'2025-06-03 17:10', letta:true  },
  { id:7, tipo:'RICEZIONE_PARZIALE',      messaggio:'PO-2025-031 ricevuto parzialmente: 80/200 unità. Fornitore: Packaging Solutions Italia.',            utente:'Laura Bianchi', data:'2025-06-03 11:05', letta:true  },
  { id:8, tipo:'PO_IN_RITARDO',           messaggio:'PO-2025-024 — Etichette Professionali S.r.l. scaduto il 28/05/2025.',                               utente:'Sistema',       data:'2025-06-02 07:00', letta:true  },
];

const notifTypeConfig: Record<NotifType, { label:string; bg:string; text:string; dot:string }> = {
  SOTTO_SCORTA:            { label:'Sotto Scorta',  bg:'bg-[#FEF3C7]', text:'text-[#D97706]', dot:'bg-[#D97706]' },
  RICEZIONE_PARZIALE:      { label:'Ric. Parziale', bg:'bg-[#DBEAFE]', text:'text-[#3B82F6]', dot:'bg-[#3B82F6]' },
  PO_IN_RITARDO:           { label:'PO in Ritardo', bg:'bg-[#FEE2E2]', text:'text-[#DC2626]', dot:'bg-[#DC2626]' },
  CAMBIO_STATO_SPEDIZIONE: { label:'Stato Sped.',   bg:'bg-[#F0FDF7]', text:'text-[#16A34A]', dot:'bg-[#16A34A]' },
};

function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const accessiblePages = SIDEBAR_ACCESS[user.ruolo];
  const [currentPage, setCurrentPage] = useState<Page>(accessiblePages[0] ?? 'dashboard');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const [notificheState, setNotificheState] = useState<Notifica[]>(notificheIniziali);
  const [filterTipo, setFilterTipo] = useState<NotifType | 'tutti'>('tutti');
  const [filterLetta, setFilterLetta] = useState<'tutti' | 'lette' | 'non_lette'>('tutti');

  const handleNavigate = (page: string) => {
    if (accessiblePages.includes(page as Page)) setCurrentPage(page as Page);
  };

  const markAsRead = (id: number) => setNotificheState(prev => prev.map(n => n.id === id ? { ...n, letta: true } : n));
  const markAllAsRead = () => setNotificheState(prev => prev.map(n => ({ ...n, letta: true })));
  const nonLette = notificheState.filter(n => !n.letta).length;

  const filteredNotifiche = notificheState.filter(n => {
    if (filterTipo !== 'tutti' && n.tipo !== filterTipo) return false;
    if (filterLetta === 'lette' && !n.letta) return false;
    if (filterLetta === 'non_lette' && n.letta) return false;
    return true;
  });

  const alertTabConfig = [
    { id: 'dashboard', label: 'Dashboard', icon: Package },
    { id: 'alert', label: 'Alert & Notifiche', icon: Bell, count: nonLette > 0 ? nonLette : undefined },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Toaster position="top-right" richColors />
      <Sidebar
        onNavigate={handleNavigate}
        activePage={currentPage}
        onCollapsedChange={setSidebarCollapsed}
        user={user}
        accessiblePages={accessiblePages}
        onLogout={onLogout}
      />
      <Header
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        user={user}
        onLogout={onLogout}
      />

      <main className={`mt-16 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        {currentPage === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-[#2D2D2D]">Generale</h1>
                <p className="text-sm text-[#6B7280] mt-1">
                  Benvenuto, <span className="font-medium text-[#374151]">{user.nome} {user.cognome}</span>
                  {' · '}
                  <span className="font-medium" style={{ color: ROLE_COLORS[user.ruolo] }}>{user.ruolo}</span>
                </p>
              </div>
              {dashboardTab === 'alert' && nonLette > 0 && (
                <button onClick={markAllAsRead} className="px-4 py-2 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all flex items-center gap-2 text-sm">
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
                      <KPICard icon={Package}       title="Valore Totale Stock"  value="€ 2.540.000" trend={12.4}  iconBgColor="bg-gradient-to-br from-[#3B82F6] to-[#2563EB]" iconColor="text-white" />
                      <KPICard icon={ClipboardList} title="Ordini da Evadere"    value="128"         trend={8.2}   iconBgColor="bg-gradient-to-br from-[#F59E0B] to-[#D97706]" iconColor="text-white" />
                      <KPICard icon={AlertTriangle} title="Prodotti Sottoscorta" value="23"          trend={-5.1}  iconBgColor="bg-gradient-to-br from-[#EF4444] to-[#DC2626]" iconColor="text-white" />
                      <KPICard icon={Truck}         title="Spedizioni Odierne"   value="87"          trend={15.7}  iconBgColor="bg-gradient-to-br from-[#17E88F] to-[#0FA67A]" iconColor="text-white" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2"><OrdersBarChart /></div>
                      <div><OrdersPieChart /></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <WarehouseCapacity /><CriticalProductsAlert /><MiniCalendar />
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
                        <option value="SOTTO_SCORTA">Sotto Scorta</option>
                        <option value="RICEZIONE_PARZIALE">Ricezione Parziale</option>
                        <option value="PO_IN_RITARDO">PO in Ritardo</option>
                        <option value="CAMBIO_STATO_SPEDIZIONE">Cambio Stato Spedizione</option>
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
                        {(['SOTTO_SCORTA','RICEZIONE_PARZIALE','PO_IN_RITARDO','CAMBIO_STATO_SPEDIZIONE'] as NotifType[]).map(tipo => {
                          const count = notificheState.filter(n => n.tipo === tipo && !n.letta).length;
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
                          <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${n.letta ? 'bg-white border-[#E5EAF2] opacity-60' : 'bg-[#FAFFFE] border-[#D1FAE5] shadow-sm'}`}>
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.letta ? 'bg-[#E5EAF2]' : cfg.dot}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                                <span className="text-xs text-[#9CA3AF]">{n.data}</span>
                                <span className="text-xs text-[#9CA3AF]">· {n.utente}</span>
                              </div>
                              <p className="text-sm text-[#374151] leading-snug">{n.messaggio}</p>
                            </div>
                            {!n.letta && (
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
        )}

        {currentPage === 'anagrafiche'     && <AnagrafichePage />}
        {currentPage === 'magazzino'       && <WarehousePage />}
        {currentPage === 'acquisti'        && <PurchasesPage />}
        {currentPage === 'vendite'         && <SalesPage />}
        {currentPage === 'logistica'       && <LogisticsPage />}
        {currentPage === 'amministrazione' && <AdministrationPage />}
      </main>
    </div>
  );
}

export default function App() {
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  if (!loggedUser) return <LoginPage onLogin={(u) => setLoggedUser(u)} />;
  return <Dashboard user={loggedUser} onLogout={() => setLoggedUser(null)} />;
}
