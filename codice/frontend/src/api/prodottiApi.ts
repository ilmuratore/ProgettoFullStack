
import { api } from './client';

import type {
  ProdottoListino,
  Prodotto,
  ProdottoCreateRequest,
  ProdottoUpdateRequest,
} from '../types/prodotti';

export const prodottiApi = {
  list: (): Promise<ProdottoListino[]> =>
    api.get<ProdottoListino[]>('/prodotti'),

  getById: (id: number): Promise<Prodotto> =>
    api.get<Prodotto>(`/prodotti/${id}`),

  create: (body: ProdottoCreateRequest): Promise<Prodotto> =>
    api.post<Prodotto>('/prodotti', body),

  update: (id: number, body: ProdottoUpdateRequest): Promise<Prodotto> =>
    api.patch<Prodotto>(`/prodotti/${id}`, body),

  remove: (id: number): Promise<void> =>
    api.delete<void>(`/prodotti/${id}`),
};
