import { api } from './client';
import type {
  Corriere,
  CorriereCreateRequest,
  CorriereUpdateRequest,
  Dipendente,
  DipendenteCreateRequest,
  DipendenteUpdateRequest,
} from '../types/corrieri';

export const corrieriApi = {
  list: (): Promise<Corriere[]> =>
    api.get<Corriere[]>('/corrieri'),

  getById: (id: number): Promise<Corriere> =>
    api.get<Corriere>(`/corrieri/${id}`),

  create: (body: CorriereCreateRequest): Promise<Corriere> =>
    api.post<Corriere>('/corrieri', body),

  update: (id: number, body: CorriereUpdateRequest): Promise<Corriere> =>
    api.patch<Corriere>(`/corrieri/${id}`, body),

  remove: (id: number): Promise<void> =>
    api.delete<void>(`/corrieri/${id}`),
};

export const dipendentiApi = {
  list: (): Promise<Dipendente[]> =>
    api.get<Dipendente[]>('/dipendenti'),

  getById: (id: number): Promise<Dipendente> =>
    api.get<Dipendente>(`/dipendenti/${id}`),

  create: (body: DipendenteCreateRequest): Promise<Dipendente> =>
    api.post<Dipendente>('/dipendenti', body),

  update: (id: number, body: DipendenteUpdateRequest): Promise<Dipendente> =>
    api.patch<Dipendente>(`/dipendenti/${id}`, body),

  remove: (id: number): Promise<void> =>
    api.delete<void>(`/dipendenti/${id}`),
};