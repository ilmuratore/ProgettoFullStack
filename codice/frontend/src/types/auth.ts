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

export interface UtenteAPI {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo_id: number;
  ruolo_nome: string;
  created_at?: string;
  updated_at?: string;
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
