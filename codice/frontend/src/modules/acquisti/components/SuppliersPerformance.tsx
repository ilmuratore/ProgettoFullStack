import { TrendingUp, TrendingDown, Star } from 'lucide-react';

interface Supplier {
  ragioneSociale: string;
  leadTimeMedio: string;
  ordiniTotali: number;
  ordiniCompletati: number;
  ordiniInRitardo: number;
  importoAcquisti: string;
  valutazione: number;
  stato: 'Eccellente' | 'Buono' | 'Da Migliorare';
}

const suppliers: Supplier[] = [
  { ragioneSociale: 'Packaging Solutions Italia S.p.A.', leadTimeMedio: '7,2 gg', ordiniTotali: 24, ordiniCompletati: 22, ordiniInRitardo: 1, importoAcquisti: '€ 285.450', valutazione: 4.8, stato: 'Eccellente' },
  { ragioneSociale: 'Pallet Systems Europe S.p.A.', leadTimeMedio: '8,5 gg', ordiniTotali: 18, ordiniCompletati: 17, ordiniInRitardo: 0, importoAcquisti: '€ 198.320', valutazione: 4.9, stato: 'Eccellente' },
  { ragioneSociale: 'Film Protezione Italia S.p.A.', leadTimeMedio: '6,8 gg', ordiniTotali: 15, ordiniCompletati: 14, ordiniInRitardo: 1, importoAcquisti: '€ 167.890', valutazione: 4.6, stato: 'Buono' },
  { ragioneSociale: 'Etichette Professionali S.r.l.', leadTimeMedio: '9,3 gg', ordiniTotali: 12, ordiniCompletati: 11, ordiniInRitardo: 0, importoAcquisti: '€ 142.560', valutazione: 4.7, stato: 'Buono' },
  { ragioneSociale: 'Nastri & Reggette S.r.l.', leadTimeMedio: '10,2 gg', ordiniTotali: 10, ordiniCompletati: 8, ordiniInRitardo: 2, importoAcquisti: '€ 98.750', valutazione: 4.2, stato: 'Buono' },
  { ragioneSociale: 'Scatole Cartone Europa S.p.A.', leadTimeMedio: '12,5 gg', ordiniTotali: 9, ordiniCompletati: 6, ordiniInRitardo: 3, importoAcquisti: '€ 125.340', valutazione: 3.8, stato: 'Da Migliorare' },
  { ragioneSociale: 'Materiali Logistica Pro S.r.l.', leadTimeMedio: '7,9 gg', ordiniTotali: 8, ordiniCompletati: 8, ordiniInRitardo: 0, importoAcquisti: '€ 87.420', valutazione: 4.9, stato: 'Eccellente' },
  { ragioneSociale: 'Protezione Merci S.r.l.', leadTimeMedio: '11,4 gg', ordiniTotali: 7, ordiniCompletati: 5, ordiniInRitardo: 2, importoAcquisti: '€ 76.890', valutazione: 4.0, stato: 'Buono' },
];

const getStatoBadge = (stato: string) => {
  switch (stato) {
    case 'Eccellente':
      return { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]' };
    case 'Buono':
      return { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]' };
    case 'Da Migliorare':
      return { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]' };
    default:
      return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]' };
  }
};

export function SuppliersPerformance() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[#2D2D2D]">Performance Fornitori</h3>
        <div className="text-xs text-[#6B7280]">Ultimi 90 giorni</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Ragione Sociale</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Lead Time Medio</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Ordini Totali</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Completati</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">In Ritardo</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Importo Acquisti</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Valutazione</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Stato</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier, index) => {
              const badge = getStatoBadge(supplier.stato);
              const completionRate = (supplier.ordiniCompletati / supplier.ordiniTotali) * 100;

              return (
                <tr
                  key={index}
                  className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                  }`}
                >
                  <td className="py-3 px-4 text-sm text-[#2D2D2D] font-medium">{supplier.ragioneSociale}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#2D2D2D]">{supplier.leadTimeMedio}</span>
                      {parseFloat(supplier.leadTimeMedio) < 9 ? (
                        <TrendingDown className="w-3 h-3 text-[#22C55E]" />
                      ) : (
                        <TrendingUp className="w-3 h-3 text-[#EF4444]" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{supplier.ordiniTotali}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#22C55E]">{supplier.ordiniCompletati}</span>
                      <span className="text-xs text-[#6B7280]">({completionRate.toFixed(0)}%)</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {supplier.ordiniInRitardo > 0 ? (
                      <span className="text-sm font-medium text-[#EF4444]">{supplier.ordiniInRitardo}</span>
                    ) : (
                      <span className="text-sm text-[#6B7280]">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{supplier.importoAcquisti}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                      <span className="text-sm font-medium text-[#2D2D2D]">{supplier.valutazione}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                      {supplier.stato}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E5EAF2]">
        <div className="text-sm text-[#6B7280]">
          Mostrando <span className="font-medium text-[#2D2D2D]">{suppliers.length}</span> fornitori
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-[#22C55E] rounded-full" />
            <span className="text-[#6B7280]">Eccellente</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-[#3B82F6] rounded-full" />
            <span className="text-[#6B7280]">Buono</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-[#F59E0B] rounded-full" />
            <span className="text-[#6B7280]">Da Migliorare</span>
          </div>
        </div>
      </div>
    </div>
  );
}
