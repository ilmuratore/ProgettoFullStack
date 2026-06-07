import { api } from './client';
import type { Cliente, ClienteCreateRequest, ClienteUpdateRequest } from '../types/clienti';

export const clientiApi = {
  list: (): Promise<Cliente[]> =>
    api.get<Cliente[]>('/clienti'),

  getById: (id: number): Promise<Cliente> =>
    api.get<Cliente>(`/clienti/${id}`),

  create: (body: ClienteCreateRequest): Promise<Cliente> =>
    api.post<Cliente>('/clienti', body),

  update: (id: number, body: ClienteUpdateRequest): Promise<Cliente> =>
    api.patch<Cliente>(`/clienti/${id}`, body),

  remove: (id: number): Promise<void> =>
    api.delete<void>(`/clienti/${id}`),
};