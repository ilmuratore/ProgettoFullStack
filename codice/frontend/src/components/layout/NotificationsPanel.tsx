import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Package, AlertTriangle, Truck, FileText, ChevronRight } from 'lucide-react';

interface Notification {
  id: string;
  type: 'sotto_scorta' | 'po_ritardo' | 'ricezione_parziale' | 'cambio_stato_spedizione' | 'altro';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  resourceId?: string;
  resourcePage?: string;
}

interface NotificationsPanelProps {
  onNavigate?: (page: string) => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'sotto_scorta',
    title: 'Prodotto Sotto Scorta',
    description: 'Film Estensibile Trasparente 50cm (PLT-EUR-001) è sotto la scorta minima',
    timestamp: new Date(Date.now() - 5 * 60000),
    read: false,
    resourceId: 'PLT-EUR-001',
    resourcePage: 'prodotti',
  },
  {
    id: '2',
    type: 'cambio_stato_spedizione',
    title: 'Spedizione In Consegna',
    description: 'Spedizione SHIP-2024-456 è ora in stato "In Consegna"',
    timestamp: new Date(Date.now() - 15 * 60000),
    read: false,
    resourceId: 'SHIP-2024-456',
    resourcePage: 'logistica',
  },
  {
    id: '3',
    type: 'po_ritardo',
    title: 'Ordine in Ritardo',
    description: 'PO-2024-001 previsto per oggi non è ancora arrivato',
    timestamp: new Date(Date.now() - 45 * 60000),
    read: false,
    resourceId: 'PO-2024-001',
    resourcePage: 'acquisti',
  },
  {
    id: '4',
    type: 'ricezione_parziale',
    title: 'Ricezione Parziale',
    description: 'Ricevute 450 unità su 500 previste per PO-2024-002',
    timestamp: new Date(Date.now() - 2 * 3600000),
    read: true,
    resourceId: 'PO-2024-002',
    resourcePage: 'acquisti',
  },
  {
    id: '5',
    type: 'altro',
    title: 'Nuovo Cliente Registrato',
    description: 'Nuovo cliente "ABC Logistics" aggiunto al sistema',
    timestamp: new Date(Date.now() - 4 * 3600000),
    read: true,
    resourcePage: 'clienti',
  },
];

const notificationIcons = {
  sotto_scorta: AlertTriangle,
  po_ritardo: Package,
  ricezione_parziale: Package,
  cambio_stato_spedizione: Truck,
  altro: FileText,
};

const notificationColors = {
  sotto_scorta: { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]' },
  po_ritardo: { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]' },
  ricezione_parziale: { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]' },
  cambio_stato_spedizione: { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]' },
  altro: { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]' },
};

function formatTimestamp(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Adesso';
  if (minutes < 60) return `${minutes}m fa`;
  if (hours < 24) return `${hours}h fa`;
  return `${days}g fa`;
}

export function NotificationsPanel({ onNavigate }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[Notifications] Polling server for updates...');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.resourcePage) {
      onNavigate?.(notification.resourcePage);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#F7F9FC] rounded-xl transition-all"
      >
        <Bell className="w-5 h-5 text-[#6B7280]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#EF4444] text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-xl border border-[#E5EAF2] overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5EAF2]">
            <div>
              <h3 className="font-semibold text-[#2D2D2D]">Notifiche</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">{unreadCount} non lette</p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-[#17E88F] hover:text-[#0FA67A] font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Segna tutte
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-[#F7F9FC] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 text-[#E5EAF2] mx-auto mb-3" />
                <p className="text-sm text-[#6B7280]">Nessuna notifica</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E5EAF2]">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type];
                  const colors = notificationColors[notification.type];
                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-[#F7F9FC] transition-all text-left group ${
                        !notification.read ? 'bg-[#F0FDF7]/50' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-[#2D2D2D]' : 'text-[#6B7280]'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="p-1 hover:bg-[#DCFCE7] rounded-lg transition-colors"
                            >
                              <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-[#9CA3AF]">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {notification.resourcePage && (
                            <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
