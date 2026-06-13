export interface Fornitore {
  id: number;
  ragione_sociale: string;
  piva: string | null;
  indirizzo: string | null;
  email: string | null;
  telefono: string | null;
  lead_time_giorni: number | null;
  source: 'manual' | 'ecosystem';
  sito_web: string | null;
  descrizione_aziendale: string | null;
  attivo: boolean;
  created_at: string;
  updated_at: string;
}

export interface FornitoreCreateRequest {
  ragione_sociale: string;
  piva: string;
  indirizzo?: string;
  email?: string;
  telefono?: string;
  sito_web?: string;
  descrizione_aziendale?: string;
}

export interface FornitoreUpdateRequest {
  ragione_sociale?: string;
  piva?: string;
  indirizzo?: string;
  email?: string;
  telefono?: string;
  sito_web?: string;
  descrizione_aziendale?: string;
  attivo?: boolean;
}

export interface ContattoFornitore {
  id: number;
  fornitore_id: number;
  nome: string;
  ruolo: string | null;
  email: string | null;
  telefono: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContattoFornitoreDettaglio extends ContattoFornitore {
  fornitore: string;
}

export interface ContattoFornitoreCreateRequest {
  nome: string;
  ruolo?: string;
  email?: string;
  telefono?: string;
}

export interface ContattoFornitoreUpdateRequest {
  nome?: string;
  ruolo?: string;
  email?: string;
  telefono?: string;
}
