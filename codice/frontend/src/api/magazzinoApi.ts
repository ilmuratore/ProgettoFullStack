import { api } from './client';
import type {
  Magazzino,
  MagazzinoConUbicazioni,
  MagazzinoCreateRequest,
  MagazzinoUpdateRequest,
  Ubicazione,
  UbicazioneCreateRequest,
  UbicazioneUpdateTemperaturaRequest,
} from '../types/magazzino';

export const magazzinoApi = {
  list: (): Promise<Magazzino[]> =>
    api.get<Magazzino[]>('/magazzini'),

  getById: (id: number): Promise<MagazzinoConUbicazioni> =>
    api.get<MagazzinoConUbicazioni>(`/magazzini/${id}`),

  create: (body: MagazzinoCreateRequest): Promise<Magazzino> =>
    api.post<Magazzino>('/magazzini', body),

  update: (id: number, body: MagazzinoUpdateRequest): Promise<Magazzino> =>
    api.patch<Magazzino>(`/magazzini/${id}`, body),

  toggle: (id: number): Promise<Magazzino> =>
    api.patch<Magazzino>(`/magazzini/${id}/toggle`),

  createUbicazione: (magId: number, body: UbicazioneCreateRequest): Promise<Ubicazione> =>
    api.post<Ubicazione>(`/magazzini/${magId}/ubicazioni`, body),

  getUbicazione: (id: number): Promise<Ubicazione> =>
    api.get<Ubicazione>(`/ubicazioni/${id}`),

  updateTemperatura: (id: number, body: UbicazioneUpdateTemperaturaRequest): Promise<Ubicazione> =>
    api.patch<Ubicazione>(`/ubicazioni/${id}`, body),

  toggleUbicazione: (id: number): Promise<Ubicazione> =>
  api.patch<Ubicazione>(`/ubicazioni/${id}/toggle`),
};