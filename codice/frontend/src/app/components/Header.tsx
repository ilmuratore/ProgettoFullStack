import { useState, useRef, useEffect } from 'react';
import { Search, ChevronRight, LogOut, User, Shield, BellRing, Settings, FileText, HelpCircle, ChevronDown } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { NotificationsPanel } from './NotificationsPanel';
import type { User as AuthUser } from './LogiChain_Auth';

// ─── Colori ruolo per il badge header ─────────────────────────────────────────
const ROLE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  Admin:                    { color: '#0F172A', bg: '#F1F5F9', label: 'Admin'           },
  'Responsabile Acquisti':  { color: '#1D4ED8', bg: '#DBEAFE', label: 'Resp. Acquisti'  },
  'Responsabile Magazzino': { color: '#0D9488', bg: '#CCFBF1', label: 'Resp. Magazzino' },
  Operatore:                { color: '#16A34A', bg: '#DCFCE7', label: 'Operatore'        },
  Corriere:                 { color: '#EA580C', bg: '#FEE2E2', label: 'Corriere'         },
};

interface HeaderProps {
  onNavigate?: (page: string) => void;
  sidebarCollapsed?: boolean;
  // Nuovi props per l'integrazione con il sistema auth
  user?: AuthUser;
  onLogout?: () => void;
}

const dropdownItems = [
  { icon: User,       label: 'Il Mio Profilo',    page: 'amministrazione', color: 'text-[#3B82F6]', bg: 'bg-[#DBEAFE]' },
  { icon: Shield,     label: 'Sicurezza',          page: null,              color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]' },
  { icon: BellRing,   label: 'Notifiche',          page: null,              color: 'text-[#8B5CF6]', bg: 'bg-[#EDE9FE]' },
  { icon: Settings,   label: 'Preferenze',         page: null,              color: 'text-[#6B7280]', bg: 'bg-[#F3F4F6]' },
  { icon: FileText,   label: 'Attività Recenti',   page: null,              color: 'text-[#17E88F]', bg: 'bg-[#F0FDF7]' },
  { icon: HelpCircle, label: 'Supporto',           page: null,              color: 'text-[#6B7280]', bg: 'bg-[#F3F4F6]' },
];

export function Header({ onNavigate, sidebarCollapsed = false, user, onLogout }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dati utente: reali se disponibili, fallback ai valori mockup
  const displayName = user ? `${user.nome} ${user.cognome}` : 'Mario Rossi';
  const displayRole = user?.ruolo ?? 'Admin';
  const displayEmail = user?.email ?? 'admin@logichain.it';
  const displayAvatar = user?.avatar ?? 'MR';
  const displayAvatarBg = user?.avatarBg ?? '#17E88F';
  const roleConf = ROLE_CONFIG[displayRole] ?? ROLE_CONFIG['Admin'];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout?.();
  };

  return (
    <>
      <header className={`h-16 bg-white/80 backdrop-blur-sm border-b border-[#E5EAF2] fixed top-0 right-0 z-10 transition-all duration-300 ${sidebarCollapsed ? 'left-[72px]' : 'left-[260px]'}`}>
        <div className="h-full px-6 flex items-center justify-between">

          {/* Breadcrumb */}
          <div className="flex items-center gap-4">
            <div>
              <h2 className="font-semibold text-[#2D2D2D]">Dashboard Operativa</h2>
              <div className="flex items-center gap-2 text-sm text-[#6B7280] mt-0.5">
                <span>Home</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#17E88F]">Dashboard</span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="relative w-64 h-10 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl hover:border-[#17E88F] transition-all text-left group"
            >
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-[#17E88F]" />
              <span className="text-sm text-[#9CA3AF]">Cerca...</span>
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-mono bg-white text-[#6B7280] rounded border border-[#E5EAF2]">⌘K</kbd>
            </button>

            <NotificationsPanel onNavigate={onNavigate} />

            <div className="h-8 w-px bg-[#E5EAF2]" />

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#F7F9FC] transition-all group"
              >
                <div className="text-right">
                  <div className="font-medium text-sm text-[#2D2D2D]">{displayName}</div>
                  <div className="text-xs" style={{ color: roleConf.color }}>{roleConf.label}</div>
                </div>
                {/* Avatar con colore ruolo */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                  style={{ backgroundColor: displayAvatarBg }}
                >
                  {displayAvatar}
                </div>
                <ChevronDown className={`w-4 h-4 text-[#9CA3AF] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E5EAF2] overflow-hidden z-50">

                  {/* Profile header */}
                  <div className="p-4 bg-gradient-to-br from-[#F0FDF7] to-[#F7F9FC] border-b border-[#E5EAF2]">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md text-white text-lg font-bold"
                        style={{ backgroundColor: displayAvatarBg }}
                      >
                        {displayAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#2D2D2D]">{displayName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: roleConf.bg, color: roleConf.color }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: roleConf.color }} />
                            {roleConf.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#9CA3AF] truncate mt-1">{displayEmail}</p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-[#DCFCE7] text-[#16A34A] rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full" />
                          Attivo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    {dropdownItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            setDropdownOpen(false);
                            if (item.page) onNavigate?.(item.page);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F7F9FC] transition-colors text-left group"
                        >
                          <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-4 h-4 ${item.color}`} />
                          </div>
                          <span className="text-sm font-medium text-[#2D2D2D]">{item.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Logout */}
                  <div className="p-2 border-t border-[#E5EAF2]">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FEE2E2] transition-colors text-left group"
                    >
                      <div className="w-8 h-8 bg-[#FEE2E2] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#FECACA]">
                        <LogOut className="w-4 h-4 text-[#EF4444]" />
                      </div>
                      <span className="text-sm font-medium text-[#EF4444]">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {searchOpen && <GlobalSearch onNavigate={onNavigate} onClose={() => setSearchOpen(false)} />}
    </>
  );
}
