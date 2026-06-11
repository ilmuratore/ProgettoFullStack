import { api } from './client';
import type { Spedizione } from '../types/spedizioni';

export const spedizioniApi = {
  list: (): Promise<Spedizione[]> =>
    api.get<Spedizione[]>('/spedizioni'),

  getById: (id: number): Promise<Spedizione> =>
    api.get<Spedizione>(`/spedizioni/${id}`),
};
