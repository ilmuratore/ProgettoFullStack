import { AlertTriangle, Users } from 'lucide-react';

const clienti = [
  { nome: 'Ferrero S.p.A.', credito: '€ 142.500', scadenzeAperte: 8, ultimoIncasso: '03/06/2026', rischio: 'Basso' },
  { nome: 'Barilla Group', credito: '€ 98.200', scadenzeAperte: 5, ultimoIncasso: '02/06/2026', rischio: 'Basso' },
  { nome: 'Lavazza S.p.A.', credito: '€ 84.300', scadenzeAperte: 12, ultimoIncasso: '28/05/2026', rischio: 'Medio' },
];

const fornitori = [
  { nome: 'Packaging Solutions', debito: '€ 48.200', scadenzeAperte: 3, ultimoPagamento: '03/06/2026', priorita: 'Media' },
  { nome: 'Trasporti Rossi', debito: '€ 32.800', scadenzeAperte: 2, ultimoPagamento: '02/06/2026', priorita: 'Alta' },
  { nome: 'Energia Italia', debito: '€ 18.400', scadenzeAperte: 1, ultimoPagamento: '01/06/2026', priorita: 'Bassa' },
];

export function CriticalPartners() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-5 h-5 text-[#3B82F6]" />
          <h3 className="font-semibold text-[#2D2D2D]">Clienti con Maggiore Esposizione</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5EAF2]">
                <th className="text-left py-3 px-2 text-xs font-medium text-[#9CA3AF]">Cliente</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-[#9CA3AF]">Credito</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-[#9CA3AF]">Scadenze</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-[#9CA3AF]">Ultimo Incasso</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-[#9CA3AF]">Rischio</th>
              </tr>
            </thead>
            <tbody>
              {clienti.map((cliente, idx) => (
                <tr key={idx} className="border-b border-[#E5EAF2] hover:bg-[#F7F9FC]">
                  <td className="py-3 px-2 text-sm font-medium text-[#2D2D2D]">{cliente.nome}</td>
                  <td className="py-3 px-2 text-sm font-bold text-[#17E88F]">{cliente.credito}</td>
                  <td className="py-3 px-2 text-sm text-[#2D2D2D]">{cliente.scadenzeAperte}</td>
                  <td className="py-3 px-2 text-sm text-[#6B7280]">{cliente.ultimoIncasso}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      cliente.rischio === 'Basso' ? 'bg-[#DCFCE7] text-[#16A34A]' :
                      cliente.rischio === 'Medio' ? 'bg-[#FEF3C7] text-[#D97706]' :
                      'bg-[#FEE2E2] text-[#DC2626]'
                    }`}>{cliente.rischio}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
          <h3 className="font-semibold text-[#2D2D2D]">Fornitori Prioritari</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5EAF2]">
                <th className="text-left py-3 px-2 text-xs font-medium text-[#9CA3AF]">Fornitore</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-[#9CA3AF]">Debito</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-[#9CA3AF]">Scadenze</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-[#9CA3AF]">Ultimo Pagamento</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-[#9CA3AF]">Priorità</th>
              </tr>
            </thead>
            <tbody>
              {fornitori.map((fornitore, idx) => (
                <tr key={idx} className="border-b border-[#E5EAF2] hover:bg-[#F7F9FC]">
                  <td className="py-3 px-2 text-sm font-medium text-[#2D2D2D]">{fornitore.nome}</td>
                  <td className="py-3 px-2 text-sm font-bold text-[#EF4444]">{fornitore.debito}</td>
                  <td className="py-3 px-2 text-sm text-[#2D2D2D]">{fornitore.scadenzeAperte}</td>
                  <td className="py-3 px-2 text-sm text-[#6B7280]">{fornitore.ultimoPagamento}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      fornitore.priorita === 'Alta' ? 'bg-[#FEE2E2] text-[#DC2626]' :
                      fornitore.priorita === 'Media' ? 'bg-[#FEF3C7] text-[#D97706]' :
                      'bg-[#DBEAFE] text-[#3B82F6]'
                    }`}>{fornitore.priorita}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
