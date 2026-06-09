import { api } from "./client";
import type { MovimentoStock, MovimentoStockCreateRequest } from "../types/magazzino";

export const movimentiStockApi = {
  /**
   * GET /api/v1/movimenti-stock
   */
  list: (): Promise<MovimentoStock[]> =>
    api.get<MovimentoStock[]>("/movimenti-stock"),

  /**
   * GET /api/v1/movimenti-stock/:id
   */
  getById: (id: number): Promise<MovimentoStock> =>
    api.get<MovimentoStock>(`/movimenti-stock/${id}`),

  /**
   * GET /api/v1/movimenti-stock/prodotto/:prodotto_id
   */
  getByProdottoId: (prodottoId: number): Promise<MovimentoStock[]> =>
    api.get<MovimentoStock[]>(`/movimenti-stock/prodotto/${prodottoId}`),

  /**
   * GET /api/v1/movimenti-stock/ubicazione/:ubicazione_id
   */
  getByUbicazioneId: (ubicazioneId: number): Promise<MovimentoStock[]> =>
    api.get<MovimentoStock[]>(`/movimenti-stock/ubicazione/${ubicazioneId}`),

  /**
   * GET /api/v1/movimenti-stock/tipo/:movimento_tipo
   */
  getByTipo: (tipo: string): Promise<MovimentoStock[]> =>
    api.get<MovimentoStock[]>(`/movimenti-stock/tipo/${tipo}`),

  /**
   * GET /api/v1/movimenti-stock/riferimento/:riferimento
   */
  getByRiferimento: (riferimento: string): Promise<MovimentoStock[]> =>
    api.get<MovimentoStock[]>(`/movimenti-stock/riferimento/${riferimento}`),

  /**
   * POST /api/v1/movimenti-stock
   */
  create: (body: MovimentoStockCreateRequest): Promise<MovimentoStock> =>
    api.post<MovimentoStock>("/movimenti-stock", body),
};
