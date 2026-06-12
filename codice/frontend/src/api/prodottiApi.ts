
import { api, downloadBlob } from './client';

import type {
  ProdottoListino,
  Prodotto,
  ProdottoCreateRequest,
  ProdottoUpdateRequest,
  ImportProdottiResult,
} from '../types/prodotti';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

async function uploadImportFile(file: File): Promise<ImportProdottiResult> {
  const token = localStorage.getItem('lc_token');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/prodotti/import`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const body = await res.json();

  if (!res.ok) {
    throw Object.assign(new Error(body.message ?? 'Errore import prodotti'), {
      code: body.code ?? 'INTERNAL_SERVER_ERROR',
      details: body.details ?? [],
      status: res.status,
    });
  }

  return body.data as ImportProdottiResult;
}

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

  importFile: (file: File): Promise<ImportProdottiResult> =>
    uploadImportFile(file),

  downloadImportTemplate: (): Promise<void> =>
    downloadBlob('/prodotti/import/template', 'template-import-prodotti.csv'),
};
