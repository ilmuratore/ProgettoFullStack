import { api } from './client';
import type {
  DestinazioneCliente,
  DestinazioneCreateRequest,
  DestinazioneUpdateRequest,
} from '../types/destinazioni';

export const destinazioniApi = {
  listByCliente: (clienteId: number): Promise<DestinazioneCliente[]> =>
    api.get<DestinazioneCliente[]>(`/clienti/${clienteId}/destinazioni`),

  getById: (clienteId: number, destinazioneId: number): Promise<DestinazioneCliente> =>
    api.get<DestinazioneCliente>(`/clienti/${clienteId}/destinazioni/${destinazioneId}`),

  create: (clienteId: number, body: DestinazioneCreateRequest): Promise<DestinazioneCliente> =>
    api.post<DestinazioneCliente>(`/clienti/${clienteId}/destinazioni`, body),

  update: (clienteId: number, destinazioneId: number, body: DestinazioneUpdateRequest): Promise<DestinazioneCliente> =>
    api.patch<DestinazioneCliente>(`/clienti/${clienteId}/destinazioni/${destinazioneId}`, body),

  remove: (clienteId: number, destinazioneId: number): Promise<void> =>
    api.delete<void>(`/clienti/${clienteId}/destinazioni/${destinazioneId}`),
};
