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

export type MovimentoTipo =
  | "CARICO_ACQUISTO"
  | "SCARICO_VENDITA"
  | "SPOSTAMENTO"
  | "RETTIFICA_POSITIVA"
  | "RETTIFICA_NEGATIVA"
  | "RESO";


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

// ===============================
// M07 — Giacenze
// ===============================
export interface Giacenza {
  id: number;
  prodotto_id: number;
  sku: string;
  prodotto: string;
  categoria?: string | null;
  ubicazione_id: number;
  magazzino: string;
  ubicazione: string;
  quantita: number;
  scorta_minima: number;
  sotto_scorta: boolean;
  ultimo_movimento?: string | null;
}


// ===============================
// M07 — Movimenti Stock
// ===============================
export interface MovimentoStock {
  id: number;
  prodotto_id: number;
  sku: string;
  prodotto: string;
  ubicazione_id: number;
  ubicazione: string;
  quantita: number;
  tipo: MovimentoTipo;
  riferimento?: string | null;
  note?: string | null;
  created_at: string;
  utente?: string | null; // <— aggiunto magari per il futuro riferimento utente al movimento
}

// Payload per POST /movimenti-stock
export interface MovimentoStockCreateRequest {
  prodotto_id: number;
  quantita: number;
  movimento_tipo: string;

  ubicazione_id?: number;

  ubicazione_da_id?: number;
  ubicazione_a_id?: number;

  riferimento?: string | null;
  note?: string | null;
}

