import { api } from './client';
import type {
  Ricezione,
  RigaRicezione,
  RicezioneCreateRequest,
  RigaRicezioneCreateRequest,
} from '../types/acquisti';

export const ricezioniApi = {
  /** GET /api/v1/ricezioni */
  list: (): Promise<Ricezione[]> =>
    api.get<Ricezione[]>('/ricezioni'),

  /** GET /api/v1/ricezioni/:id */
  getById: (id: number): Promise<Ricezione> =>
    api.get<Ricezione>(`/ricezioni/${id}`),

  /** POST /api/v1/ricezioni  (sola testata) */
  create: (body: RicezioneCreateRequest): Promise<Ricezione> =>
    api.post<Ricezione>('/ricezioni', body),

  /** GET /api/v1/ricezioni/:id/righe */
  getRighe: (id: number): Promise<RigaRicezione[]> =>
    api.get<RigaRicezione[]>(`/ricezioni/${id}/righe`),

  /** POST /api/v1/ricezioni/:id/righe */
  addRiga: (id: number, body: RigaRicezioneCreateRequest): Promise<RigaRicezione> =>
    api.post<RigaRicezione>(`/ricezioni/${id}/righe`, body),
};
