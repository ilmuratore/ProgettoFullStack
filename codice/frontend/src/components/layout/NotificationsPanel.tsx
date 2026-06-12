import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Package, AlertTriangle, Truck, FileText, ChevronRight } from 'lucide-react';
import { notificheApi } from '../../api/notificheApi';
import type { Notifica, NotifType } from '../../types/notifiche';

interface NotificationsPanelProps {
  onNavigate?: (page: string) => void;
}

const notificationIcons: Record<NotifType, typeof AlertTriangle> = {
  SOTTO_SCORTA: AlertTriangle,
  PO_IN_RITARDO: Package,
  RICEZIONE_PARZIALE: Package,
  CAMBIO_STATO_SPEDIZIONE: Truck,
  RICHIESTA_ACCETTATA: FileText,
  RICHIESTA_RIFIUTATA: FileText,
  MESSAGGIO_FORNITORE: FileText,
  ALTRO: FileText,
};

const notificationColors: Record<NotifType, { bg: string; text: string }> = {
  SOTTO_SCORTA: { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]' },
  PO_IN_RITARDO: { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]' },
  RICEZIONE_PARZIALE: { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]' },
  CAMBIO_STATO_SPEDIZIONE: { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]' },
  RICHIESTA_ACCETTATA: { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]' },
  RICHIESTA_RIFIUTATA: { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]' },
  MESSAGGIO_FORNITORE: { bg: 'bg-[#EDE9FE]', text: 'text-[#8B5CF6]' },
  ALTRO: { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]' },
};

const notificationTitles: Record<NotifType, string> = {
  SOTTO_SCORTA: 'Prodotto Sotto Scorta',
  PO_IN_RITARDO: 'Ordine in Ritardo',
  RICEZIONE_PARZIALE: 'Ricezione Parziale',
  CAMBIO_STATO_SPEDIZIONE: 'Cambio Stato Spedizione',
  RICHIESTA_ACCETTATA: 'Richiesta Accettata',
  RICHIESTA_RIFIUTATA: 'Richiesta Rifiutata',
  MESSAGGIO_FORNITORE: 'Messaggio Fornitore',
  ALTRO: 'Notifica',
};

const notificationPages: Partial<Record<NotifType, string>> = {
  SOTTO_SCORTA: 'magazzino',
  PO_IN_RITARDO: 'acquisti',
  RICEZIONE_PARZIALE: 'acquisti',
  CAMBIO_STATO_SPEDIZIONE: 'logistica',
  RICHIESTA_ACCETTATA: 'acquisti',
  RICHIESTA_RIFIUTATA: 'acquisti',
  MESSAGGIO_FORNITORE: 'acquisti',
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
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
  const [notifications, setNotifications] = useState<Notifica[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
    let active = true;

    const loadUnreadCount = () => {
      notificheApi.count()
        .then((data) => {
          if (!active) return;
          setUnreadCount(Number(data?.count ?? 0));
        })
        .catch(() => {
          if (!active) return;
          setUnreadCount(0);
        });
    };

    loadUnreadCount();
    const intervalId = window.setInterval(loadUnreadCount, 60000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    notificheApi.list()
      .then((data) => {
        const nextNotifications = Array.isArray(data) ? data : [];
        setNotifications(nextNotifications);
        setUnreadCount(nextNotifications.filter((n) => !n.letto).length);
      })
      .catch(() => setNotifications([]));
  }, [isOpen]);

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target && !target.letto) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.map((n) => (n.id === id ? { ...n, letto: true } : n));
    });
    notificheApi.markAsRead(id).catch(() => {});
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, letto: true })));
    setUnreadCount(0);
    notificheApi.markAllAsRead().catch(() => {});
  };

  const handleNotificationClick = (notification: Notifica) => {
    handleMarkAsRead(notification.id);
    const targetPage = notificationPages[notification.tipo];
    if (targetPage) {
      onNavigate?.(targetPage);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => {
          sessionStorage.setItem('dashboard-tab', 'alert');
          onNavigate?.('dashboard');
          setIsOpen((prev) => !prev);
        }}
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
                  const Icon = notificationIcons[notification.tipo];
                  const colors = notificationColors[notification.tipo];
                  const title = notificationTitles[notification.tipo];

                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-[#F7F9FC] transition-all text-left group ${
                        !notification.letto ? 'bg-[#F0FDF7]/50' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notification.letto ? 'text-[#2D2D2D]' : 'text-[#6B7280]'}`}>
                            {title}
                          </p>
                          {!notification.letto && (
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
                          {notification.messaggio}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-[#9CA3AF]">
                            {formatTimestamp(notification.created_at)}
                          </span>
                          {notificationPages[notification.tipo] && (
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
