import { api } from './client';
import type {
  DisponibilitaOrdineVendita,
  OrdineVenditaDettaglio,
  OrdineVendita,
  OrdineVenditaCreateRequest,
  OrdineVenditaUpdatePickingRequest,
  OrdineVenditaUpdatePickingResponse,
  RigaOrdineVendita,
  StatoPickingVendita,
  StatoOrdineVendita,
} from '../types/ordini';

interface ListFilters {
  stato?: StatoOrdineVendita;
  stato_picking?: StatoPickingVendita;
  cliente_id?: number;
}

function buildQuery(filters?: ListFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.stato) params.set('stato', filters.stato);
  if (filters.stato_picking) params.set('stato_picking', filters.stato_picking);
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

  updateStato: (id: number, stato: StatoOrdineVendita): Promise<OrdineVendita> =>
    api.patch<OrdineVendita>(`/ordini/${id}/stato`, { stato }),

  updatePicking: (id: number, body: OrdineVenditaUpdatePickingRequest): Promise<OrdineVenditaUpdatePickingResponse> =>
    api.patch<OrdineVenditaUpdatePickingResponse>(`/ordini/${id}/picking`, body),

  getDisponibilita: (prodottoId: number): Promise<DisponibilitaOrdineVendita> =>
    api.get<DisponibilitaOrdineVendita>(`/ordini/disponibilita/${prodottoId}`),
};
