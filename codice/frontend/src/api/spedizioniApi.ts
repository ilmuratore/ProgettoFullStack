import { api } from './client';
import type { Spedizione, SpedizioneCreateRequest, StatoSpedizione } from '../types/spedizioni';

export const spedizioniApi = {
  list: (): Promise<Spedizione[]> =>
    api.get<Spedizione[]>('/spedizioni'),

  getById: (id: number): Promise<Spedizione> =>
    api.get<Spedizione>(`/spedizioni/${id}`),

  create: (body: SpedizioneCreateRequest): Promise<Spedizione> =>
    api.post<Spedizione>('/spedizioni', body),

  updateStato: (id: number, stato: StatoSpedizione): Promise<Spedizione> =>
    api.patch<Spedizione>(`/spedizioni/${id}/stato`, { stato }),
};
