import type { Categoria } from '../../../types/categorie';

export function filterCategorieTree(categorie: Categoria[], query: string): Categoria[] {
  const q = query.trim().toLowerCase();

  if (!q) return categorie;

  const matches = (c: Categoria) => c.nome.toLowerCase().includes(q);

  const padriDaTenere = new Set<number>();
  const sottoDaTenere = new Set<number>();

  const padreMatcha = new Map<number, boolean>();
  for (const c of categorie) {
    if (c.categoria_padre_id === null) {
      padreMatcha.set(c.id, matches(c));
      if (matches(c)) padriDaTenere.add(c.id);
    }
  }

  for (const c of categorie) {
    if (c.categoria_padre_id === null) continue; 

    const ilPadreMatcha = padreMatcha.get(c.categoria_padre_id) ?? false;

    if (ilPadreMatcha) {
      sottoDaTenere.add(c.id);
    } else if (matches(c)) {
      sottoDaTenere.add(c.id);
      padriDaTenere.add(c.categoria_padre_id);
    }
  }

  return categorie.filter((c) =>
    c.categoria_padre_id === null
      ? padriDaTenere.has(c.id)
      : sottoDaTenere.has(c.id)
  );
}

export interface CategoriaSelectOption {
  id: number;
  label: string;   
  livello: number; 
  nome: string;    
}

export function flattenCategorieForSelect(categorie: Categoria[]): CategoriaSelectOption[] {
  const radici = categorie
    .filter((c) => c.categoria_padre_id === null)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const result: CategoriaSelectOption[] = [];

  for (const padre of radici) {
    result.push({ id: padre.id, label: padre.nome, livello: 0, nome: padre.nome });

    const figli = categorie
      .filter((c) => c.categoria_padre_id === padre.id)
      .sort((a, b) => a.nome.localeCompare(b.nome));

    for (const figlio of figli) {
      result.push({
        id: figlio.id,
        label: `\u00A0\u00A0\u00A0\u00A0↳ ${figlio.nome}`, 
        livello: 1,
        nome: figlio.nome,
      });
    }
  }

  return result;
}