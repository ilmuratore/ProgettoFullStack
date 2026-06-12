import { TrendingUp, TrendingDown, Star } from 'lucide-react';

export interface TopClienteItem {
  nome: string;
  ordiniTotali: number;
  valoreOrdini: string;
  ultimoOrdine: string;
  destinazioni: number;
  performance: number;
}

interface TopClientiProps {
  clienti: TopClienteItem[];
}

export function TopClienti({ clienti }: TopClientiProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="font-semibold text-[#2D2D2D]">Top Clienti</h3>
        </div>
        <span className="text-xs text-[#9CA3AF]">Periodo: ultimi 12 mesi</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              <th className="text-left py-3 px-3 text-xs font-medium text-[#6B7280]">#</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#6B7280]">Cliente</th>
              <th className="text-right py-3 px-3 text-xs font-medium text-[#6B7280]">Ordini Totali</th>
              <th className="text-right py-3 px-3 text-xs font-medium text-[#6B7280]">Valore Ordini</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#6B7280]">Ultimo Ordine</th>
              <th className="text-right py-3 px-3 text-xs font-medium text-[#6B7280]">Destinazioni</th>
              <th className="text-left py-3 px-3 text-xs font-medium text-[#6B7280]">Performance</th>
            </tr>
          </thead>
          <tbody>
            {clienti.map((c, i) => (
              <tr key={`${c.nome}-${i}`} className="border-b border-[#F3F4F6] hover:bg-[#F7F9FC] transition-colors group cursor-pointer">
                <td className="py-3.5 px-3">
                  <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                    i === 0 ? 'bg-[#FEF3C7] text-[#F59E0B]' :
                    i === 1 ? 'bg-[#F3F4F6] text-[#6B7280]' :
                    i === 2 ? 'bg-[#FEF3C7] text-[#D97706]' :
                    'text-[#9CA3AF]'
                  }`}>
                    {i + 1}
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <span className="text-sm font-medium text-[#2D2D2D]">{c.nome}</span>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <span className="text-sm font-semibold text-[#2D2D2D]">{c.ordiniTotali}</span>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <span className="text-sm font-semibold text-[#17E88F]">{c.valoreOrdini}</span>
                </td>
                <td className="py-3.5 px-3">
                  <span className="text-sm text-[#6B7280]">{c.ultimoOrdine}</span>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <span className="inline-flex items-center justify-center w-7 h-7 bg-[#EDE9FE] text-[#8B5CF6] rounded-lg text-xs font-semibold">{c.destinazioni}</span>
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#F3F4F6] rounded-full h-1.5 w-24">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-[#17E88F] to-[#0FA67A]" style={{ width: `${c.performance}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-[#17E88F]">{c.performance}%</span>
                    {c.performance >= 93
                      ? <TrendingUp className="w-3 h-3 text-[#22C55E]" />
                      : <TrendingDown className="w-3 h-3 text-[#F59E0B]" />
                    }
                  </div>
                </td>
              </tr>
            ))}
            {clienti.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-[#6B7280]">Nessun dato clienti.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
