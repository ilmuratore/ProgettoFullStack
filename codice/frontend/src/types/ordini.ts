export type StatoOrdineVendita = 'BOZZA' | 'CONFERMATO' | 'SPEDITO' | 'ANNULLATO';

export type StatoPickingVendita = 'NON_AVVIATO' | 'IN_PICKING' | 'PICKING_COMPLETATO';

export interface OrdineVendita {
  id: number;
  cliente_id: number;
  destinazione_id: number;
  cliente?: string | null;
  destinazione?: string | null;
  utente?: string | null;
  data_ordine: string;
  data_consegna_richiesta: string | null;
  importo_totale: number | null;
  stato: StatoOrdineVendita;
  stato_picking: StatoPickingVendita;
  utente_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface RigaOrdineVendita {
  id: number;
  ordine_id: number;
  prodotto_id: number;
  quantita: number;
  prezzo_unitario: number;
  sku?: string | null;
  prodotto?: string | null;
}

export interface RigaOrdineVenditaCreateRequest {
  prodotto_id: number;
  quantita: number;
}

export interface OrdineVenditaCreateRequest {
  cliente_id: number;
  destinazione_id: number;
  data_consegna_richiesta?: string;
  righe: RigaOrdineVenditaCreateRequest[];
}

export interface DisponibilitaOrdineVendita {
  prodotto_id: number;
  totale: number;
  impegnato: number;
  disponibile: number;
}

export interface OrdineVenditaDettaglio {
  ordine: OrdineVendita;
  righe: RigaOrdineVendita[];
}
