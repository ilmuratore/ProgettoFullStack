import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart, Euro, Building2, AlertTriangle, Package, Clock } from 'lucide-react';
import { acquistiApi } from '../../../api/acquistiApi';
import { fornitoriApi } from '../../../api/fornitoriApi';
import { ricezioniApi } from '../../../api/ricezioniApi';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const isOggi = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

const ATTIVI: ReadonlySet<string> = new Set(['BOZZA', 'INVIATO', 'CONFERMATO', 'IN_RICEZIONE']);
const STATI_RITARDO: ReadonlySet<string> = new Set(['BOZZA', 'INVIATO', 'CONFERMATO', 'IN_RICEZIONE']);

const normalizeDateOnly = (value: string) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayLocalDateOnly = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface KpiData {
  ordiniAttivi: number;
  valoreOrdiniAperti: number;
  fornitoriAttivi: number;
  ordiniInRitardo: number;
  ricezioniOggi: number;
  leadTimeMedio: number | null;
}

interface PurchaseKPIsProps {
  onOrdiniAttiviClick: () => void;
  onValoreApertoClick: () => void;
  onOrdiniRitardoClick: () => void;
  onLeadTimeClick: () => void;
}

export function PurchaseKPIs({ onOrdiniAttiviClick, onValoreApertoClick, onOrdiniRitardoClick, onLeadTimeClick }: PurchaseKPIsProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<KpiData | null>(null);

  useEffect(() => {
    Promise.all([acquistiApi.list(), fornitoriApi.list(), ricezioniApi.list()])
      .then(([ordini, fornitori, ricezioni]) => {
        const ordiniAttivi = ordini.filter((o) => ATTIVI.has(o.stato));
        const oggi = getTodayLocalDateOnly();
        const ordiniInRitardo = ordini.filter(
          (o) =>
            STATI_RITARDO.has(o.stato) &&
            Boolean(o.data_prevista) &&
            normalizeDateOnly(o.data_prevista as string) < oggi
        );
        const fornitoriAttivi = fornitori.filter((f) => f.attivo);
        const leadTimes = fornitoriAttivi.map((f) => f.lead_time_giorni).filter((v): v is number => v != null);

        setData({
          ordiniAttivi: ordiniAttivi.length,
          valoreOrdiniAperti: ordiniAttivi.reduce((sum, o) => sum + Number(o.importo_totale ?? 0), 0),
          fornitoriAttivi: fornitoriAttivi.length,
          ordiniInRitardo: ordiniInRitardo.length,
          ricezioniOggi: ricezioni.filter((r) => isOggi(r.data_ricezione)).length,
          leadTimeMedio: leadTimes.length ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length : null,
        });
      })
      .catch(() => {});
  }, []);

  const kpis = [
    {
      icon: ShoppingCart,
      title: 'Ordini Acquisto Attivi',
      value: data ? String(data.ordiniAttivi) : '…',
      iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB]',
      isWarning: false,
      onClick: onOrdiniAttiviClick,
    },
    {
      icon: Euro,
      title: 'Valore Ordini Aperti',
      value: data ? formatCurrency(data.valoreOrdiniAperti) : '…',
      iconBg: 'bg-gradient-to-br from-[#17E88F] to-[#0FA67A]',
      isWarning: false,
      onClick: onValoreApertoClick,
    },
    {
      icon: Building2,
      title: 'Fornitori Attivi',
      value: data ? String(data.fornitoriAttivi) : '…',
      iconBg: 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]',
      isWarning: false,
      onClick: () => navigate('/anagrafiche?tab=fornitori'),
    },
    {
      icon: AlertTriangle,
      title: 'Ordini in Ritardo',
      value: data ? String(data.ordiniInRitardo) : '…',
      iconBg: 'bg-gradient-to-br from-[#EF4444] to-[#DC2626]',
      isWarning: true,
      onClick: onOrdiniRitardoClick,
    },
    {
      icon: Package,
      title: 'Ricezioni Oggi',
      value: data ? String(data.ricezioniOggi) : '…',
      iconBg: 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]',
      isWarning: false,
      onClick: () => navigate('/magazzino?tab=ricezioni'),
    },
    {
      icon: Clock,
      title: 'Lead Time Medio',
      value: data ? (data.leadTimeMedio !== null ? `${data.leadTimeMedio.toFixed(1).replace('.', ',')} gg` : '—') : '…',
      iconBg: 'bg-gradient-to-br from-[#06B6D4] to-[#0891B2]',
      isWarning: false,
      onClick: onLeadTimeClick,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;

        return (
          <div
            key={index}
            onClick={kpi.onClick}
            className="bg-white rounded-xl px-4 py-4 border border-[#E5EAF2] hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-3"
          >
            <div className={`w-9 h-9 ${kpi.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-bold text-[#2D2D2D] truncate">{kpi.value}</div>
              <div className="text-xs text-[#9CA3AF] truncate">{kpi.title}</div>
            </div>
            {kpi.isWarning && (
              <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-[#FEF3C7] text-[#F59E0B]">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs font-medium">Alert</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
