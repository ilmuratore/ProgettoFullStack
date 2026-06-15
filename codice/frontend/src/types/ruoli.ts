export type Role =
  | 'Admin'
  | 'Dev'
  | 'Supporto'
  | 'Resp. Azienda'
  | 'Resp. HR'
  | 'Resp. Vendite'
  | 'Resp. Acquisti'
  | 'Resp. Magazzino'
  | 'Operatore'
  | 'Corriere';

export interface Ruolo {
  id: number;
  nome: Role | string;
  descrizione?: string | null;
  created_at?: string;
  updated_at?: string;
}
