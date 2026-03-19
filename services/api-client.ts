import { getApiUrl } from '@/config/api';

async function requestJson<T>(endpoint: string, init?: RequestInit): Promise<T> {

    const response = await fetch(getApiUrl(endpoint), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });


  if (!response.ok) {
    throw new Error(`Erreur API (${response.status})`);
  }

  const rawBody = await response.text();

  if (!rawBody) {
    return null as T;
  }

  return JSON.parse(rawBody) as T;
  
  
}

export async function getJson<T>(endpoint: string): Promise<T> {
  return requestJson<T>(endpoint);
}

export async function getJsonAuth<T>(endpoint: string, token: string): Promise<T> {
  

  return requestJson<T>(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function postJson<TResponse, TBody = unknown>(endpoint: string, body?: TBody): Promise<TResponse> {
  
  return requestJson<TResponse>(endpoint, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function postJsonAuth<TResponse, TBody = unknown>(endpoint: string, token: string, body?: TBody): Promise<TResponse> {
  return requestJson<TResponse>(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
