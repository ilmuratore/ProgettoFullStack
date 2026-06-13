import { api } from './client';

export const utentiApi = {
  /** PATCH /api/v1/utenti/:id/password */
  resetPassword: (id: number, password_nuova: string): Promise<void> =>
    api.patch<void>(`/utenti/${id}/password`, { password_nuova }),
};
