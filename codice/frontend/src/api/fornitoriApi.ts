import { api } from './client';
import type {
  Fornitore,
  FornitoreCreateRequest,
  FornitoreUpdateRequest,
  ContattoFornitore,
  ContattoFornitoreDettaglio,
  ContattoFornitoreCreateRequest,
  ContattoFornitoreUpdateRequest,
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

  /** GET /api/v1/fornitori/:id/contatti */
  listContatti: (id: number): Promise<ContattoFornitore[]> =>
    api.get<ContattoFornitore[]>(`/fornitori/${id}/contatti`),

  /** POST /api/v1/fornitori/:id/contatti */
  createContatto: (id: number, body: ContattoFornitoreCreateRequest): Promise<ContattoFornitore> =>
    api.post<ContattoFornitore>(`/fornitori/${id}/contatti`, body),

  /** GET /api/v1/fornitori/:id/contatti/:contattoId */
  getContatto: (id: number, contattoId: number): Promise<ContattoFornitoreDettaglio> =>
    api.get<ContattoFornitoreDettaglio>(`/fornitori/${id}/contatti/${contattoId}`),

  /** PATCH /api/v1/fornitori/:id/contatti/:contattoId */
  updateContatto: (id: number, contattoId: number, body: ContattoFornitoreUpdateRequest): Promise<ContattoFornitoreDettaglio> =>
    api.patch<ContattoFornitoreDettaglio>(`/fornitori/${id}/contatti/${contattoId}`, body),
};