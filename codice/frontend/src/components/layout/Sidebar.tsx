import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse,
  ShoppingCart,
  TrendingUp,
  Truck,
  Shield,
  ChevronsLeft,
  ChevronsRight,
  UserCog,
  LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import type { UiUser as User } from '../../types/auth';

interface SidebarProps {
  onNavigate?: (page: string) => void;
  activePage?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
  user?: User;
  accessiblePages?: string[];
  onLogout?: () => void;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'Admin':           { bg: '#1E293B', text: '#17E88F', dot: '#17E88F' },
  'Dev':             { bg: '#1E1B4B', text: '#A78BFA', dot: '#7C3AED' },
  'Supporto':        { bg: '#0C4A6E', text: '#7DD3FC', dot: '#0284C7' },
  'Resp. Azienda':   { bg: '#064E3B', text: '#6EE7B7', dot: '#059669' },
  'Resp. HR':        { bg: '#450A0A', text: '#FCA5A5', dot: '#DC2626' },
  'Resp. Vendite':   { bg: '#2E1065', text: '#C4B5FD', dot: '#7C3AED' },
  'Resp. Acquisti':  { bg: '#1E3A5F', text: '#60A5FA', dot: '#3B82F6' },
  'Resp. Magazzino': { bg: '#0F3535', text: '#2DD4BF', dot: '#0D9488' },
  'Operatore':       { bg: '#0F2D1A', text: '#4ADE80', dot: '#16A34A' },
  'Corriere':        { bg: '#2D1A0F', text: '#FB923C', dot: '#EA580C' },
};


const ALL_MENU_ITEMS = [
  { id: 'dashboard',       label: 'Generale',        icon: LayoutDashboard },
  { id: 'anagrafiche',     label: 'Anagrafiche',     icon: Users           },
  { id: 'magazzino',       label: 'Magazzino',       icon: Warehouse       },
  { id: 'acquisti',        label: 'Acquisti',        icon: ShoppingCart    },
  { id: 'vendite',         label: 'Vendite',         icon: TrendingUp      },
  { id: 'logistica',       label: 'Logistica',       icon: Truck           },
  { id: 'amministrazione', label: 'Amministrazione', icon: Shield          },
];

export function Sidebar({
  onNavigate,
  activePage = 'dashboard',
  onCollapsedChange,
  user,
  accessiblePages,
  onLogout,
}: SidebarProps) {
  const [activeItem, setActiveItem] = useState(activePage);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => { setActiveItem(activePage); }, [activePage]);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    onCollapsedChange?.(isCollapsed);
  }, [isCollapsed]);

  const navigate = (id: string) => {
    setActiveItem(id);
    onNavigate?.(id);
  };

  const menuItems = accessiblePages
    ? ALL_MENU_ITEMS.filter(item => accessiblePages.includes(item.id))
    : ALL_MENU_ITEMS;

  const displayName     = user ? `${user.nome} ${user.cognome}` : '—';
  const displayRole     = user?.ruolo ?? 'Admin';
  const displayAvatar   = user?.avatar ?? '??';
  const displayAvatarBg = user?.avatarBg ?? '#17E88F';
  const roleStyle       = ROLE_COLORS[displayRole] ?? ROLE_COLORS['Admin'];


  return (
    <aside className={`h-screen bg-white border-r border-[#E5EAF2] flex flex-col fixed left-0 top-0 transition-all duration-300 z-20 overflow-hidden ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}`}>

      {/* ── Logo ── */}
      <div className={`h-16 border-b border-[#E5EAF2] flex items-center gap-3 flex-shrink-0 ${isCollapsed ? 'px-4 justify-center' : 'px-5'}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-[#17E88F] to-[#0FA67A] rounded-xl flex items-center justify-center flex-shrink-0">
          <Package className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <div>
            <p className="font-semibold text-[#2D2D2D] leading-none">LogiChain</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">ERP Platform</p>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <div key={item.id} className="relative group/item">
              <button
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center rounded-xl transition-all duration-150 ${
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'
                } ${
                  isActive
                    ? 'bg-[#F0FFF8] text-[#17E88F]'
                    : 'text-[#6B7280] hover:bg-[#F7F9FC] hover:text-[#374151]'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#17E88F]' : 'text-[#9CA3AF] group-hover/item:text-[#374151]'}`} />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                {isActive && !isCollapsed && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#17E88F]" />}
              </button>

              {isCollapsed && (
                <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#1E293B] text-white text-xs font-medium rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1E293B]" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className={`border-t border-[#E5EAF2] space-y-1 flex-shrink-0 ${isCollapsed ? 'p-2' : 'p-3'}`}>

        {/* Collapse toggle */}
        <div className="relative group/collapse">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`w-full flex items-center rounded-xl hover:bg-[#F7F9FC] transition-all ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'}`}
          >
            {isCollapsed
              ? <ChevronsRight className="w-4 h-4 text-[#9CA3AF]" />
              : <><ChevronsLeft className="w-4 h-4 text-[#9CA3AF]" /><span className="text-sm text-[#6B7280]">Comprimi</span></>
            }
          </button>
          {isCollapsed && (
            <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#1E293B] text-white text-xs font-medium rounded-lg opacity-0 group-hover/collapse:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
              Espandi<div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1E293B]" />
            </div>
          )}
        </div>

        {/* User block */}
        <div className="relative group/user">
          <button
            onClick={() => navigate('profilo')}
            className={`w-full flex items-center rounded-xl hover:bg-[#F7F9FC] transition-all ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'}`}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: displayAvatarBg }}
            >
              {displayAvatar}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-medium text-[#2D2D2D] truncate">{displayName}</p>
                  <p className="text-xs truncate" style={{ color: roleStyle.dot }}>{displayRole}</p>
                </div>
                <UserCog className="w-4 h-4 text-[#C4CDD6] opacity-0 group-hover/user:opacity-100 transition-opacity" />
              </>
            )}
          </button>
          {isCollapsed && (
            <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#1E293B] text-white text-xs font-medium rounded-lg opacity-0 group-hover/user:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
              {displayName} — {displayRole}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1E293B]" />
            </div>
          )}
        </div>

        {/* Logout */}
        {onLogout && (
          <div className="relative group/logout">
            <button
              onClick={onLogout}
              className={`w-full flex items-center rounded-xl hover:bg-[#FEF2F2] transition-all ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'}`}
            >
              <LogOut className="w-4 h-4 text-[#EF4444] flex-shrink-0" />
              {!isCollapsed && <span className="text-sm text-[#EF4444] font-medium">Logout</span>}
            </button>
            {isCollapsed && (
              <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#1E293B] text-white text-xs font-medium rounded-lg opacity-0 group-hover/logout:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                Esci<div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1E293B]" />
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
