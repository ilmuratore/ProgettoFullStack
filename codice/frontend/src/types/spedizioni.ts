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
