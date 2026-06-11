import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { movimentiStockApi } from '../../api/movimentiStockApi';
import type { MovimentoStock, MovimentoTipo } from '../../types/magazzino';

const TIPO_CONFIG: Record<MovimentoTipo, { label: string; badge: string; sign: '+' | '-' | '' }> = {
  CARICO_ACQUISTO:    { label: 'Carico',       badge: 'bg-[#DCFCE7] text-[#22C55E]', sign: '+' },
  SCARICO_VENDITA:    { label: 'Scarico',      badge: 'bg-[#FEE2E2] text-[#EF4444]', sign: '-' },
  SPOSTAMENTO:        { label: 'Spostamento',  badge: 'bg-[#DBEAFE] text-[#3B82F6]', sign: '' },
  RETTIFICA_POSITIVA: { label: 'Rettifica +',  badge: 'bg-[#FEF3C7] text-[#F59E0B]', sign: '+' },
  RETTIFICA_NEGATIVA: { label: 'Rettifica -',  badge: 'bg-[#FEF3C7] text-[#F59E0B]', sign: '-' },
  RESO:               { label: 'Reso',         badge: 'bg-[#DCFCE7] text-[#22C55E]', sign: '+' },
};

const formatDataOra = (iso: string) =>
  new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const SkeletonRows = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="border-b border-[#E5EAF2]">
        {Array.from({ length: 6 }).map((_, j) => (
          <td key={j} className="py-3 px-4">
            <div className="h-4 bg-[#E5EAF2] rounded animate-pulse" style={{ width: j === 0 ? '60%' : '45%' }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export function ActivityTable() {
  const [movimenti, setMovimenti] = useState<MovimentoStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    movimentiStockApi
      .list()
      .then((data) => setMovimenti(data.slice(0, 20)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const query = search.trim().toLowerCase();
  const filtered = movimenti.filter((m) =>
    query === '' ||
    m.prodotto.toLowerCase().includes(query) ||
    m.sku.toLowerCase().includes(query)
  );

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[#2D2D2D]">Ultimi Movimenti di Magazzino</h3>
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca movimento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 h-9 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Prodotto</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Codice SKU</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Tipo Movimento</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Quantità</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Operatore</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Data e Ora</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <SkeletonRows /> : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#6B7280] text-sm">
                  {search ? 'Nessun movimento corrisponde alla ricerca' : 'Nessun movimento di magazzino registrato'}
                </td>
              </tr>
            ) : filtered.map((movement, index) => {
              const cfg = TIPO_CONFIG[movement.tipo];
              return (
                <tr
                  key={movement.id}
                  className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                  }`}
                >
                  <td className="py-3 px-4 text-sm text-[#2D2D2D]">{movement.prodotto}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{movement.sku}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{cfg.sign}{movement.quantita}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{movement.utente ?? '—'}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{formatDataOra(movement.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
