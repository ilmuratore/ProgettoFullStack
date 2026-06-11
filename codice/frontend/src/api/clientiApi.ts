import { api } from './client';
import type { Cliente, ClienteCreateRequest, ClienteUpdateRequest, DestinazioneCliente } from '../types/clienti';

export const clientiApi = {
  list: (): Promise<Cliente[]> =>
    api.get<Cliente[]>('/clienti'),

  getById: (id: number): Promise<Cliente> =>
    api.get<Cliente>(`/clienti/${id}`),

  listDestinazioni: (id: number): Promise<DestinazioneCliente[]> =>
    api.get<DestinazioneCliente[]>(`/clienti/${id}/destinazioni`),

  create: (body: ClienteCreateRequest): Promise<Cliente> =>
    api.post<Cliente>('/clienti', body),

  update: (id: number, body: ClienteUpdateRequest): Promise<Cliente> =>
    api.patch<Cliente>(`/clienti/${id}`, body),

  remove: (id: number): Promise<void> =>
    api.delete<void>(`/clienti/${id}`),
};
