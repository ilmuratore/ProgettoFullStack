import { api } from './client';
import type {
  Fornitore,
  FornitoreCreateRequest,
  FornitoreUpdateRequest,
} from '../types/fornitori';

export const fornitoriApi = {
  list: (): Promise<Fornitore[]> =>
    api.get<Fornitore[]>('/fornitori'),

  getById: (id: number): Promise<Fornitore> =>
    api.get<Fornitore>(`/fornitori/${id}`),

  create: (body: FornitoreCreateRequest): Promise<Fornitore> =>
    api.post<Fornitore>('/fornitori', body),

  update: (id: number, body: FornitoreUpdateRequest): Promise<Fornitore> =>
    api.patch<Fornitore>(`/fornitori/${id}`, body),

  remove: (id: number): Promise<void> =>
    api.delete<void>(`/fornitori/${id}`),
};