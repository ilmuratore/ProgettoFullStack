import { api } from './client';
import type { Ruolo } from '../types/ruoli';
import type { UtenteAPI, UtenteUpdateRequest } from '../types/utenti';

export const utentiApi = {
  list: (): Promise<UtenteAPI[]> =>
    api.get<UtenteAPI[]>('/utenti'),

  getRuoli: (): Promise<Ruolo[]> =>
    api.get<Ruolo[]>('/utenti/ruoli'),

  update: (id: number, body: UtenteUpdateRequest): Promise<UtenteAPI> =>
    api.patch<UtenteAPI>(`/utenti/${id}`, body),

  /** PATCH /api/v1/utenti/:id/password */
  resetPassword: (id: number, password_nuova: string): Promise<void> =>
    api.patch<void>(`/utenti/${id}/password`, { password_nuova }),

  remove: (id: number): Promise<void> =>
    api.delete<void>(`/utenti/${id}`),
};
