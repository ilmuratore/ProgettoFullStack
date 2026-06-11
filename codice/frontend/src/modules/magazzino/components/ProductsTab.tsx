import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, Edit, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import type { ProdottoListino } from '../../../types/prodotti';
import { EMPTY_PRODUCT_FILTERS, ProductsFilter, type ProductFiltersState } from './ProductsFilter';

interface ProductsTabProps {
  prodotti: ProdottoListino[];
  loading: boolean;
  search: string;
  canWriteProdotti: boolean;
  onSearchChange: (value: string) => void;
  onView: (item: ProdottoListino) => void;
  onEdit: (item: ProdottoListino) => void;
}

type SortKey = 'nome' | 'sku' | 'prezzo' | 'data_agg_prezzo';
type SortDirection = 'asc' | 'desc';

type SortConfig = {
  key: SortKey;
  direction: SortDirection;
};

const formatPrezzo = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

const formatData = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

const compareText = (left: string, right: string) =>
  left.localeCompare(right, 'it', { sensitivity: 'base', numeric: true });

const compareProductsByKey = (left: ProdottoListino, right: ProdottoListino, key: SortKey) => {
  switch (key) {
    case 'nome':
      return compareText(left.nome ?? '', right.nome ?? '');
    case 'sku':
      return compareText(left.sku ?? '', right.sku ?? '');
    case 'prezzo':
      return Number(left.prezzo ?? 0) - Number(right.prezzo ?? 0);
    case 'data_agg_prezzo':
      return new Date(left.data_agg_prezzo ?? 0).getTime() - new Date(right.data_agg_prezzo ?? 0).getTime();
    default:
      return 0;
  }
};

const sortByProductFilter = (left: ProdottoListino, right: ProdottoListino, ordinamento: ProductFiltersState['ordinamento']) => {
  switch (ordinamento) {
    case 'prezzo_crescente':
      return Number(left.prezzo ?? 0) - Number(right.prezzo ?? 0);
    case 'prezzo_decrescente':
      return Number(right.prezzo ?? 0) - Number(left.prezzo ?? 0);
    case 'data_inserimento_recente':
      return new Date(right.created_at ?? 0).getTime() - new Date(left.created_at ?? 0).getTime();
    case 'data_inserimento_vecchio':
      return new Date(left.created_at ?? 0).getTime() - new Date(right.created_at ?? 0).getTime();
    case 'alfabetico':
    default:
      return compareText(left.nome ?? '', right.nome ?? '');
  }
};

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

function SortableHeader({
  label,
  sortKey,
  sort,
  align = 'left',
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortConfig | null;
  align?: 'left' | 'right';
  onSort: (key: SortKey) => void;
}) {
  const active = sort?.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown;

  return (
    <th
      className={`py-3 px-4 text-sm font-medium text-[#6B7280] ${align === 'right' ? 'text-right' : 'text-left'}`}
      aria-sort={!active ? 'none' : sort.direction === 'asc' ? 'ascending' : 'descending'}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1.5 hover:text-[#2D2D2D] transition-colors ${align === 'right' ? 'justify-end' : 'justify-start'}`}
      >
        <span>{label}</span>
        <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#2D2D2D]' : 'text-[#9CA3AF]'}`} />
      </button>
    </th>
  );
}

function ProductActions({
  item,
  canWriteProdotti,
  onEdit,
}: {
  item: ProdottoListino;
  canWriteProdotti: boolean;
  onEdit: (item: ProdottoListino) => void;
}) {
  if (!canWriteProdotti) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 hover:bg-[#F7F9FC] text-[#6B7280] rounded-lg transition-all">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">
          <Edit className="w-4 h-4 mr-2" />Modifica
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ProductsTab({
  prodotti,
  loading,
  search,
  canWriteProdotti,
  onSearchChange,
  onView,
  onEdit,
}: ProductsTabProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFiltersState>(EMPTY_PRODUCT_FILTERS);
  const [sort, setSort] = useState<SortConfig | null>(null);

  const activeFiltersCount = (filters.ordinamento !== 'alfabetico' ? 1 : 0) + (filters.stato !== 'tutti' ? 1 : 0);

  const handleSort = (key: SortKey) => {
    setSort((prev) => {
      if (prev?.key !== key) {
        return { key, direction: 'asc' };
      }

      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const handleFiltersChange = (nextFilters: ProductFiltersState) => {
    setFilters(nextFilters);

    if (nextFilters.ordinamento !== filters.ordinamento) {
      setSort(null);
    }
  };

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
      if (sort) {
        const result = compareProductsByKey(left, right, sort.key);
        return sort.direction === 'asc' ? result : -result;
      }

      return sortByProductFilter(left, right, filters.ordinamento);
    });

  const resetFilters = () => {
    setFilters(EMPTY_PRODUCT_FILTERS);
    setSort(null);
  };

  return (
    <>
      <div className="space-y-4">
        <ProductsFilter
          open={filtersOpen}
          filters={filters}
          activeFiltersCount={activeFiltersCount}
          onToggleOpen={() => setFiltersOpen(prev => !prev)}
          onChange={handleFiltersChange}
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
              <SortableHeader label="Nome Prodotto" sortKey="nome" sort={sort} onSort={handleSort} />
              <SortableHeader label="SKU" sortKey="sku" sort={sort} onSort={handleSort} />
              <SortableHeader label="Prezzo" sortKey="prezzo" sort={sort} onSort={handleSort} align="right" />
              <SortableHeader label="Agg. Prezzo" sortKey="data_agg_prezzo" sort={sort} onSort={handleSort} />
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
                <tr
                  key={p.id}
                  onClick={() => onView(p)}
                  className={`cursor-pointer border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}`}
                >
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
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <ProductActions
                      item={p}
                      canWriteProdotti={canWriteProdotti}
                      onEdit={onEdit}
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
