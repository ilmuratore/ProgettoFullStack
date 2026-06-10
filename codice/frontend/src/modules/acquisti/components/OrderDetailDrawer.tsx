import { useEffect, useState } from 'react';
import { X, FileText, Package, Clock, User, Building2, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { acquistiApi } from '../../../api/acquistiApi';
import type { OrdineAcquistoDettaglio } from '../../../types/acquisti';

interface OrderDetailDrawerProps {
  orderId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const fmtData = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString('it-IT') : '—';

const fmtDataOra = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString('it-IT') : '—';

const fmtEuro = (n: number): string =>
  `€ ${Number(n ?? 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'BOZZA':
      return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Bozza' };
    case 'INVIATO':
      return { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]', label: 'Inviato' };
    case 'CONFERMATO':
      return { bg: 'bg-[#EDE9FE]', text: 'text-[#8B5CF6]', label: 'Confermato' };
    case 'IN_RICEZIONE':
      return { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]', label: 'In Ricezione' };
    case 'COMPLETATO':
      return { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', label: 'Completato' };
    case 'ANNULLATO':
      return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Annullato' };
    default:
      return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: status };
  }
};

export function OrderDetailDrawer({ orderId, isOpen, onClose }: OrderDetailDrawerProps) {
  const [data, setData] = useState<OrdineAcquistoDettaglio | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || orderId == null) { setData(null); return; }
    let alive = true;
    setLoading(true);
    acquistiApi
      .getById(orderId)
      .then((d) => { if (alive) setData(d); })
      .catch((err: any) => toast.error('Errore caricamento ordine', { description: err?.message }))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [orderId, isOpen]);

  if (!isOpen || orderId == null) return null;

  const ordine = data?.ordine;
  const righe = data?.righe ?? [];
  const ricezioni = data?.ricezioni ?? [];
  const badge = getStatusBadge(ordine?.stato ?? '');
  const totaleOrdine = righe.reduce((sum, r) => sum + Number(r.quantita_ordinata) * Number(r.prezzo_unitario), 0);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-white border-b border-[#E5EAF2] p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-[#2D2D2D] font-mono">OA-{String(orderId).padStart(4, '0')}</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-sm text-[#6B7280]">Dettaglio Ordine di Acquisto</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-[#F7F9FC] rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
        </div>

        {loading || !ordine ? (
          <div className="p-12 text-center text-sm text-[#6B7280]">Caricamento dettaglio...</div>
        ) : (
        <div className="p-6 space-y-6">
          {/* Informazioni Generali */}
          <div className="bg-[#F7F9FC] rounded-2xl p-6">
            <h3 className="font-semibold text-[#2D2D2D] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#17E88F]" />
              Informazioni Generali
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                  <Building2 className="w-3 h-3" />
                  Fornitore
                </div>
                <div className="text-sm font-medium text-[#2D2D2D]">{ordine.fornitore}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                  <User className="w-3 h-3" />
                  Responsabile
                </div>
                <div className="text-sm font-medium text-[#2D2D2D]">{ordine.utente ?? '—'}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                  <Calendar className="w-3 h-3" />
                  Data Creazione
                </div>
                <div className="text-sm font-medium text-[#2D2D2D]">{fmtData(ordine.created_at)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                  <Clock className="w-3 h-3" />
                  Data Prevista
                </div>
                <div className="text-sm font-medium text-[#2D2D2D]">{fmtData(ordine.data_prevista)}</div>
              </div>
            </div>
            {ordine.note && (
              <div className="mt-4 pt-4 border-t border-[#E5EAF2]">
                <div className="text-xs text-[#6B7280] mb-1">Note</div>
                <div className="text-sm text-[#2D2D2D]">{ordine.note}</div>
              </div>
            )}
          </div>

          {/* Prodotti Ordinati */}
          <div>
            <h3 className="font-semibold text-[#2D2D2D] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#17E88F]" />
              Prodotti Ordinati
            </h3>
            <div className="bg-white border border-[#E5EAF2] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F7F9FC]">
                  <tr className="border-b border-[#E5EAF2]">
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Prodotto</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Qta Ord.</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Qta Ric.</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Prezzo</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Totale</th>
                  </tr>
                </thead>
                <tbody>
                  {righe.map((r) => (
                    <tr key={r.id} className="border-b border-[#E5EAF2] last:border-0">
                      <td className="py-3 px-4 text-sm text-[#2D2D2D]">{r.prodotto ?? `#${r.prodotto_id}`}</td>
                      <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{r.quantita_ordinata}</td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium ${Number(r.quantita_ricevuta) > 0 ? 'text-[#22C55E]' : 'text-[#6B7280]'}`}>
                          {r.quantita_ricevuta}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#6B7280]">{fmtEuro(r.prezzo_unitario)}</td>
                      <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{fmtEuro(Number(r.quantita_ordinata) * Number(r.prezzo_unitario))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-[#F7F9FC] px-4 py-3 flex items-center justify-between border-t border-[#E5EAF2]">
                <span className="font-medium text-[#2D2D2D]">Totale Ordine</span>
                <span className="text-xl font-semibold text-[#17E88F]">{fmtEuro(totaleOrdine)}</span>
              </div>
            </div>
          </div>

          {/* Storico Ricezioni */}
          {ricezioni.length > 0 && (
            <div>
              <h3 className="font-semibold text-[#2D2D2D] mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#17E88F]" />
                Storico Ricezioni
              </h3>
              <div className="space-y-3">
                {ricezioni.map((ricezione) => (
                  <div key={ricezione.id} className="bg-[#F7F9FC] rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#17E88F] rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#2D2D2D]">{fmtDataOra(ricezione.data_ricezione)}</div>
                          <div className="text-xs text-[#6B7280]">{ricezione.utente ?? '—'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#6B7280] flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Ricezione #{ricezione.id}
                        </div>
                      </div>
                    </div>
                    {ricezione.note && (
                      <div className="mt-2 text-xs text-[#6B7280]">{ricezione.note}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </>
  );
}
