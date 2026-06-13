export type StatoSpedizione = 'IN_PREPARAZIONE' | 'SPEDITA' | 'CONSEGNATA' | 'PROBLEMA';

export interface Spedizione {
  id: number;
  ordine_id: number;
  cliente_id: number;
  cliente: string;
  destinazione_id: number;
  destinazione: string | null;
  corriere_id: number | null;
  corriere: string | null;
  codice_corriere?: string | null;
  stato: StatoSpedizione;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpedizioneCreateRequest {
  ordine_id: number;
  cliente_id: number;
  destinazione_id: number;
  corriere_id?: number;
  tracking_number?: string;
}


export interface SpedizioneTrackingUpdateRequest {
  tracking_number: string;
}

export interface Ddt {
  id: number;
  spedizione_id: number;
  ordine_id?: number;
  numero_ddt: string;
  data_ddt: string;
  trasportatore: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface DdtCreateRequest {
  numero_ddt: string;
  data_ddt?: string;
  trasportatore?: string;
  note?: string;
}

export interface DdtUpdateRequest {
  numero_ddt?: string;
  data_ddt?: string;
  trasportatore?: string;
  note?: string;
}
