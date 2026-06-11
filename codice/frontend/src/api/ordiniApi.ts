import { api } from './client';
import type {
  DisponibilitaOrdineVendita,
  OrdineVenditaDettaglio,
  OrdineVendita,
  OrdineVenditaCreateRequest,
  RigaOrdineVendita,
  StatoOrdineVendita,
} from '../types/ordini';

interface ListFilters {
  stato?: StatoOrdineVendita;
  cliente_id?: number;
}

function buildQuery(filters?: ListFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.stato) params.set('stato', filters.stato);
  if (filters.cliente_id != null) params.set('cliente_id', String(filters.cliente_id));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const ordiniApi = {
  list: (filters?: ListFilters): Promise<OrdineVendita[]> =>
    api.get<OrdineVendita[]>(`/ordini${buildQuery(filters)}`),

  getById: (id: number): Promise<OrdineVenditaDettaglio> =>
    api.get<OrdineVenditaDettaglio>(`/ordini/${id}`),

  create: (body: OrdineVenditaCreateRequest): Promise<{ ordine: OrdineVendita; righe: RigaOrdineVendita[] }> =>
    api.post<{ ordine: OrdineVendita; righe: RigaOrdineVendita[] }>('/ordini', body),

  getDisponibilita: (prodottoId: number): Promise<DisponibilitaOrdineVendita> =>
    api.get<DisponibilitaOrdineVendita>(`/ordini/disponibilita/${prodottoId}`),
};
