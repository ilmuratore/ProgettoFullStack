import { create } from 'zustand';
import type { UtenteAPI } from '../types/auth';

export const RUOLO_ID_TO_NOME: Record<number, string> = {
  1: 'Admin',
  2: 'Dev',
  3: 'Supporto',
  4: 'Resp. Azienda',
  5: 'Resp. HR',
  6: 'Resp. Vendite',
  7: 'Resp. Acquisti',
  8: 'Resp. Magazzino',
  9: 'Operatore',
  10: 'Corriere',
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
    ruolo_nome: u.ruolo_nome ?? (u as any).ruolo ?? (ruolo_id ? RUOLO_ID_TO_NOME[ruolo_id] : undefined),
  };
}

export const ALL_PERMISSIONS = [
  'utenti:read', 'utenti:write', 'utenti:delete',
  'prodotti:read', 'prodotti:write', 'prodotti:delete',
  'fornitori:read', 'fornitori:write', 'fornitori:delete',
  'clienti:read', 'clienti:write', 'clienti:delete',
  'dipendenti:read', 'dipendenti:write', 'dipendenti:delete',
  'magazzino:read', 'magazzino:write',
  'giacenze:read', 'giacenze:write',
  'acquisti:read', 'acquisti:write', 'acquisti:approve',
  'ordini:read', 'ordini:write', 'ordini:approve',
  'spedizioni:read', 'spedizioni:write',
  'notifiche:read', 'dashboard:read', 'ecosystem:read',
];

export const PERMESSI_PER_RUOLO: Record<number, string[]> = {
  1: ALL_PERMISSIONS,
  2: ALL_PERMISSIONS,
  3: [
    'utenti:read',
    'prodotti:read',
    'fornitori:read',
    'clienti:read',
    'magazzino:read',
    'giacenze:read',
    'acquisti:read',
    'ordini:read',
    'spedizioni:read',
    'notifiche:read',
    'dashboard:read',
    'ecosystem:read',
  ],
  4: [
    'utenti:read',
    'prodotti:read', 'prodotti:write', 'prodotti:delete',
    'fornitori:read', 'fornitori:write', 'fornitori:delete',
    'clienti:read', 'clienti:write', 'clienti:delete',
    'dipendenti:read', 'dipendenti:write', 'dipendenti:delete',
    'magazzino:read', 'magazzino:write',
    'giacenze:read', 'giacenze:write',
    'acquisti:read', 'acquisti:write', 'acquisti:approve',
    'ordini:read', 'ordini:write', 'ordini:approve',
    'spedizioni:read', 'spedizioni:write',
    'notifiche:read', 'dashboard:read', 'ecosystem:read',
  ],
  5: [
    'utenti:read',
    'dipendenti:read', 'dipendenti:write', 'dipendenti:delete',
    'notifiche:read', 'dashboard:read',
  ],
  6: [
    'prodotti:read',
    'clienti:read', 'clienti:write', 'clienti:delete',
    'giacenze:read', 'giacenze:write', 'magazzino:read',
    'ordini:read', 'ordini:write', 'ordini:approve',
    'notifiche:read', 'dashboard:read',
  ],
  7: [
    'prodotti:read', 'prodotti:write',
    'fornitori:read', 'fornitori:write',
    'clienti:read', 'clienti:write',
    'magazzino:read',
    'giacenze:read',
    'acquisti:read', 'acquisti:write', 'acquisti:approve',
    'notifiche:read', 'dashboard:read', 'ecosystem:read',
  ],
  8: [
    'prodotti:read', 'prodotti:write',
    'fornitori:read', 'clienti:read',
    'magazzino:read', 'magazzino:write',
    'giacenze:read', 'giacenze:write',
    'acquisti:read', 'acquisti:approve',
    'ordini:read', 'ordini:approve',
    'spedizioni:read', 'spedizioni:write',
    'notifiche:read', 'dashboard:read',
  ],
  9: [
    'prodotti:read', 'fornitori:read', 'clienti:read',
    'magazzino:read',
    'giacenze:read', 'giacenze:write',
    'ordini:read',
    'spedizioni:read',
    'notifiche:read', 'dashboard:read',
  ],
  10: [
    'spedizioni:read',
    'notifiche:read', 'dashboard:read',
  ],
};

export const PAGINE_PER_RUOLO: Record<number, string[]> = {
  1: ['dashboard', 'anagrafiche', 'magazzino', 'acquisti', 'vendite', 'logistica', 'amministrazione', 'register'],
  2: ['dashboard', 'anagrafiche', 'magazzino', 'acquisti', 'vendite', 'logistica', 'amministrazione', 'register'],
  3: ['dashboard', 'anagrafiche', 'magazzino', 'acquisti', 'vendite', 'logistica', 'amministrazione'],
  4: ['dashboard', 'anagrafiche', 'magazzino', 'acquisti', 'vendite', 'logistica', 'amministrazione', 'register'],
  5: ['dashboard', 'anagrafiche'],
  6: ['dashboard', 'anagrafiche', 'vendite', 'magazzino'],
  7: ['dashboard', 'anagrafiche', 'acquisti', 'magazzino'],
  8: ['dashboard', 'magazzino', 'acquisti', 'logistica'],
  9: ['dashboard', 'anagrafiche', 'vendite', 'magazzino', 'logistica'],
  10: ['dashboard', 'logistica'],
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
    set({ token, utente: u });
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
