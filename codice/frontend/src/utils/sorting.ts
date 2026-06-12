export type SortDirection = 'asc' | 'desc';

export interface SortConfig<K extends string> {
  key: K;
  direction: SortDirection;
}

export const compareText = (left: string, right: string) =>
  left.localeCompare(right, 'it', { sensitivity: 'base', numeric: true });

export const compareNumber = (left: number | null | undefined, right: number | null | undefined) =>
  Number(left ?? 0) - Number(right ?? 0);

export const compareDate = (left: string | null | undefined, right: string | null | undefined) =>
  new Date(left ?? 0).getTime() - new Date(right ?? 0).getTime();

export const compareBoolean = (left: boolean | null | undefined, right: boolean | null | undefined) =>
  Number(!!left) - Number(!!right);

export const toggleSort = <K extends string>(prev: SortConfig<K> | null, key: K): SortConfig<K> => {
  if (prev?.key !== key) {
    return { key, direction: 'asc' };
  }
  return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
};

export const applySort = <T, K extends string>(
  items: T[],
  sort: SortConfig<K> | null,
  compare: (left: T, right: T, key: K) => number
): T[] => {
  if (!sort) return items;
  return [...items].sort((left, right) => {
    const result = compare(left, right, sort.key);
    return sort.direction === 'asc' ? result : -result;
  });
};
