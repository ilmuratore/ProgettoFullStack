const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('lc_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json();

  if (res.status === 401) {
    localStorage.removeItem('lc_token');
    localStorage.removeItem('lc_utente');
    window.location.href = '/login';
    throw Object.assign(new Error(body.message ?? 'Non autorizzato'), {
      code: 'AUTH_REQUIRED',
      details: [],
      status: 401,
    });
  }

  if (!res.ok) {
    throw Object.assign(new Error(body.message ?? 'Errore server'), {
      code: body.code ?? 'INTERNAL_SERVER_ERROR',
      details: body.details ?? [],
      status: res.status,
    });
  }

  return body.data as T;
}

export async function downloadBlob(path: string, filename: string): Promise<void> {
  const token = localStorage.getItem('lc_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('lc_token');
    localStorage.removeItem('lc_utente');
    window.location.href = '/login';
    throw Object.assign(new Error('Non autorizzato'), {
      code: 'AUTH_REQUIRED',
      details: [],
      status: 401,
    });
  }

  if (!res.ok) {
    let message = 'Errore server';
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {}

    throw Object.assign(new Error(message), {
      code: 'INTERNAL_SERVER_ERROR',
      details: [],
      status: res.status,
    });
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}


export async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = localStorage.getItem('lc_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json();

  if (res.status === 401) {
    localStorage.removeItem('lc_token');
    localStorage.removeItem('lc_utente');
    window.location.href = '/login';
    throw Object.assign(new Error(body.message ?? 'Non autorizzato'), {
      code: 'AUTH_REQUIRED',
      details: [],
      status: 401,
    });
  }

  if (!res.ok) {
    throw Object.assign(new Error(body.message ?? 'Errore server'), {
      code: body.code ?? 'INTERNAL_SERVER_ERROR',
      details: body.details ?? [],
      status: res.status,
    });
  }

  return body.data as T;
}

export const api = {
  get:    <T>(path: string) => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, {method: 'PATCH',...(body !== undefined && { body: JSON.stringify(body) }),}),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
