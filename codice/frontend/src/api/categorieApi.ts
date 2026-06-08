import { api } from './client';
import type { Categoria, CategoriaCreateRequest, CategoriaUpdateRequest } from '../types/categorie';

export const categorieApi = {
  list: (): Promise<Categoria[]> =>
    api.get<Categoria[]>('/categorie'),

  getById: (id: number): Promise<Categoria> =>
    api.get<Categoria>(`/categorie/${id}`),

  create: (body: CategoriaCreateRequest): Promise<Categoria> =>
    api.post<Categoria>('/categorie', body),

  update: (id: number, body: CategoriaUpdateRequest): Promise<Categoria> =>
    api.patch<Categoria>(`/categorie/${id}`, body),

  remove: (id: number): Promise<void> =>
    api.delete<void>(`/categorie/${id}`),
};
