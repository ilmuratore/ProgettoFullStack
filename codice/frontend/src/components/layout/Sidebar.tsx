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
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarProps {
  onNavigate?: (page: string) => void;
  activePage?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
  accessiblePages?: string[];
  onLogout?: () => void;
}

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

  // Filtra per accessiblePages — accetta sia Page[] che string[]
  const menuItems = accessiblePages
    ? ALL_MENU_ITEMS.filter(item => accessiblePages.includes(item.id))
    : ALL_MENU_ITEMS;

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

              {/* Tooltip quando collassata */}
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

         {/* Supporto */}
        <div className="relative group/supporto">
          <button
            onClick={() => navigate('supporto')}
            className={`w-full flex items-center rounded-xl hover:bg-[#F7F9FC] transition-all ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'}`}
          >
            <HelpCircle className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
            {!isCollapsed && <span className="text-sm text-[#6B7280]">Supporto</span>}
          </button>
          {isCollapsed && (
            <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#1E293B] text-white text-xs font-medium rounded-lg opacity-0 group-hover/supporto:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
              Supporto<div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1E293B]" />
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