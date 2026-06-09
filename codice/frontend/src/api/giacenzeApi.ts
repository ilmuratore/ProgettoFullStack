import { api } from "./client";
import type { Giacenza } from "../types/magazzino";

export const giacenzeApi = {
  /**
   * GET /api/v1/giacenze
   * Supporta query param:
   * - search
   * - magazzino
   * - scorta (sotto)
   */
  list: (params?: Record<string, any>): Promise<Giacenza[]> => {
  const query = params
    ? "?" + new URLSearchParams(params as Record<string, string>).toString()
    : "";

  return api.get<Giacenza[]>(`/giacenze${query}`);
},


  /**
   * GET /api/v1/giacenze/:prodotto_id
   * (se in futuro servirà dettaglio per prodotto)
   */
  getByProdottoId: (prodottoId: number): Promise<Giacenza[]> =>
    api.get<Giacenza[]>(`/giacenze/${prodottoId}`),
};

