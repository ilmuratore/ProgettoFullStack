import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Eye, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import type { ProdottoListino } from '../../../types/prodotti';
import { EMPTY_PRODUCT_FILTERS, ProductsFilter, type ProductFiltersState } from './ProductsFilter';

interface ProductsTabProps {
  prodotti: ProdottoListino[];
  loading: boolean;
  search: string;
  canWriteProdotti: boolean;
  canDeleteProdotti: boolean;
  onSearchChange: (value: string) => void;
  onView: (item: ProdottoListino) => void;
  onEdit: (item: ProdottoListino) => void;
  onDelete: (id: number) => void;
}

const formatPrezzo = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

const formatData = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

const SkeletonRows = ({ cols }: { cols: number }) => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="border-b border-[#E5EAF2]">
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} className="py-3 px-4">
            <div className="h-4 bg-[#E5EAF2] rounded animate-pulse" style={{ width: j === 0 ? '60%' : '45%' }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

function ProductActions({
  item,
  canWriteProdotti,
  canDeleteProdotti,
  onView,
  onEdit,
  onDelete,
}: {
  item: ProdottoListino;
  canWriteProdotti: boolean;
  canDeleteProdotti: boolean;
  onView: (item: ProdottoListino) => void;
  onEdit: (item: ProdottoListino) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 hover:bg-[#F7F9FC] text-[#6B7280] rounded-lg transition-all">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => onView(item)} className="cursor-pointer">
          <Eye className="w-4 h-4 mr-2" />Visualizza
        </DropdownMenuItem>
        {canWriteProdotti && (
          <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">
            <Edit className="w-4 h-4 mr-2" />Modifica
          </DropdownMenuItem>
        )}
        {canDeleteProdotti && (
          <DropdownMenuItem onClick={() => onDelete(item.id)} className="cursor-pointer text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />Elimina
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ProductsTab({
  prodotti,
  loading,
  search,
  canWriteProdotti,
  canDeleteProdotti,
  onSearchChange,
  onView,
  onEdit,
  onDelete,
}: ProductsTabProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFiltersState>(EMPTY_PRODUCT_FILTERS);

  const activeFiltersCount = (filters.ordinamento !== 'alfabetico' ? 1 : 0) + (filters.stato !== 'tutti' ? 1 : 0);

  const filteredProdotti = prodotti
    .filter((prodotto) => {
      const query = search.trim().toLowerCase();
      const matchSearch =
        query === '' ||
        prodotto.nome.toLowerCase().includes(query) ||
        prodotto.sku.toLowerCase().includes(query);

      const matchStatus =
        filters.stato === 'tutti' ||
        (filters.stato === 'attivi' && prodotto.attivo) ||
        (filters.stato === 'disattivati' && !prodotto.attivo);

      return matchSearch && matchStatus;
    })
    .sort((left, right) => {
      switch (filters.ordinamento) {
        case 'prezzo_crescente':
          return left.prezzo - right.prezzo;
        case 'prezzo_decrescente':
          return right.prezzo - left.prezzo;
        case 'data_inserimento_recente':
          return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
        case 'data_inserimento_vecchio':
          return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
        case 'alfabetico':
        default:
          return left.nome.localeCompare(right.nome, 'it');
      }
    });

  const resetFilters = () => {
    setFilters(EMPTY_PRODUCT_FILTERS);
  };

  return (
    <>
      <div className="space-y-4">
        <ProductsFilter
          open={filtersOpen}
          filters={filters}
          activeFiltersCount={activeFiltersCount}
          onToggleOpen={() => setFiltersOpen(prev => !prev)}
          onChange={setFilters}
          onReset={resetFilters}
        >
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca prodotti per nome o SKU..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all"
            />
          </div>
        </ProductsFilter>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Nome Prodotto</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">SKU</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-[#6B7280]">Prezzo</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Agg. Prezzo</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <SkeletonRows cols={5} /> : filteredProdotti.length === 0
              ? <tr><td colSpan={5} className="py-12 text-center text-[#6B7280] text-sm">
                {search || activeFiltersCount > 0
                  ? 'Nessun prodotto corrisponde ai filtri impostati'
                  : 'Nessun prodotto. Clicca "Nuovo Prodotto" per iniziare.'}
              </td></tr>
              : filteredProdotti.map((p, i) => (
                <tr key={p.id} className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[#2D2D2D]">{p.nome}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium ${p.attivo ? 'bg-[#DCFCE7] text-[#22C55E]' : 'bg-[#FEE2E2] text-[#EF4444]'}`}>
                        {p.attivo ? 'Attivo' : 'Disattivato'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{p.sku}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-[#2D2D2D] text-right">{formatPrezzo(p.prezzo)}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{formatData(p.data_agg_prezzo)}</td>
                  <td className="py-3 px-4">
                    <ProductActions
                      item={p}
                      canWriteProdotti={canWriteProdotti}
                      canDeleteProdotti={canDeleteProdotti}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-[#E5EAF2]">
        <p className="text-sm text-[#6B7280]">
          Mostrando <span className="font-medium text-[#2D2D2D]">{loading ? '…' : filteredProdotti.length}</span> prodotti
        </p>
      </div>
    </>
  );
}
