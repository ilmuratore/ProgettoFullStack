export interface ProdottoListino {
  id: number;
  sku: string;
  nome: string;
  prezzo: number;
  data_agg_prezzo: string;
  attivo: boolean;
  created_at: string;
}

export interface Prodotto {
  id: number;
  sku: string;
  nome: string;
  descrizione: string | null;
  categoria_id: number | null;
  categoria: string | null;
  categoria_nome?: string | null;
  unita_misura: string | null;
  peso_kg: number | null;
  scorta_minima: number;
  prezzo: number;
  data_agg_prezzo: string;
  attivo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProdottoCreateRequest {
  nome: string;
  sku: string;
  descrizione?: string | null;
  categoria_id?: number | null;
  unita_misura?: string | null;
  peso_kg?: number | null;
  scorta_minima?: number;
  prezzo: number;
  attivo?: boolean;
}

export interface ProdottoUpdateRequest {
  nome?: string;
  sku?: string;
  descrizione?: string | null;
  categoria_id?: number | null;
  unita_misura?: string | null;
  peso_kg?: number | null;
  scorta_minima?: number;
  prezzo?: number;
  attivo?: boolean;
}
