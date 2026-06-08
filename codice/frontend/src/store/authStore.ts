import { create } from 'zustand';
import type { UtenteAPI } from '../types/auth';

export const RUOLO_ID_TO_NOME: Record<number, string> = {
  1: 'Admin',
  2: 'Responsabile Acquisti',
  3: 'Responsabile Magazzino',
  4: 'Operatore',
  5: 'Corriere',
};

const RUOLO_NOME_TO_ID: Record<string, number> = Object.fromEntries(
  Object.entries(RUOLO_ID_TO_NOME).map(([id, nome]) => [nome, Number(id)])
);

function normalizzaUtente(u: UtenteAPI): UtenteAPI {
  const ruolo_id =
    u.ruolo_id ??
    RUOLO_NOME_TO_ID[u.ruolo_nome ?? ''] ??
    RUOLO_NOME_TO_ID[(u as any).ruolo ?? ''];
  return {
    ...u,
    ruolo_id,
    ruolo_nome: u.ruolo_nome ?? (ruolo_id ? RUOLO_ID_TO_NOME[ruolo_id] : undefined),
  };
}


const PERMESSI_PER_RUOLO: Record<number, string[]> = {
  1: [
    'utenti:write', 'utenti:read', 'utenti:delete',
    'prodotti:read', 'prodotti:write', 'prodotti:delete',
    'fornitori:read', 'fornitori:write', 'fornitori:delete',
    'clienti:read', 'clienti:write', 'clienti:delete',
    'corrieri:read', 'corrieri:write', 'corrieri:delete',
    'dipendenti:read', 'dipendenti:write', 'dipendenti:delete',
    'magazzino:read', 'magazzino:write',
  ],
  2: [
    'prodotti:read',
    'fornitori:read', 'fornitori:write', 'fornitori:delete',
    'clienti:read',
    'corrieri:read',
    'magazzino:read',
  ],
  3: [
    'prodotti:read', 'clienti:read',
    'magazzino:read', 'magazzino:write',
    'corrieri:read', 'dipendenti:read',
  ],
  4: ['prodotti:read', 'clienti:read', 'magazzino:read', 'corrieri:read'],
  5: [],
};

export const PAGINE_PER_RUOLO: Record<number, string[]> = {
  1: ['dashboard', 'anagrafiche', 'magazzino', 'acquisti', 'vendite', 'logistica', 'amministrazione'],
  2: ['dashboard', 'anagrafiche', 'acquisti'],
  3: ['dashboard', 'magazzino', 'vendite', 'logistica'],
  4: ['dashboard', 'anagrafiche', 'vendite', 'magazzino'],
  5: ['dashboard', 'logistica'],
};

interface AuthState {
  token: string | null;
  utente: UtenteAPI | null;
  setAuth: (token: string, utente: UtenteAPI) => void;
  logout: () => void;
  hasPermesso: (permesso: string) => boolean;
  canAccessPage: (page: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('lc_token'),
  utente: (() => {
    try { return JSON.parse(localStorage.getItem('lc_utente') ?? 'null'); }
    catch { return null; }
  })(),

  setAuth: (token, utente) => {
    const u = normalizzaUtente(utente);
    localStorage.setItem('lc_token', token);
    localStorage.setItem('lc_utente', JSON.stringify(u));
    set({ token, utente:u  });
  },

  logout: () => {
    localStorage.removeItem('lc_token');
    localStorage.removeItem('lc_utente');
    set({ token: null, utente: null });
  },

  hasPermesso: (permesso) => {
    const ruolo_id = get().utente?.ruolo_id;
    if (!ruolo_id) return false;
    return PERMESSI_PER_RUOLO[ruolo_id]?.includes(permesso) ?? false;
  },

  canAccessPage: (page) => {
    const ruolo_id = get().utente?.ruolo_id;
    if (!ruolo_id) return false;
    return PAGINE_PER_RUOLO[ruolo_id]?.includes(page) ?? false;
  },
}));
