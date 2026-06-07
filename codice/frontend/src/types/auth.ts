// ─── Tipi auth condivisi tra store, UI e componenti ──────────────────────────
// Fonte autoritativa: openapi.yaml /auth/login response + authStore.ts

export type Role =
  | 'Admin'
  | 'Responsabile Acquisti'
  | 'Responsabile Magazzino'
  | 'Operatore'
  | 'Corriere';

/**
 * UtenteAPI — formato restituito dal backend (ruolo_id + ruolo_nome).
 * Usato in authStore e authApi.
 */
export interface UtenteAPI {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo_id: number;
  ruolo_nome: string;
  created_at: string;
  updated_at: string;
}

/**
 * UiUser — oggetto compatibile con Sidebar e Header del Figma export.
 * Costruito in App.tsx a partire da UtenteAPI.
 * avatar e avatarBg sono calcolati, non vengono dal backend.
 */
export interface UiUser {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  password: string; // stringa vuota per utenti reali
  ruolo: Role;
  avatar: string;   // iniziali calcolate: "MR"
  avatarBg: string; // colore calcolato dal ruolo_id
}
