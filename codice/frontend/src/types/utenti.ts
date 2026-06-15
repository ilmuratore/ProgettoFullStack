import type { Role } from './ruoli';

export interface UtenteDipendente {
  id: number;
  nome: string;
  cognome: string;
  codice_fiscale: string;
  ruolo_operativo: string | null;
}

export interface UtenteAPI {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo_id: number;
  ruolo?: string;
  ruolo_nome?: string;
  attivo?: boolean;
  dipendente?: UtenteDipendente | null;
  created_at?: string;
  updated_at?: string;
}

export interface UtenteUpdateRequest {
  nome?: string;
  cognome?: string;
  email?: string;
  ruolo_id?: number;
  attivo?: boolean;
  dipendente_id?: number | null;
}

export interface UiUser {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  password: string;
  ruolo: Role;
  avatar: string;
  avatarBg: string;
}
