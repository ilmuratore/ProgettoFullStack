export interface ProdottoListino {
  id: number;
  sku: string;
  nome: string;
  prezzo: number;
  data_agg_prezzo: string;
}

export interface Prodotto {
  id: number;
  sku: string;
  nome: string;
  descrizione: string | null;
  categoria_id: number | null;
  categoria_nome: string | null;
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
  prezzo: number;
  categoria_id?: number | null;
}

export interface ProdottoUpdateRequest {
  nome?: string;
  sku?: string;
  prezzo?: number;
  // null non è supportato via COALESCE nel backend attuale:
  // ometti il campo per mantere la categoria esistente,
  // invia un numero per cambiarla.
  categoria_id?: number;
}
