import type { ReactNode } from 'react';
import { Filter, X } from 'lucide-react';

export type ProductSort =
  | 'alfabetico'
  | 'prezzo_crescente'
  | 'prezzo_decrescente'
  | 'data_inserimento_recente'
  | 'data_inserimento_vecchio';

export type ProductStatusFilter = 'tutti' | 'attivi' | 'disattivati';

export interface ProductFiltersState {
  ordinamento: ProductSort;
  stato: ProductStatusFilter;
}

export const EMPTY_PRODUCT_FILTERS: ProductFiltersState = {
  ordinamento: 'alfabetico',
  stato: 'tutti',
};

interface ProductsFilterProps {
  children: ReactNode;
  open: boolean;
  filters: ProductFiltersState;
  activeFiltersCount: number;
  onToggleOpen: () => void;
  onChange: (filters: ProductFiltersState) => void;
  onReset: () => void;
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm border transition-all ${
        active
          ? 'bg-[#ECFDF5] border-[#17E88F]/30 text-[#0FA67A] font-medium'
          : 'bg-white border-[#E5EAF2] text-[#6B7280] hover:bg-[#F7F9FC]'
      }`}
    >
      {label}
    </button>
  );
}

export function ProductsFilter({
  children,
  open,
  filters,
  activeFiltersCount,
  onToggleOpen,
  onChange,
  onReset,
}: ProductsFilterProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">{children}</div>
        <button
          type="button"
          onClick={onToggleOpen}
          className={`px-4 py-2 border rounded-xl transition-all flex items-center gap-2 ${
            open || activeFiltersCount > 0
              ? 'bg-[#ECFDF5] border-[#17E88F]/30 text-[#0FA67A]'
              : 'bg-[#F7F9FC] border-[#E5EAF2] text-[#6B7280] hover:bg-white'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtri
          {activeFiltersCount > 0 && (
            <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#17E88F] text-white text-xs font-medium flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="bg-[#F7F9FC] border border-[#E5EAF2] rounded-2xl p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4 flex-1">
              <div>
                <p className="text-sm font-medium text-[#2D2D2D] mb-2">Ordinamento</p>
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    label="Ordine alfabetico"
                    active={filters.ordinamento === 'alfabetico'}
                    onClick={() => onChange({ ...filters, ordinamento: 'alfabetico' })}
                  />
                  <FilterButton
                    label="Prezzo crescente"
                    active={filters.ordinamento === 'prezzo_crescente'}
                    onClick={() => onChange({ ...filters, ordinamento: 'prezzo_crescente' })}
                  />
                  <FilterButton
                    label="Prezzo decrescente"
                    active={filters.ordinamento === 'prezzo_decrescente'}
                    onClick={() => onChange({ ...filters, ordinamento: 'prezzo_decrescente' })}
                  />
                  <FilterButton
                    label="Data inserimento piu recente"
                    active={filters.ordinamento === 'data_inserimento_recente'}
                    onClick={() => onChange({ ...filters, ordinamento: 'data_inserimento_recente' })}
                  />
                  <FilterButton
                    label="Data inserimento piu vecchio"
                    active={filters.ordinamento === 'data_inserimento_vecchio'}
                    onClick={() => onChange({ ...filters, ordinamento: 'data_inserimento_vecchio' })}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-[#2D2D2D] mb-2">Stato prodotto</p>
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    label="Tutti"
                    active={filters.stato === 'tutti'}
                    onClick={() => onChange({ ...filters, stato: 'tutti' })}
                  />
                  <FilterButton
                    label="Prodotti attivi"
                    active={filters.stato === 'attivi'}
                    onClick={() => onChange({ ...filters, stato: 'attivi' })}
                  />
                  <FilterButton
                    label="Prodotti disattivati"
                    active={filters.stato === 'disattivati'}
                    onClick={() => onChange({ ...filters, stato: 'disattivati' })}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="px-3 py-2 text-sm text-[#6B7280] hover:text-[#2D2D2D] transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
