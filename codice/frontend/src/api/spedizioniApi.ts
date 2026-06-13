import { api, downloadBlob } from './client';
import type {
  Spedizione,
  SpedizioneCreateRequest,
  StatoSpedizione,
  Ddt,
  DdtCreateRequest,
  DdtUpdateRequest,
} from '../types/spedizioni';

export const spedizioniApi = {
  list: (): Promise<Spedizione[]> =>
    api.get<Spedizione[]>('/spedizioni'),

  getById: (id: number): Promise<Spedizione> =>
    api.get<Spedizione>(`/spedizioni/${id}`),

  create: (body: SpedizioneCreateRequest): Promise<Spedizione> =>
    api.post<Spedizione>('/spedizioni', body),

  updateStato: (id: number, stato: StatoSpedizione): Promise<Spedizione> =>
    api.patch<Spedizione>(`/spedizioni/${id}/stato`, { stato }),

  updateTracking: (id: number, tracking_number: string): Promise<Spedizione> =>
    api.patch<Spedizione>(`/spedizioni/${id}/tracking`, { tracking_number }),

  getDdt: (id: number): Promise<Ddt> =>
    api.get<Ddt>(`/spedizioni/${id}/ddt`),

  createDdt: (id: number, body: DdtCreateRequest): Promise<Ddt> =>
    api.post<Ddt>(`/spedizioni/${id}/ddt`, body),

  updateDdt: (id: number, body: DdtUpdateRequest): Promise<Ddt> =>
    api.patch<Ddt>(`/spedizioni/${id}/ddt`, body),

  downloadDdtPdf: (id: number): Promise<void> =>
    downloadBlob(`/spedizioni/${id}/ddt/pdf`, `ddt-spedizione-${id}.pdf`),
};
