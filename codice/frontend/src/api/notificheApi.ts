import { api } from './client';
import type { Notifica } from '../types/notifiche';

export const notificheApi = {
  list: (): Promise<Notifica[]> =>
    api.get<Notifica[]>('/notifiche'),

  markAsRead: (id: number): Promise<{ id: number }> =>
    api.patch<{ id: number }>(`/notifiche/${id}/letta`),

  markAllAsRead: (): Promise<{ id: number }[]> =>
    api.patch<{ id: number }[]>('/notifiche/letta-tutto'),
};
