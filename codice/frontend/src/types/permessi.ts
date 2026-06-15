export interface Permesso {
  id?: number;
  codice: string;
  descrizione?: string | null;
}

export interface RuoloPermessiMatrixRow {
  codice: string;
  descrizione: string;
  admin: boolean;
  respAcq: boolean;
  respMag: boolean;
  operatore: boolean;
  corriere: boolean;
}
