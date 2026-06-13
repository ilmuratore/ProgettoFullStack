import { ChevronRight, MoreVertical, Edit, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import type { Categoria } from '../../../types/categorie';
import { filterCategorieTree } from '../utils/categorieTree';

interface CategoriesTabProps {
  categorie: Categoria[];
  loading: boolean;
  search: string;
  canWriteProdotti: boolean;
  canDeleteProdotti: boolean;
  onSearchChange: (value: string) => void;
  onAddSubcategory: (parentId: number) => void;
  onEdit: (item: Categoria) => void;
  onDelete: (id: number) => void;
}

function CategoryActions({
  item,
  canWriteProdotti,
  canDeleteProdotti,
  onEdit,
  onDelete,
}: {
  item: Categoria;
  canWriteProdotti: boolean;
  canDeleteProdotti: boolean;
  onEdit: (item: Categoria) => void;
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

export function CategoriesTab({
  categorie,
  loading,
  search,
  canWriteProdotti,
  canDeleteProdotti,
  onSearchChange,
  onAddSubcategory,
  onEdit,
  onDelete,
}: CategoriesTabProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const formatProdottiLabel = (totale: number, disattivi: number) => {
    const base = `${totale} prodott${totale !== 1 ? 'i' : 'o'} total${totale !== 1 ? 'i' : 'e'}`;
    if (disattivi <= 0) return base;
    return `${base} (${disattivi} disattivat${disattivi !== 1 ? 'i' : 'o'})`;
  };

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredCategorie = filterCategorieTree(categorie, search);
  const categorieRadice = filteredCategorie.filter((c) => c.categoria_padre_id === null);

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca categorie..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all"
          />
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#F7F9FC] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : categorieRadice.length === 0 ? (
        <p className="py-12 text-center text-[#6B7280] text-sm">
          {search ? 'Nessuna categoria corrisponde alla ricerca' : 'Nessuna categoria. Clicca "Nuova Categoria" per iniziare.'}
        </p>
      ) : (
        <div className="space-y-4">
          {categorieRadice.map((cat) => {
            const subcategories = filteredCategorie.filter((c) => c.categoria_padre_id === cat.id);
            const totalProdotti = cat.prodotti_count + subcategories.reduce((s, sub) => s + sub.prodotti_count, 0);
            const totalProdottiDisattivi = cat.prodotti_disattivi_count + subcategories.reduce((s, sub) => s + sub.prodotti_disattivi_count, 0);
            const isExpanded = search.trim() !== '' || expandedIds.has(cat.id);

            return (
              <div key={cat.id} className="border border-[#E5EAF2] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-[#F7F9FC]">
                  <button
                    onClick={() => toggleExpanded(cat.id)}
                    disabled={subcategories.length === 0}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <ChevronRight
                      className={`w-5 h-5 text-[#6B7280] transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''} ${subcategories.length === 0 ? 'opacity-30' : ''}`}
                    />
                    <div>
                      <h3 className="font-semibold text-[#2D2D2D]">{cat.nome}</h3>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {formatProdottiLabel(totalProdotti, totalProdottiDisattivi)}
                        {subcategories.length > 0 && ` · ${subcategories.length} sottocategor${subcategories.length !== 1 ? 'ie' : 'ia'}`}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    {canWriteProdotti && (
                      <button
                        onClick={() => onAddSubcategory(cat.id)}
                        className="px-3 py-1.5 text-xs bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all"
                      >
                        + Sottocategoria
                      </button>
                    )}
                    <CategoryActions
                      item={cat}
                      canWriteProdotti={canWriteProdotti}
                      canDeleteProdotti={canDeleteProdotti}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                </div>
                {isExpanded && subcategories.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 px-6 border-t border-[#E5EAF2] hover:bg-[#F7F9FC] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-[#E5EAF2] rounded" />
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D]">{sub.nome}</p>
                        <p className="text-xs text-[#6B7280]">{formatProdottiLabel(sub.prodotti_count, sub.prodotti_disattivi_count)}</p>
                      </div>
                    </div>
                    <CategoryActions
                      item={sub}
                      canWriteProdotti={canWriteProdotti}
                      canDeleteProdotti={canDeleteProdotti}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
      <div className="flex items-center pt-4 border-t border-[#E5EAF2]">
        <p className="text-sm text-[#6B7280]">
          <span className="font-medium text-[#2D2D2D]">{categorie.filter((c) => c.categoria_padre_id === null).length}</span> categorie radice ·{' '}
          <span className="font-medium text-[#2D2D2D]">{categorie.filter((c) => c.categoria_padre_id !== null).length}</span> sottocategorie
        </p>
      </div>
    </>
  );
}
