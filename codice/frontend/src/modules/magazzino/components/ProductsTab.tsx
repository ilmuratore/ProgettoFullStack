import { Filter, MoreVertical, Edit, Trash2, Eye, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import type { ProdottoListino } from '../../../types/prodotti';

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
  const filteredProdotti = prodotti.filter((p) => {
    const q = search.toLowerCase();
    return p.nome.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca prodotti per nome o SKU..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all"
          />
        </div>
        <button className="px-4 py-2 bg-[#F7F9FC] border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-white transition-all flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filtri
        </button>
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
                {search ? 'Nessun prodotto corrisponde alla ricerca' : 'Nessun prodotto. Clicca "Nuovo Prodotto" per iniziare.'}
              </td></tr>
              : filteredProdotti.map((p, i) => (
                <tr key={p.id} className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}`}>
                  <td className="py-3 px-4 font-medium text-[#2D2D2D]">{p.nome}</td>
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
