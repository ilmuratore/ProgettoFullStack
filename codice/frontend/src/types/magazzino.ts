export interface Magazzino {
  id: number;
  codice: string;
  nome: string;
  indirizzo: string | null;
  cap: string | null;
  citta: string | null;
  provincia: string | null;
  paese: string | null;
  attivo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MagazzinoConUbicazioni extends Magazzino {
  ubicazioni: Ubicazione[];
}

export interface MagazzinoCreateRequest {
  codice: string;
  nome: string;
  indirizzo?: string;
  cap?: string;
  citta?: string;
  provincia?: string;
  paese?: string;
}

export interface MagazzinoUpdateRequest {
  nome?: string;
  indirizzo?: string;
  cap?: string;
  citta?: string;
  provincia?: string;
  paese?: string;
}

export interface Ubicazione {
  id: number;
  magazzino_id: number;
  corsia: number;
  scaffale: number;
  codice: string;
  codice_composto: string;
  attivo: boolean;
  temperatura_controllata: boolean;
  totale_giacenza?: number;
  created_at: string;
  updated_at: string;
}

export interface UbicazioneCreateRequest {
  corsia: number;
  scaffale: number;
  temperatura_controllata?: boolean;
}

export interface UbicazioneUpdateTemperaturaRequest {
  temperatura_controllata: boolean;
}