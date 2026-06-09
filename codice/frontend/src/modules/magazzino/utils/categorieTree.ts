import type { Categoria } from '../../../types/categorie';

// Filtra le categorie cercando sia nei padri che nelle sottocategorie.
export function filterCategorieTree(categorie: Categoria[], query: string): Categoria[] {
  const q = query.trim().toLowerCase();

  // Se il campo di ricerca è vuoto, restituisco tutto invariato.
  if (!q) return categorie;

  // Funzione che dice se una categoria contiene il testo cercato.
  const matches = (c: Categoria) => c.nome.toLowerCase().includes(q);

  // Qui dentro raccolgo gli id dei padri e delle sottocategorie da mostrare.
  const padriDaTenere = new Set<number>();
  const sottoDaTenere = new Set<number>();

  // 1) Trovo prima quali PADRI corrispondono direttamente al testo.
  const padreMatcha = new Map<number, boolean>();
  for (const c of categorie) {
    if (c.categoria_padre_id === null) {
      padreMatcha.set(c.id, matches(c));
      if (matches(c)) padriDaTenere.add(c.id);
    }
  }

  // 2) Scorro le SOTTOCATEGORIE e decido cosa tenere.
  for (const c of categorie) {
    if (c.categoria_padre_id === null) continue; // i padri li ho già fatti sopra

    const ilPadreMatcha = padreMatcha.get(c.categoria_padre_id) ?? false;

    if (ilPadreMatcha) {
      // Il padre corrisponde → mostro tutte le sue sottocategorie.
      sottoDaTenere.add(c.id);
    } else if (matches(c)) {
      // Solo la sottocategoria corrisponde → mostro lei E il suo padre.
      sottoDaTenere.add(c.id);
      padriDaTenere.add(c.categoria_padre_id);
    }
  }

  // 3) Restituisco solo le categorie che ho deciso di tenere.
  return categorie.filter((c) =>
    c.categoria_padre_id === null
      ? padriDaTenere.has(c.id)
      : sottoDaTenere.has(c.id)
  );
}

// Etichetta + livello pronti per essere mostrati in una <select>.
export interface CategoriaSelectOption {
  id: number;
  label: string;   
  livello: number; 
  nome: string;    
}

// Mette le categorie in ordine: ogni padre seguito dalle sue sottocategorie.
export function flattenCategorieForSelect(categorie: Categoria[]): CategoriaSelectOption[] {
  // Prendo i padri (le radici) e li ordino per nome.
  const radici = categorie
    .filter((c) => c.categoria_padre_id === null)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const result: CategoriaSelectOption[] = [];

  for (const padre of radici) {
    // Aggiungo il padre alla lista.
    result.push({ id: padre.id, label: padre.nome, livello: 0, nome: padre.nome });

    // Trovo le sue sottocategorie, ordinate per nome, e le metto subito dopo.
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