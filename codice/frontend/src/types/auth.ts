export type Role =
  | 'Admin'
  | 'Responsabile Acquisti'
  | 'Responsabile Magazzino'
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
