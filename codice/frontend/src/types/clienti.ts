export interface Cliente {
  id: number;
  ragione_sociale: string;
  piva_cf: string | null;
  email: string | null;
  telefono: string | null;
  source: 'manual' | 'ecosystem';
  attivo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClienteCreateRequest {
  ragione_sociale: string;
  piva_cf?: string;
  email?: string;
  telefono?: string;
}

export interface ClienteUpdateRequest {
  ragione_sociale?: string;
  piva_cf?: string;
  email?: string;
  telefono?: string;
  attivo?: boolean;
}