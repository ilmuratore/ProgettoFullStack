import { api } from './client';

export interface UtenteAPI {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo_id: number;
  ruolo_nome: string;
  created_at: string;
  updated_at: string;
}

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
}

export const authApi = {
  login: (email: string, password: string) => api.post<LoginResponse>('/auth/login', { email, password }),
  register: (data: RegisterData) => api.post<UtenteAPI>('/auth/register', data), me: () => api.get<UtenteAPI>('/auth/me'),
};
