export interface Corriere {
  id: number;
  codice: string;
  nome: string;
  telefono: string | null;
  email: string | null;
  attivo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CorriereCreateRequest {
  codice: string;
  nome: string;
  telefono?: string;
  email?: string;
  attivo?: boolean;
}

export interface CorriereUpdateRequest {
  codice?: string;
  nome?: string;
  telefono?: string;
  email?: string;
  attivo?: boolean;
}

export interface Dipendente {
  id: number;
  nome: string;
  cognome: string;
  codice_fiscale: string;
  ruolo_operativo: string | null;
  data_assunzione: string | null;
  utente_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface DipendenteCreateRequest {
  nome: string;
  cognome: string;
  codice_fiscale: string;
  ruolo_operativo?: string;
  data_assunzione?: string;
  utente_id?: number | null;
}

export interface DipendenteUpdateRequest {
  nome?: string;
  cognome?: string;
  codice_fiscale?: string;
  ruolo_operativo?: string;
  data_assunzione?: string;
  utente_id?: number | null;
}