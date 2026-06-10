import { api } from './client';
import type {
  OrdineAcquistoLista,
  OrdineAcquistoDettaglio,
  OrdineAcquistoCreateRequest,
  OrdineAcquistoUpdateRequest,
  OrdineTestata,
  StatoOrdineAcquisto,
  RigaPo,
  RigaPoCreateRequest,
  RicezioneTestata,
  RicezioneOrdineCreateRequest,
} from '../types/acquisti';

interface ListFilters {
  stato?: StatoOrdineAcquisto;
  fornitore_id?: number;
}

function buildQuery(filters?: ListFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.stato) params.set('stato', filters.stato);
  if (filters.fornitore_id != null) params.set('fornitore_id', String(filters.fornitore_id));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const acquistiApi = {
  /** GET /api/v1/ordini-acquisto */
  list: (filters?: ListFilters): Promise<OrdineAcquistoLista[]> =>
    api.get<OrdineAcquistoLista[]>(`/ordini-acquisto${buildQuery(filters)}`),

  /** GET /api/v1/ordini-acquisto/:id */
  getById: (id: number): Promise<OrdineAcquistoDettaglio> =>
    api.get<OrdineAcquistoDettaglio>(`/ordini-acquisto/${id}`),

  /** POST /api/v1/ordini-acquisto */
  create: (body: OrdineAcquistoCreateRequest): Promise<{ ordine: OrdineTestata; righe: RigaPo[] }> =>
    api.post<{ ordine: OrdineTestata; righe: RigaPo[] }>('/ordini-acquisto', body),

  /** PATCH /api/v1/ordini-acquisto/:id */
  update: (id: number, body: OrdineAcquistoUpdateRequest): Promise<OrdineTestata> =>
    api.patch<OrdineTestata>(`/ordini-acquisto/${id}`, body),

  /** PATCH /api/v1/ordini-acquisto/:id/stato */
  updateStato: (id: number, stato: StatoOrdineAcquisto): Promise<OrdineTestata> =>
    api.patch<OrdineTestata>(`/ordini-acquisto/${id}/stato`, { stato }),

  /** POST /api/v1/ordini-acquisto/:id/righe */
  addRiga: (id: number, body: RigaPoCreateRequest): Promise<RigaPo> =>
    api.post<RigaPo>(`/ordini-acquisto/${id}/righe`, body),

  /** POST /api/v1/ordini-acquisto/ricezioni */
  createRicezione: (body: RicezioneOrdineCreateRequest): Promise<unknown> =>
    api.post<unknown>('/ordini-acquisto/ricezioni', body),

  /** GET /api/v1/ordini-acquisto/:id/ricezioni */
  listRicezioni: (id: number): Promise<RicezioneTestata[]> =>
    api.get<RicezioneTestata[]>(`/ordini-acquisto/${id}/ricezioni`),
};
