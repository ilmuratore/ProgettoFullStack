import { useEffect, useState } from 'react';
import { Package, MapPin, AlertTriangle, RotateCw, Warehouse, Building2, TrendingUp, TrendingDown } from 'lucide-react';
import { giacenzeApi } from '../../../api/giacenzeApi';
import { magazzinoApi } from '../../../api/magazzinoApi';
import { movimentiStockApi } from '../../../api/movimentiStockApi';

interface KpiData {
  giacenzaTotale: number | null;
  ubicazioniAttive: number | null;
  prodottiSottoscorta: number | null;
  movimentiOggi: number | null;
  magazziниOperativi: number | null;
}

export function WarehouseKPIs() {
  const [kpi, setKpi] = useState<KpiData>({
    giacenzaTotale: null,
    ubicazioniAttive: null,
    prodottiSottoscorta: null,
    movimentiOggi: null,
    magazziниOperativi: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    Promise.allSettled([
      giacenzeApi.list(),
      giacenzeApi.list({ scorta: 'sotto' }),
      magazzinoApi.list(),
      movimentiStockApi.list(),
    ]).then(([giacenzeRes, sottoscortaRes, magazziниRes, movimentiRes]) => {
      const giacenze = giacenzeRes.status === 'fulfilled' ? giacenzeRes.value : [];
      const sottoscorta = sottoscortaRes.status === 'fulfilled' ? sottoscortaRes.value : [];
      const magazzini = magazziниRes.status === 'fulfilled' ? magazziниRes.value : [];
      const movimenti = movimentiRes.status === 'fulfilled' ? movimentiRes.value : [];

      const giacenzaTotale = giacenze.reduce((s, g) => s + (g.quantita ?? 0), 0);
      const magazziниOperativi = magazzini.filter((m) => m.attivo).length;
      const movimentiOggi = movimenti.filter((m) => m.created_at?.startsWith(today)).length;

      setKpi({
        giacenzaTotale,
        ubicazioniAttive: null,
        prodottiSottoscorta: sottoscorta.length,
        movimentiOggi,
        magazziниOperativi,
      });
    }).finally(() => setLoading(false));
  }, []);

  const fmt = (n: number | null) =>
    n === null ? '—' : n.toLocaleString('it-IT');

  const cards = [
    {
      icon: Package,
      title: 'Giacenza Totale',
      value: fmt(kpi.giacenzaTotale),
      unit: 'unità',
      iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB]',
    },
    {
      icon: MapPin,
      title: 'Ubicazioni Attive',
      value: '—',
      unit: 'M12',
      iconBg: 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]',
    },
    {
      icon: AlertTriangle,
      title: 'Prodotti Sottoscorta',
      value: fmt(kpi.prodottiSottoscorta),
      unit: 'alert attivi',
      iconBg: 'bg-gradient-to-br from-[#EF4444] to-[#DC2626]',
    },
    {
      icon: RotateCw,
      title: 'Movimenti Oggi',
      value: fmt(kpi.movimentiOggi),
      unit: 'operazioni',
      iconBg: 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]',
    },
    {
      icon: Warehouse,
      title: 'Capacità Occupata',
      value: '—',
      unit: 'M12',
      iconBg: 'bg-gradient-to-br from-[#17E88F] to-[#0FA67A]',
    },
    {
      icon: Building2,
      title: 'Magazzini Operativi',
      value: fmt(kpi.magazziниOperativi),
      unit: 'attivi',
      iconBg: 'bg-gradient-to-br from-[#06B6D4] to-[#0891B2]',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {cards.map((kpiCard, index) => {
        const Icon = kpiCard.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-[#E5EAF2] hover:shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${kpiCard.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              {loading && (
                <div className="w-12 h-5 bg-[#E5EAF2] rounded animate-pulse" />
              )}
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-[#2D2D2D]">
                {loading ? <div className="h-8 w-16 bg-[#E5EAF2] rounded animate-pulse" /> : kpiCard.value}
              </div>
              <div className="text-xs text-[#6B7280]">{kpiCard.unit}</div>
              <div className="text-xs text-[#6B7280] mt-2">{kpiCard.title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}