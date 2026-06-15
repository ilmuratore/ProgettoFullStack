import { api } from './client';
import type { UtenteAPI } from '../types/auth';

export type { UtenteAPI };

export interface LoginResponse {
  token: string;
  utente: UtenteAPI;
}

export interface RegisterData {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  ruolo_id: number;
  attivo?: boolean;
}

export const authApi = {
  login:          (email: string, password: string) =>
                    api.post<LoginResponse>('/auth/login', { email, password }),
  register:       (data: RegisterData) =>
                    api.post<UtenteAPI>('/auth/register', data),
  me:             () =>
                    api.get<UtenteAPI>('/auth/me'),
  changePassword: (password_attuale: string, password_nuova: string) =>
                    api.patch<void>('/auth/password', { password_attuale, password_nuova }),
};
