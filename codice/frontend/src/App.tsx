import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router';
import { Toaster } from 'sonner';

import { Sidebar } from './components/layout/Sidebar';
import { Header }  from './components/layout/Header';

import { DashboardPage }      from './pages/DashboardPage';
import { LoginPage }          from './pages/LoginPage';
import { UserProfilePage }    from './pages/UserProfilePage';
import { SicurezzaPage }      from './pages/SicurezzaPage';
import { SupportoPage }       from './pages/SupportoPage';
import { AnagrafichePage }    from './modules/anagrafiche/AnagrafichePage';
import { WarehousePage }      from './modules/magazzino/WarehousePage';
import { PurchasesPage }      from './modules/acquisti/PurchasesPage';
import { SalesPage }          from './modules/vendite/SalesPage';
import { LogisticsPage }      from './modules/logistica/LogisticsPage';
import { AdministrationPage } from './modules/amministrazione/AdministrationPage';

import { useAuthStore, RUOLO_ID_TO_NOME, PAGINE_PER_RUOLO } from './store/authStore';
import { authApi } from './api/authApi';
import type { UiUser, Role } from './types/auth';

const AVATAR_BGS: Record<number, string> = {
  1: '#0F172A', 2: '#1D4ED8', 3: '#0D9488', 4: '#16A34A', 5: '#EA580C',
};

const PAGE_TO_PATH: Record<string, string> = {
  dashboard:       '/',
  anagrafiche:     '/anagrafiche',
  magazzino:       '/magazzino',
  acquisti:        '/acquisti',
  vendite:         '/vendite',
  logistica:       '/logistica',
  amministrazione: '/amministrazione',
  profilo:         '/profilo',
  sicurezza:       '/sicurezza',
  supporto:        '/supporto',
};

const PATH_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([k, v]) => [v, k])
);

// ─── PageProtectedRoute ───────────────────────────────────────────────────────
// Solo RBAC: l'auth check è già in AppShell (layout padre).

function PageProtectedRoute({ pageId, children }: { pageId: string; children: React.ReactNode }) {
  const { utente } = useAuthStore();
  const accessiblePages = PAGINE_PER_RUOLO[utente?.ruolo_id ?? 0] ?? ['dashboard'];
  if (!accessiblePages.includes(pageId)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ─── LoginWrapper ─────────────────────────────────────────────────────────────

function LoginWrapper() {
  const { token, utente } = useAuthStore();
  const navigate = useNavigate();

  if (token && utente) return <Navigate to="/" replace />;

  return (
    <LoginPage
      onLoginSuccess={() => navigate('/', { replace: true })}
    />
  );
}

// ─── AppShell ─────────────────────────────────────────────────────────────────
// Layout condiviso per tutte le rotte autenticate.
// Monta UNA SOLA VOLTA per sessione — authApi.me() non si riesegue ad ogni navigazione.

function AppShell() {
  const { token, utente, logout, setAuth } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  );

  // me() chiamato una sola volta al mount del layout, non ad ogni cambio pagina.
  useEffect(() => {
    const storedToken = localStorage.getItem('lc_token');
    if (!storedToken) return;
    authApi.me()
      .then((u) => setAuth(storedToken, u))
      .catch(() => {});
  }, []);

  // Zustand inizializza token/utente da localStorage al primo render,
  // quindi questo redirect scatta solo in caso di logout o token assente.
  if (!token || !utente) return <Navigate to="/login" replace />;

  const ruoloNome = (
    utente.ruolo_nome ??
    RUOLO_ID_TO_NOME[utente.ruolo_id] ??
    'Utente'
  ) as Role;

  const accessiblePages = (PAGINE_PER_RUOLO[utente.ruolo_id] ?? ['dashboard']) as string[];
  const initials        = `${utente.nome?.[0] ?? ''}${utente.cognome?.[0] ?? ''}`.toUpperCase();
  const activePage      = PATH_TO_PAGE[location.pathname] ?? 'dashboard';

  const uiUser: UiUser = {
    id:       utente.id,
    nome:     utente.nome,
    cognome:  utente.cognome,
    email:    utente.email,
    password: '',
    ruolo:    ruoloNome,
    avatar:   initials,
    avatarBg: AVATAR_BGS[utente.ruolo_id] ?? '#6B7280',
  };

  const handleNavigate = (page: string) => {
    const path = PAGE_TO_PATH[page];
    if (path) navigate(path);
  };

  const handleCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Sidebar
        onNavigate={handleNavigate}
        activePage={activePage}
        onCollapsedChange={handleCollapse}
        user={uiUser}
        accessiblePages={accessiblePages}
        onLogout={logout}
      />
      <Header
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        user={uiUser}
        onLogout={logout}
      />
      <main className={`mt-16 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Outlet />
      </main>
    </div>
  );
}

// ─── AppRouter ────────────────────────────────────────────────────────────────

function AppRouter() {
  const { token, utente } = useAuthStore();
  const isAuth = !!(token && utente);

  return (
    <Routes>
      <Route path="/login" element={<LoginWrapper />} />

      {/* AppShell come layout condiviso — monta una sola volta per tutta la sessione */}
      <Route element={<AppShell />}>

        {/* Pagine principali con RBAC */}
        <Route path="/" element={
          <PageProtectedRoute pageId="dashboard"><DashboardPage /></PageProtectedRoute>
        } />
        <Route path="/anagrafiche" element={
          <PageProtectedRoute pageId="anagrafiche"><AnagrafichePage /></PageProtectedRoute>
        } />
        <Route path="/magazzino" element={
          <PageProtectedRoute pageId="magazzino"><WarehousePage /></PageProtectedRoute>
        } />
        <Route path="/acquisti" element={
          <PageProtectedRoute pageId="acquisti"><PurchasesPage /></PageProtectedRoute>
        } />
        <Route path="/vendite" element={
          <PageProtectedRoute pageId="vendite"><SalesPage /></PageProtectedRoute>
        } />
        <Route path="/logistica" element={
          <PageProtectedRoute pageId="logistica"><LogisticsPage /></PageProtectedRoute>
        } />
        <Route path="/amministrazione" element={
          <PageProtectedRoute pageId="amministrazione"><AdministrationPage /></PageProtectedRoute>
        } />

        {/* Pagine utente — accessibili a tutti gli autenticati */}
        <Route path="/profilo"    element={<UserProfilePage />} />
        <Route path="/sicurezza"  element={<SicurezzaPage />} />
        <Route path="/supporto"   element={<SupportoPage />} />

      </Route>

      <Route path="*" element={<Navigate to={isAuth ? '/' : '/login'} replace />} />
    </Routes>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <AppRouter />
    </BrowserRouter>
  );
}