// M08 — Ordini di Acquisto & Ricezioni

export type StatoOrdineAcquisto =
  | 'BOZZA'
  | 'INVIATO'
  | 'CONFERMATO'
  | 'IN_RICEZIONE'
  | 'COMPLETATO'
  | 'ANNULLATO';

export interface RigaPo {
  id: number;
  prodotto_id: number;
  prodotto?: string;
  sku?: string;
  quantita_ordinata: number;
  quantita_ricevuta: number;
  prezzo_unitario: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrdineAcquistoLista {
  id: number;
  fornitore_id: number;
  fornitore: string;
  stato: StatoOrdineAcquisto;
  data_prevista: string | null;
  importo_totale: number;
  note: string | null;
  utente_id: number | null;
  utente: string | null;
  created_at: string;
  updated_at: string;
  totale_calcolato: number;
  numero_righe: number;
  totale_ricevuto: number;
}

export interface OrdineTestata {
  id: number;
  fornitore_id: number;
  fornitore: string;
  stato: StatoOrdineAcquisto;
  data_prevista: string | null;
  importo_totale: number;
  note: string | null;
  utente_id: number | null;
  utente: string | null;
  created_at: string;
  updated_at: string;
}

export interface RicezioneTestata {
  id: number;
  data_ricezione: string;
  note: string | null;
  utente_id: number | null;
  utente: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrdineAcquistoDettaglio {
  ordine: OrdineTestata;
  righe: RigaPo[];
  ricezioni: RicezioneTestata[];
}

export interface RigaOrdineCreate {
  prodotto_id: number;
  quantita_ordinata: number;
  prezzo_unitario: number;
}

export interface OrdineAcquistoCreateRequest {
  fornitore_id: number;
  data_prevista?: string;
  note?: string;
  utente_id?: number;
  righe: RigaOrdineCreate[];
}

export interface OrdineAcquistoUpdateRequest {
  fornitore_id?: number;
  data_prevista?: string;
  importo_totale?: number;
  note?: string;
  utente_id?: number;
}

export interface OrdineAcquistoStatoRequest {
  stato: StatoOrdineAcquisto;
}

export interface RigaPoCreateRequest {
  prodotto_id: number;
  quantita_ordinata: number;
  prezzo_unitario: number;
}

// ─── Ricezioni ───

export interface RigaRicezione {
  id: number;
  ricezione_id: number;
  prodotto_id: number;
  sku: string;
  prodotto: string;
  quantita_ricevuta: number;
  ubicazione_id: number;
  ubicazione: string;
  magazzino: string;
  created_at?: string;
  updated_at?: string;
}

export interface Ricezione {
  id: number;
  ordine_acquisto_id: number;
  stato_ordine: StatoOrdineAcquisto;
  fornitore_id: number;
  fornitore: string;
  data_ricezione: string;
  note: string | null;
  utente_id: number | null;
  utente: string | null;
  created_at: string;
  updated_at: string;
}

export interface RigaRicezioneOrdineCreate {
  prodotto_id: number;
  quantita_ricevuta: number;
  ubicazione_id: number;
}

// POST /ordini-acquisto/ricezioni
export interface RicezioneOrdineCreateRequest {
  ordine_acquisto_id: number;
  data_ricezione?: string;
  note?: string;
  utente_id?: number;
  righe: RigaRicezioneOrdineCreate[];
}

// POST /ricezioni (sola testata)
export interface RicezioneCreateRequest {
  ordine_acquisto_id: number;
  data_ricezione: string;
  note?: string;
}

// POST /ricezioni/:id/righe
export interface RigaRicezioneCreateRequest {
  prodotto_id: number;
  quantita: number;
  ubicazione_id: number;
}
