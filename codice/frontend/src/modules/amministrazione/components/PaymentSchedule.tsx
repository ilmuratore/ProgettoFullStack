import { Calendar, AlertTriangle } from 'lucide-react';

const payments = [
  { documento: 'FT-2026-0845', tipo: 'ATTIVA', soggetto: 'Ferrero S.p.A.', importo: '€ 24.850', scadenza: '05/06/2026', giorniMancanti: 1, priorita: 'Alta', stato: 'DA_INCASSARE' },
  { documento: 'FT-2026-0843', tipo: 'PASSIVA', soggetto: 'Trasporti Rossi', importo: '€ 4.200', scadenza: '06/06/2026', giorniMancanti: 2, priorita: 'Media', stato: 'DA_PAGARE' },
  { documento: 'FT-2026-0842', tipo: 'ATTIVA', soggetto: 'Lavazza S.p.A.', importo: '€ 18.500', scadenza: '07/06/2026', giorniMancanti: 3, priorita: 'Alta', stato: 'DA_INCASSARE' },
  { documento: 'FT-2026-0840', tipo: 'PASSIVA', soggetto: 'Energia Italia', importo: '€ 2.840', scadenza: '10/06/2026', giorniMancanti: 6, priorita: 'Bassa', stato: 'DA_PAGARE' },
];

export function PaymentSchedule() {
  const getPriorityBadge = (priorita: string) => {
    const styles = {
      Alta: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
      Media: 'bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]',
      Bassa: 'bg-[#DBEAFE] text-[#3B82F6] border-[#BFDBFE]',
    };
    return <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${styles[priorita as keyof typeof styles]}`}>{priorita}</span>;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[#2D2D2D]">Scadenziario Pagamenti</h3>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#6B7280]" />
          <span className="text-sm text-[#6B7280]">{payments.length} scadenze</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Documento</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Tipo</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Soggetto</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Importo</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Scadenza</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Giorni Mancanti</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Priorità</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Stato</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, idx) => (
              <tr key={idx} className="border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors">
                <td className="py-4 px-3"><span className="text-sm font-medium text-[#2D2D2D]">{payment.documento}</span></td>
                <td className="py-4 px-3"><span className={`text-xs px-2 py-1 rounded ${payment.tipo === 'ATTIVA' ? 'bg-[#DBEAFE] text-[#3B82F6]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>{payment.tipo === 'ATTIVA' ? 'Attiva' : 'Passiva'}</span></td>
                <td className="py-4 px-3"><span className="text-sm text-[#2D2D2D]">{payment.soggetto}</span></td>
                <td className="py-4 px-3"><span className="text-sm font-medium text-[#2D2D2D]">{payment.importo}</span></td>
                <td className="py-4 px-3"><span className="text-sm text-[#6B7280]">{payment.scadenza}</span></td>
                <td className="py-4 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#2D2D2D]">{payment.giorniMancanti}</span>
                    {payment.giorniMancanti <= 2 && <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />}
                  </div>
                </td>
                <td className="py-4 px-3">{getPriorityBadge(payment.priorita)}</td>
                <td className="py-4 px-3"><span className="text-xs text-[#6B7280]">{payment.stato.replace('_', ' ')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
