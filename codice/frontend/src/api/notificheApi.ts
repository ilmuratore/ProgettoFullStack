import { api } from './client';
import type { Notifica } from '../types/notifiche';

interface NotificheCountResponse {
  count: number;
}

export const notificheApi = {
  list: (): Promise<Notifica[]> =>
    api.get<Notifica[]>('/notifiche'),

  getNonLette: (): Promise<Notifica[]> =>
    api.get<Notifica[]>('/notifiche/non-lette'),

  count: (): Promise<NotificheCountResponse> =>
    api.get<NotificheCountResponse>('/notifiche/count'),

  markAsRead: (id: number): Promise<{ id: number }> =>
    api.patch<{ id: number }>(`/notifiche/${id}/letta`),

  markAllAsRead: (): Promise<{ id: number }[]> =>
    api.patch<{ id: number }[]>('/notifiche/letta-tutto'),
};
