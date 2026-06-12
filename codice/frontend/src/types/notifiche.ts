export type NotifType =
  | 'SOTTO_SCORTA'
  | 'RICEZIONE_PARZIALE'
  | 'PO_IN_RITARDO'
  | 'CAMBIO_STATO_SPEDIZIONE'
  | 'RICHIESTA_ACCETTATA'
  | 'RICHIESTA_RIFIUTATA'
  | 'MESSAGGIO_FORNITORE'
  | 'ALTRO';

export interface Notifica {
  id: number;
  utente_id: number;
  tipo: NotifType;
  messaggio: string;
  letto: boolean;
  riferimento_tipo?: string | null;
  riferimento_id?: number | null;
  created_at: string;
}
