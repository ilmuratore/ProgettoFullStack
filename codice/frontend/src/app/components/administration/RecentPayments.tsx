import { ArrowDownCircle, ArrowUpCircle, CreditCard, Building2 } from 'lucide-react';

const incassi = [
  { cliente: 'Ferrero S.p.A.', importo: '€ 24.850', metodo: 'Bonifico', data: '03/06/2026 14:32' },
  { cliente: 'Barilla Group', importo: '€ 32.100', metodo: 'RiBa', data: '02/06/2026 10:15' },
  { cliente: 'Lavazza S.p.A.', importo: '€ 18.500', metodo: 'Bonifico', data: '01/06/2026 16:45' },
];

const pagamenti = [
  { fornitore: 'Packaging Solutions', importo: '€ 8.420', metodo: 'Bonifico', data: '03/06/2026 09:22' },
  { fornitore: 'Trasporti Rossi', importo: '€ 4.200', metodo: 'Bonifico', data: '02/06/2026 11:30' },
  { fornitore: 'Energia Italia', importo: '€ 2.840', metodo: 'SDD', data: '01/06/2026 08:00' },
];

export function RecentPayments() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Incassi Recenti */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <ArrowDownCircle className="w-5 h-5 text-[#22C55E]" />
          <h3 className="font-semibold text-[#2D2D2D]">Incassi Recenti</h3>
        </div>
        <div className="space-y-4">
          {incassi.map((incasso, idx) => (
            <div key={idx} className="relative flex items-start gap-4">
              <div className="relative z-10 w-10 h-10 bg-[#DCFCE7] rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-[#22C55E]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#2D2D2D] mb-1">{incasso.cliente}</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-[#22C55E]">{incasso.importo}</span>
                  <CreditCard className="w-3 h-3 text-[#9CA3AF]" />
                  <span className="text-xs text-[#6B7280]">{incasso.metodo}</span>
                </div>
                <span className="text-xs text-[#9CA3AF]">{incasso.data}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagamenti Fornitori */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <ArrowUpCircle className="w-5 h-5 text-[#EF4444]" />
          <h3 className="font-semibold text-[#2D2D2D]">Pagamenti Fornitori</h3>
        </div>
        <div className="space-y-4">
          {pagamenti.map((pagamento, idx) => (
            <div key={idx} className="relative flex items-start gap-4">
              <div className="relative z-10 w-10 h-10 bg-[#FEE2E2] rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#2D2D2D] mb-1">{pagamento.fornitore}</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-[#EF4444]">{pagamento.importo}</span>
                  <CreditCard className="w-3 h-3 text-[#9CA3AF]" />
                  <span className="text-xs text-[#6B7280]">{pagamento.metodo}</span>
                </div>
                <span className="text-xs text-[#9CA3AF]">{pagamento.data}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
