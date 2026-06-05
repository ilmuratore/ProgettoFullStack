import { useState, createContext, useContext, useEffect, FC, ReactNode } from "react";

// ─── DESIGN TOKENS (matching existing mockup) ────────────────────────────────
// bg: #F7F9FC | accent: #17E88F | border: #E5EAF2 | text: #2D2D2D

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Permission =
  | "utenti:read"   | "utenti:write"   | "utenti:delete"
  | "prodotti:read" | "prodotti:write" | "prodotti:delete"
  | "fornitori:read"| "fornitori:write"| "fornitori:delete"
  | "clienti:read"  | "clienti:write"  | "clienti:delete"
  | "magazzino:read"| "magazzino:write"
  | "giacenze:read" | "giacenze:write"
  | "ordini:read"   | "ordini:write"   | "ordini:approve"
  | "acquisti:read" | "acquisti:write" | "acquisti:approve"
  | "spedizioni:read"| "spedizioni:write"
  | "notifiche:read"
  | "dashboard:read"
  | "ecosystem:read"| "ecosystem:write"
  | "richieste:read"| "richieste:write";

type Role =
  | "Admin"
  | "Responsabile Acquisti"
  | "Responsabile Magazzino"
  | "Operatore"
  | "Corriere";

type PageId =
  | "dashboard"
  | "anagrafiche"
  | "magazzino"
  | "acquisti"
  | "vendite"
  | "logistica"
  | "amministrazione";

type IconName =
  | "Home" | "Users" | "Warehouse" | "ShoppingCart"
  | "TrendingUp" | "Truck" | "Settings" | "Package";

interface User {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  password: string;
  ruolo: Role;
  avatar: string;
  avatarBg: string;
}

interface RoleConfig {
  color: string;
  bg: string;
  label: string;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: IconName;
}

interface AuthContextValue {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  hasPermission: (p: Permission) => boolean;
  canAccessPage: (page: PageId) => boolean;
}

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ─── PERMISSIONS DEFINITION (30 granular permissions) ────────────────────────

const ALL_PERMISSIONS: Permission[] = [
  "utenti:read", "utenti:write", "utenti:delete",
  "prodotti:read", "prodotti:write", "prodotti:delete",
  "fornitori:read", "fornitori:write", "fornitori:delete",
  "clienti:read", "clienti:write", "clienti:delete",
  "magazzino:read", "magazzino:write",
  "giacenze:read", "giacenze:write",
  "ordini:read", "ordini:write", "ordini:approve",
  "acquisti:read", "acquisti:write", "acquisti:approve",
  "spedizioni:read", "spedizioni:write",
  "notifiche:read",
  "dashboard:read",
  "ecosystem:read", "ecosystem:write",
  "richieste:read", "richieste:write",
];

const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  Admin: new Set(ALL_PERMISSIONS),
  "Responsabile Acquisti": new Set<Permission>([
    "acquisti:read", "acquisti:write", "acquisti:approve",
    "fornitori:read", "fornitori:write", "fornitori:delete",
    "prodotti:read", "ordini:read",
    "richieste:read", "richieste:write",
    "ecosystem:read", "ecosystem:write",
    "notifiche:read", "dashboard:read",
  ]),
  "Responsabile Magazzino": new Set<Permission>([
    "magazzino:read", "magazzino:write",
    "giacenze:read", "giacenze:write",
    "prodotti:read",
    "spedizioni:read", "spedizioni:write",
    "ordini:read", "ordini:write",
    "notifiche:read", "dashboard:read",
  ]),
  Operatore: new Set<Permission>([
    "ordini:read", "ordini:write",
    "giacenze:read", "prodotti:read",
    "spedizioni:read",
    "richieste:write", "ecosystem:read",
    "notifiche:read",
  ]),
  Corriere: new Set<Permission>([
    "spedizioni:read", "spedizioni:write",
    "notifiche:read",
  ]),
};

// ─── SIDEBAR ACCESS MATRIX ────────────────────────────────────────────────────

const SIDEBAR_ACCESS: Record<Role, PageId[]> = {
  Admin:                    ["dashboard", "anagrafiche", "magazzino", "acquisti", "vendite", "logistica", "amministrazione"],
  "Responsabile Acquisti":  ["dashboard", "anagrafiche", "acquisti"],
  "Responsabile Magazzino": ["dashboard", "magazzino", "vendite", "logistica"],
  Operatore:                ["dashboard", "anagrafiche", "vendite", "magazzino"],
  Corriere:                 ["dashboard", "logistica"],
};

// ─── MOCK USERS (5 test users, one per role) ──────────────────────────────────

const USERS: User[] = [
  { id: 1, nome: "Alessandro", cognome: "Ferrari",  email: "admin@logichain.it",     password: "Admin2025!",     ruolo: "Admin",                    avatar: "AF", avatarBg: "#0F172A" },
  { id: 2, nome: "Marco",      cognome: "Rossi",    email: "acquisti@logichain.it",  password: "Acquisti2025!",  ruolo: "Responsabile Acquisti",    avatar: "MR", avatarBg: "#1D4ED8" },
  { id: 3, nome: "Laura",      cognome: "Bianchi",  email: "magazzino@logichain.it", password: "Magazzino2025!", ruolo: "Responsabile Magazzino",   avatar: "LB", avatarBg: "#0D9488" },
  { id: 4, nome: "Giulia",     cognome: "Conti",    email: "operatore@logichain.it", password: "Operatore2025!", ruolo: "Operatore",                avatar: "GC", avatarBg: "#16A34A" },
  { id: 5, nome: "Carlo",      cognome: "Ricci",    email: "corriere@logichain.it",  password: "Corriere2025!",  ruolo: "Corriere",                 avatar: "CR", avatarBg: "#EA580C" },
];

// ─── ROLE CONFIG ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<Role, RoleConfig> = {
  Admin:                    { color: "#0F172A", bg: "#F1F5F9", label: "Admin" },
  "Responsabile Acquisti":  { color: "#1D4ED8", bg: "#DBEAFE", label: "Resp. Acquisti" },
  "Responsabile Magazzino": { color: "#0D9488", bg: "#CCFBF1", label: "Resp. Magazzino" },
  Operatore:                { color: "#16A34A", bg: "#DCFCE7", label: "Operatore" },
  Corriere:                 { color: "#EA580C", bg: "#FEE2E2", label: "Corriere" },
};

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",       label: "Generale",        icon: "Home" },
  { id: "anagrafiche",     label: "Anagrafiche",     icon: "Users" },
  { id: "magazzino",       label: "Magazzino",       icon: "Warehouse" },
  { id: "acquisti",        label: "Acquisti",        icon: "ShoppingCart" },
  { id: "vendite",         label: "Vendite",         icon: "TrendingUp" },
  { id: "logistica",       label: "Logistica",       icon: "Truck" },
  { id: "amministrazione", label: "Amministrazione", icon: "Settings" },
];

const PAGE_TITLES: Record<PageId, string> = {
  dashboard:       "Generale",
  anagrafiche:     "Gestione Anagrafiche",
  magazzino:       "Magazzino",
  acquisti:        "Acquisti",
  vendite:         "Vendite",
  logistica:       "Logistica",
  amministrazione: "Amministrazione",
};

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// ─── ICONS (SVG inline) ───────────────────────────────────────────────────────

const Icon: Record<string, FC<IconProps>> = {
  Eye: ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  ),
  LogOut: ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  ),
  Shield: ({ size = 20, className = "", style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Check: ({ size = 14, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  User: ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Lock: ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  ChevronRight: ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Home: ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Package: ({ size = 18, className = "", style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  ),
  Users: ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Warehouse: ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" /><path d="M6 18h12" /><path d="M6 14h12" /><rect width="8" height="6" x="8" y="18" />
    </svg>
  ),
  ShoppingCart: ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  ),
  TrendingUp: ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  Truck: ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" /><rect width="7" height="7" x="14" y="10" rx="1" /><circle cx="17.5" cy="17.5" r="1.5" /><circle cx="6" cy="17.5" r="1.5" />
    </svg>
  ),
  Settings: ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Info: ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
    </svg>
  ),
  X: ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  ),
};

function getIconComponent(name: IconName): FC<IconProps> {
  const map: Record<IconName, FC<IconProps>> = {
    Home: Icon.Home, Users: Icon.Users, Warehouse: Icon.Warehouse,
    ShoppingCart: Icon.ShoppingCart, TrendingUp: Icon.TrendingUp,
    Truck: Icon.Truck, Settings: Icon.Settings, Package: Icon.Package,
  };
  return map[name] ?? Icon.Package;
}

// ─── PAGE → PERMISSION DOMAIN MAPPING ────────────────────────────────────────

const PAGE_PERMISSION_DOMAINS: Record<PageId, string[]> = {
  dashboard:       ["dashboard", "notifiche"],
  anagrafiche:     ["prodotti", "fornitori", "clienti", "utenti"],
  magazzino:       ["magazzino", "giacenze"],
  acquisti:        ["acquisti", "richieste", "ecosystem"],
  vendite:         ["ordini"],
  logistica:       ["spedizioni"],
  amministrazione: ["utenti", "prodotti", "clienti"],
};

// ─── PAGE PLACEHOLDER ─────────────────────────────────────────────────────────

interface PagePlaceholderProps {
  page: PageId;
  user: User;
}

const PagePlaceholder: FC<PagePlaceholderProps> = ({ page, user }) => {
  const relevantDomains = PAGE_PERMISSION_DOMAINS[page] ?? [];
  const activePerms = [...(ROLE_PERMISSIONS[user.ruolo] ?? [])].filter((p) => {
    const domain = p.split(":")[0];
    return relevantDomains.includes(domain);
  });

  const roleConf = ROLE_CONFIG[user.ruolo];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div style={{ backgroundColor: roleConf.bg }} className="p-2 rounded-xl">
            <Icon.Package size={20} style={{ color: roleConf.color }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#2D2D2D]">{PAGE_TITLES[page]}</h2>
            <p className="text-sm text-[#6B7280]">
              Contenuto disponibile per il ruolo{" "}
              <span className="font-medium" style={{ color: roleConf.color }}>{user.ruolo}</span>
            </p>
          </div>
        </div>
        {activePerms.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider mb-3">
              Permessi attivi su questa pagina
            </p>
            <div className="flex flex-wrap gap-2">
              {activePerms.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]"
                >
                  <Icon.Check size={10} />
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="bg-[#FAFFFE] rounded-2xl border border-[#D1FAE5] border-dashed p-12 text-center">
        <div className="text-5xl mb-4">🚧</div>
        <p className="text-[#6B7280] font-medium">Contenuto della pagina in sviluppo</p>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Questa sezione verrà integrata con il mockup esistente
        </p>
      </div>
    </div>
  );
};

// ─── PERMISSIONS PANEL ────────────────────────────────────────────────────────

interface PermissionsPanelProps {
  user: User;
  onClose: () => void;
}

const PermissionsPanel: FC<PermissionsPanelProps> = ({ user, onClose }) => {
  const perms = [...(ROLE_PERMISSIONS[user.ruolo] ?? [])].sort();
  const domains = [...new Set(ALL_PERMISSIONS.map((p) => p.split(":")[0]))];
  const roleConf = ROLE_CONFIG[user.ruolo];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#E5EAF2] shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5EAF2]">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: roleConf.bg }} className="p-2 rounded-xl">
              <Icon.Shield size={18} style={{ color: roleConf.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-[#2D2D2D]">Permessi Granulari</h3>
              <p className="text-xs text-[#9CA3AF]">
                {perms.length}/30 permessi assegnati al ruolo{" "}
                <span className="font-medium" style={{ color: roleConf.color }}>{user.ruolo}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F9FC] rounded-xl transition-colors">
            <Icon.X size={16} className="text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-4">
          {domains.map((domain) => {
            const domPerms = ALL_PERMISSIONS.filter((p) => p.startsWith(domain + ":"));
            return (
              <div key={domain}>
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                  {domain}
                </p>
                <div className="flex flex-wrap gap-2">
                  {domPerms.map((p) => {
                    const active = perms.includes(p);
                    return (
                      <span
                        key={p}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all ${
                          active
                            ? "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]"
                            : "bg-[#F9FAFB] text-[#9CA3AF] border-[#E5EAF2] opacity-60"
                        }`}
                      >
                        {active ? (
                          <Icon.Check size={10} />
                        ) : (
                          <span className="w-2.5 h-0.5 bg-[#D1D5DB] rounded-full inline-block" />
                        )}
                        {p}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTestUser, setSelectedTestUser] = useState<number | null>(null);
  const [showTestUsers, setShowTestUsers] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const found = USERS.find((u) => u.email === email && u.password === password);
      if (found) {
        onLogin(found);
      } else {
        setError("Email o password non validi. Controlla le credenziali e riprova.");
        setLoading(false);
      }
    }, 700);
  };

  const fillTestUser = (u: User): void => {
    setEmail(u.email);
    setPassword(u.password);
    setSelectedTestUser(u.id);
    setShowTestUsers(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      {/* LEFT PANEL — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)" }}
      >
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(23,232,143,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(23,232,143,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #17E88F 0%, transparent 70%)" }}
        />

        <div
          className={`relative z-10 flex flex-col justify-between p-12 w-full transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #17E88F, #0FA67A)" }}
            >
              <Icon.Package size={20} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-xl tracking-tight">LogiChain</span>
              <span className="text-[#17E88F] font-light text-xl"> ERP</span>
            </div>
          </div>

          {/* Copy */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#17E88F]/30 bg-[#17E88F]/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#17E88F] animate-pulse" />
                <span className="text-[#17E88F] text-xs font-medium tracking-wide">Sistema ERP Modulare</span>
              </div>
              <h1 className="text-4xl font-bold text-white leading-tight">
                Gestione supply chain
                <br />
                <span className="text-[#17E88F]">senza confini</span>
              </h1>
              <p className="text-[#94A3B8] text-base leading-relaxed max-w-sm">
                Dall&apos;acquisizione merci alla spedizione finale — un&apos;unica piattaforma per controllare ogni
                flusso operativo del tuo magazzino.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["RBAC Granulare", "Audit Log", "Transazioni ACID", "DDT Automatico", "Alert Real-time"].map(
                (f) => (
                  <span
                    key={f}
                    className="px-3 py-1 rounded-full text-xs font-medium text-[#CBD5E1] border border-[#334155] bg-[#1E293B]"
                  >
                    {f}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Roles list */}
          <div className="space-y-3">
            <p className="text-[#64748B] text-xs font-medium uppercase tracking-wider">5 ruoli operativi</p>
            <div className="space-y-2">
              {(Object.entries(ROLE_CONFIG) as [Role, RoleConfig][]).map(([role, conf]) => (
                <div key={role} className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: conf.color === "#0F172A" ? "#17E88F" : conf.color }}
                  />
                  <span className="text-[#94A3B8] text-sm">{role}</span>
                  <span className="text-[#475569] text-xs ml-auto">
                    {[...ROLE_PERMISSIONS[role]].length} permessi
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div
          className={`w-full max-w-md mx-auto transition-all duration-700 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #17E88F, #0FA67A)" }}
            >
              <Icon.Package size={16} className="text-white" />
            </div>
            <span className="text-[#2D2D2D] font-bold text-lg">LogiChain ERP</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0F172A]">Accedi al sistema</h2>
            <p className="text-[#6B7280] mt-1 text-sm">Inserisci le tue credenziali per continuare</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#374151]">Email</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <Icon.User size={15} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="nome@logichain.it"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#E5EAF2] rounded-xl text-sm text-[#2D2D2D] bg-white focus:outline-none focus:ring-2 focus:ring-[#17E88F]/40 focus:border-[#17E88F] transition-all placeholder:text-[#C4C9D4]"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#374151]">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <Icon.Lock size={15} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 border border-[#E5EAF2] rounded-xl text-sm text-[#2D2D2D] bg-white focus:outline-none focus:ring-2 focus:ring-[#17E88F]/40 focus:border-[#17E88F] transition-all placeholder:text-[#C4C9D4]"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                >
                  {showPassword ? <Icon.EyeOff size={15} /> : <Icon.Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
                <Icon.X size={14} className="text-[#DC2626] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#DC2626]">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#17E88F]/40 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: loading ? "#94A3B8" : "linear-gradient(135deg, #17E88F, #0FA67A)" }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Accesso in corso...
                </>
              ) : (
                <>
                  Accedi
                  <Icon.ChevronRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Test users accordion */}
          <div className="mt-6">
            <button
              onClick={() => setShowTestUsers((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#E5EAF2] rounded-xl text-sm text-[#6B7280] hover:bg-[#F7F9FC] hover:border-[#17E88F]/40 transition-all"
            >
              <div className="flex items-center gap-2">
                <Icon.Info size={14} className="text-[#17E88F]" />
                <span className="font-medium text-[#374151]">Utenti di test disponibili</span>
              </div>
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`text-[#9CA3AF] transition-transform duration-200 ${showTestUsers ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showTestUsers && (
              <div className="mt-2 bg-white border border-[#E5EAF2] rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E5EAF2]">
                  <p className="text-xs text-[#9CA3AF] font-medium">
                    Clicca su un utente per pre-compilare le credenziali
                  </p>
                </div>
                {USERS.map((u) => {
                  const conf = ROLE_CONFIG[u.ruolo];
                  return (
                    <button
                      key={u.id}
                      onClick={() => fillTestUser(u)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F7F9FC] transition-colors border-b border-[#E5EAF2] last:border-0 ${
                        selectedTestUser === u.id ? "bg-[#F0FDF4]" : ""
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: u.avatarBg }}
                      >
                        {u.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2D2D2D]">{u.nome} {u.cognome}</p>
                        <p className="text-xs text-[#9CA3AF] truncate">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: conf.bg, color: conf.color }}
                        >
                          {conf.label}
                        </span>
                        {selectedTestUser === u.id && (
                          <Icon.Check size={12} className="text-[#17E88F]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-center text-xs text-[#9CA3AF] mt-6">
            LogiChain ERP V1.0 — Sistema di gestione supply chain
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  user: User;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: FC<SidebarProps> = ({ user, currentPage, onNavigate, collapsed, onToggle }) => {
  const accessiblePages = SIDEBAR_ACCESS[user.ruolo] ?? [];
  const roleConf = ROLE_CONFIG[user.ruolo];
  const [showPermissions, setShowPermissions] = useState<boolean>(false);

  return (
    <>
      {showPermissions && (
        <PermissionsPanel user={user} onClose={() => setShowPermissions(false)} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col bg-[#0F172A] transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #17E88F, #0FA67A)" }}
          >
            <Icon.Package size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-white font-bold text-base tracking-tight">LogiChain</span>
              <span className="text-[#17E88F] font-light text-base"> ERP</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="ml-auto text-[#475569] hover:text-white transition-colors flex-shrink-0"
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const accessible = accessiblePages.includes(item.id);
            const active = currentPage === item.id;
            const IC = getIconComponent(item.icon);
            return (
              <button
                key={item.id}
                onClick={() => accessible && onNavigate(item.id)}
                disabled={!accessible}
                title={collapsed ? item.label : undefined}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  !accessible
                    ? "opacity-25 cursor-not-allowed text-[#475569]"
                    : active
                    ? "text-white font-medium bg-white/10"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                }`}
              >
                {active && (
                  <span
                    className="absolute left-0 w-0.5 h-8 rounded-r-full"
                    style={{ backgroundColor: "#17E88F" }}
                  />
                )}
                <IC size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#17E88F]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => setShowPermissions(true)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: user.avatarBg }}
            >
              {user.avatar}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user.nome} {user.cognome}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: roleConf.color === "#0F172A" ? "#17E88F" : roleConf.color }}
                >
                  {roleConf.label}
                </p>
              </div>
            )}
            {!collapsed && (
              <Icon.Shield
                size={14}
                className="text-[#475569] flex-shrink-0 hover:text-[#17E88F] transition-colors"
              />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

// ─── HEADER ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  user: User;
  onLogout: () => void;
  sidebarCollapsed: boolean;
}

const Header: FC<HeaderProps> = ({ user, onLogout, sidebarCollapsed }) => {
  const roleConf = ROLE_CONFIG[user.ruolo];
  const permCount = [...ROLE_PERMISSIONS[user.ruolo]].length;

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white border-b border-[#E5EAF2] flex items-center justify-end px-6 gap-4 transition-all duration-300 ${
        sidebarCollapsed ? "left-[72px]" : "left-[260px]"
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E5EAF2] bg-[#F8FAFC]">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: roleConf.color === "#0F172A" ? "#17E88F" : roleConf.color }}
        />
        <span className="text-xs font-medium text-[#374151]">{roleConf.label}</span>
        <span className="text-xs text-[#9CA3AF]">·</span>
        <span className="text-xs text-[#9CA3AF]">{permCount} permessi</span>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl border border-[#E5EAF2] transition-all"
      >
        <Icon.LogOut size={14} />
        <span className="hidden sm:inline">Esci</span>
      </button>
    </header>
  );
};

// ─── APP SHELL ────────────────────────────────────────────────────────────────

interface AppShellProps {
  user: User;
  onLogout: () => void;
}

const AppShell: FC<AppShellProps> = ({ user, onLogout }) => {
  const accessiblePages = SIDEBAR_ACCESS[user.ruolo] ?? [];
  const [currentPage, setCurrentPage] = useState<PageId>(
    (accessiblePages[0] as PageId) ?? "dashboard"
  );
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const handleNavigate = (page: PageId): void => {
    if (accessiblePages.includes(page)) setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Sidebar
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <Header user={user} onLogout={onLogout} sidebarCollapsed={collapsed} />

      <main
        className={`pt-16 p-6 transition-all duration-300 ${
          collapsed ? "ml-[72px]" : "ml-[260px]"
        }`}
      >
        <div className="max-w-screen-xl mx-auto space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#2D2D2D]">{PAGE_TITLES[currentPage]}</h1>
              <p className="text-sm text-[#6B7280] mt-0.5">
                Accesso come{" "}
                <span className="font-medium text-[#374151]">{user.nome} {user.cognome}</span>
                {" · "}
                <span style={{ color: ROLE_CONFIG[user.ruolo].color }}>
                  {ROLE_CONFIG[user.ruolo].label}
                </span>
              </p>
            </div>

            {/* Quick nav pills */}
            <div className="hidden md:flex items-center gap-1.5 flex-wrap justify-end max-w-xs">
              {accessiblePages.map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p as PageId)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    currentPage === p
                      ? "text-white"
                      : "text-[#9CA3AF] bg-white border border-[#E5EAF2] hover:border-[#17E88F]/40"
                  }`}
                  style={currentPage === p ? { backgroundColor: ROLE_CONFIG[user.ruolo].color } : {}}
                >
                  {PAGE_TITLES[p as PageId]}
                </button>
              ))}
            </div>
          </div>

          <PagePlaceholder page={currentPage} user={user} />
        </div>
      </main>
    </div>
  );
};

// ─── AUTH PROVIDER ────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (u: User): void => setUser(u);
  const logout = (): void => setUser(null);

  const checkPermission = (p: Permission): boolean =>
    user ? (ROLE_PERMISSIONS[user.ruolo]?.has(p) ?? false) : false;

  const checkPage = (page: PageId): boolean =>
    user ? (SIDEBAR_ACCESS[user.ruolo]?.includes(page) ?? false) : false;

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission: checkPermission, canAccessPage: checkPage }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────

export default function App(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);

  return user ? (
    <AppShell user={user} onLogout={() => setUser(null)} />
  ) : (
    <LoginPage onLogin={setUser} />
  );
}

// ─── EXPORTS FOR INTEGRATION ──────────────────────────────────────────────────
export { LoginPage, useAuth, ROLE_PERMISSIONS, SIDEBAR_ACCESS, ROLE_CONFIG, ALL_PERMISSIONS, USERS };
export type { User, Role, Permission, PageId, RoleConfig, AuthContextValue };
