import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { SortConfig } from '../../utils/sorting';

interface SortableHeaderProps<K extends string> {
  label: string;
  sortKey: K;
  sort: SortConfig<K> | null;
  align?: 'left' | 'right' | 'center';
  onSort: (key: K) => void;
  thClassName?: string;
  iconClassName?: string;
}

export function SortableHeader<K extends string>({
  label,
  sortKey,
  sort,
  align = 'left',
  onSort,
  thClassName,
  iconClassName,
}: SortableHeaderProps<K>) {
  const active = sort?.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown;
  const alignText = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  const alignJustify = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <th
      className={thClassName ?? `py-3 px-4 text-sm font-medium text-[#6B7280] ${alignText}`}
      aria-sort={!active ? 'none' : sort.direction === 'asc' ? 'ascending' : 'descending'}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1.5 hover:text-[#2D2D2D] transition-colors w-full ${alignJustify}`}
      >
        <span>{label}</span>
        <Icon className={iconClassName ?? `w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-[#2D2D2D]' : 'text-[#9CA3AF]'}`} />
      </button>
    </th>
  );
}
