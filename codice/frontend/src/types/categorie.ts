export interface Categoria {
  id: number;
  nome: string;
  categoria_padre_id: number | null;
  categoria_padre_nome: string | null;
  prodotti_count: number;
  prodotti_attivi_count?: number;
  prodotti_disattivi_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CategoriaCreateRequest {
  nome: string;
  categoria_padre_id?: number | null;
}

export interface CategoriaUpdateRequest {
  nome?: string;
  categoria_padre_id?: number | null;
}
