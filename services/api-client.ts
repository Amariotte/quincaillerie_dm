import { getApiUrl } from '@/config/api';
import { Alert } from 'react-native';

let unauthorizedHandler: (() => void | Promise<void>) | null = null;
let isHandlingUnauthorized = false;

type HttpApiError = Error & { status: number };

export function setUnauthorizedHandler(handler: (() => void | Promise<void>) | null) {
  unauthorizedHandler = handler;
}

async function requestJson<T>(endpoint: string, init?: RequestInit): Promise<T> {

    const response = await fetch(getApiUrl(endpoint), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });


  if (!response.ok) {
    if (response.status === 401) {
      if (!isHandlingUnauthorized) {
        isHandlingUnauthorized = true;
        Alert.alert('Session expirée', 'Votre session a expiré. Veuillez vous reconnecter.');
        try {
          await unauthorizedHandler?.();
        } finally {
          isHandlingUnauthorized = false;
        }
      }
    } else if (response.status >= 500) {
      Alert.alert('Erreur serveur', 'Une erreur serveur est survenue. Réessayez plus tard.');
    }

    const error = new Error(`Erreur API (${response.status})`) as HttpApiError;
    error.status = response.status;
    throw error;
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
