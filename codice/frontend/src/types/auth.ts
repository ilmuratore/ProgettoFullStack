export type Role =
  | 'Admin' | 'Responsabile Acquisti'
  | 'Responsabile Magazzino' | 'Operatore' | 'Corriere';

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