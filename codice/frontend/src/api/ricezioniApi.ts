import { api } from './client';
import type {
  Ricezione,
  RigaRicezione,
  RicezioneCreateRequest,
  RicezioneRow,
} from '../types/acquisti';

export const ricezioniApi = {
  /** GET /api/v1/ricezioni */
  list: (): Promise<Ricezione[]> =>
    api.get<Ricezione[]>('/ricezioni'),

  /** GET /api/v1/ricezioni/:id */
  getById: (id: number): Promise<Ricezione> =>
    api.get<Ricezione>(`/ricezioni/${id}`),

  /** POST /api/v1/ricezioni  (sola testata) */
  create: (body: RicezioneCreateRequest): Promise<RicezioneRow> =>
    api.post<RicezioneRow>('/ricezioni', body),

  /** GET /api/v1/ricezioni/:id/righe */
  getRighe: (id: number): Promise<RigaRicezione[]> =>
    api.get<RigaRicezione[]>(`/ricezioni/${id}/righe`),
};
