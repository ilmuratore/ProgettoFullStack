import type { ReactNode } from 'react';
import { Filter, X } from 'lucide-react';

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function FilterButton({ label, active, onClick }: FilterButtonProps) {
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

interface FilterPanelProps {
  children: ReactNode;
  open: boolean;
  activeFiltersCount: number;
  onToggleOpen: () => void;
  onReset: () => void;
  filterGroups: ReactNode;
}

export function FilterPanel({ children, open, activeFiltersCount, onToggleOpen, onReset, filterGroups }: FilterPanelProps) {
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
            <div className="space-y-4 flex-1">{filterGroups}</div>

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
