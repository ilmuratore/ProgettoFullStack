import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router';
import { Toaster } from 'sonner';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { Header }  from './components/layout/Header';

// Pagine
import { DashboardPage }      from './pages/DashboardPage';
import { LoginPage }          from './pages/LoginPage';
import { AnagrafichePage }    from './modules/anagrafiche/AnagrafichePage';
import { WarehousePage }      from './modules/magazzino/WarehousePage';
import { PurchasesPage }      from './modules/acquisti/PurchasesPage';
import { SalesPage }          from './modules/vendite/SalesPage';
import { LogisticsPage }      from './modules/logistica/LogisticsPage';
import { AdministrationPage } from './modules/amministrazione/AdministrationPage';

// Store / API / Tipi
import { useAuthStore, RUOLO_ID_TO_NOME, PAGINE_PER_RUOLO } from './store/authStore';
import { authApi } from './api/authApi';
import type { UiUser, Role } from './types/auth';

// ─── Costanti ────────────────────────────────────────────────────────────────

const AVATAR_BGS: Record<number, string> = {
  1: '#0F172A', 2: '#1D4ED8', 3: '#0D9488', 4: '#16A34A', 5: '#EA580C',
};

// mappa page-id → path URL
const PAGE_TO_PATH: Record<string, string> = {
  dashboard:       '/',
  anagrafiche:     '/anagrafiche',
  magazzino:       '/magazzino',
  acquisti:        '/acquisti',
  vendite:         '/vendite',
  logistica:       '/logistica',
  amministrazione: '/amministrazione',
};

// mappa path URL → page-id (per evidenziare la voce attiva nella Sidebar)
const PATH_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([k, v]) => [v, k])
);

// ─── ProtectedRoute ───────────────────────────────────────────────────────────

function ProtectedRoute({ pageId, children }: { pageId: string; children: React.ReactNode }) {
  const { token, utente } = useAuthStore();

  if (!token || !utente) return <Navigate to="/login" replace />;

  const accessiblePages = PAGINE_PER_RUOLO[utente.ruolo_id] ?? ['dashboard'];
  if (!accessiblePages.includes(pageId)) return <Navigate to="/" replace />;

  return <>{children}</>;
}

// ─── AppShell — layout con Sidebar + Header (solo per utenti autenticati) ─────

function AppShell({ children }: { children: React.ReactNode }) {
  const { utente, logout, setAuth } = useAuthStore();
  const navigate   = useNavigate();
  const location   = useLocation();

  // Reidrata ruolo dal backend all'avvio (M01: ruolo sempre fresco)
  useEffect(() => {
    const token = localStorage.getItem('lc_token');
    if (!token) return;
    authApi.me()
      .then((u) => setAuth(token, u))
      .catch(() => { /* client.ts gestisce già 401 → redirect /login */ });
  }, []);

  if (!utente) return null;

  const ruoloNome       = (utente.ruolo_nome ?? RUOLO_ID_TO_NOME[utente.ruolo_id] ?? 'Utente') as Role;
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

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Sidebar
        onNavigate={handleNavigate}
        activePage={activePage}
        user={uiUser}
        accessiblePages={accessiblePages}
        onLogout={logout}
      />
      <Header
        onNavigate={handleNavigate}
        user={uiUser}
        onLogout={logout}
      />
      <main
        id="main-content"
        className="mt-16 p-6 transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 260px)' }}
      >
        {children}
      </main>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

function AppRouter() {
  const { token, utente } = useAuthStore();
  const isAuth = !!(token && utente);

  return (
    <Routes>
      {/* Login — redirect alla dashboard se già autenticato */}
      <Route
        path="/login"
        element={isAuth ? <Navigate to="/" replace /> : <LoginPage onLoginSuccess={() => {}} />}
      />

      {/* Rotte protette — tutte passano per AppShell */}
      <Route path="/" element={
        <ProtectedRoute pageId="dashboard">
          <AppShell><DashboardPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/anagrafiche" element={
        <ProtectedRoute pageId="anagrafiche">
          <AppShell><AnagrafichePage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/magazzino" element={
        <ProtectedRoute pageId="magazzino">
          <AppShell><WarehousePage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/acquisti" element={
        <ProtectedRoute pageId="acquisti">
          <AppShell><PurchasesPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/vendite" element={
        <ProtectedRoute pageId="vendite">
          <AppShell><SalesPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/logistica" element={
        <ProtectedRoute pageId="logistica">
          <AppShell><LogisticsPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/amministrazione" element={
        <ProtectedRoute pageId="amministrazione">
          <AppShell><AdministrationPage /></AppShell>
        </ProtectedRoute>
      } />

      {/* Fallback — redirect alla dashboard (o login se non autenticato) */}
      <Route path="*" element={<Navigate to={isAuth ? '/' : '/login'} replace />} />
    </Routes>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <AppRouter />
    </BrowserRouter>
  );
}