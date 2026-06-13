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

export interface DestinazioneCliente {
  id: number;
  cliente_id: number;
  etichetta: string | null;
  indirizzo: string | null;
  cap: string | null;
  citta: string | null;
  provincia: string | null;
  paese: string | null;
  predefinita: boolean;
  created_at: string;
  updated_at: string;
}

export interface DestinazioneCreateRequest {
  etichetta?: string;
  indirizzo?: string;
  cap?: string;
  citta?: string;
  provincia?: string;
  paese?: string;
  predefinita?: boolean;
}

export interface DestinazioneUpdateRequest {
  etichetta?: string;
  indirizzo?: string;
  cap?: string;
  citta?: string;
  provincia?: string;
  paese?: string;
  predefinita?: boolean;
}

export interface ClienteCreateRequest {
  ragione_sociale: string;
  piva_cf: string;
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
