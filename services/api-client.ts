import { getApiUrl } from '@/config/api';
import { errorApi } from '@/types/errorAPI.type';
import { Alert } from 'react-native';

let unauthorizedHandler: (() => void | Promise<void>) | null = null;
let isHandlingUnauthorized = false;

type HttpApiError = Error & { status: number; errorApi?: errorApi };

function extractApiError(rawBody: string, status: number): errorApi | null {
  if (!rawBody?.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawBody) as Record<string, unknown>;

    const invalidParams = Array.isArray(parsed.InvalidParams)
      ? parsed.InvalidParams
          .map((item) => {
            if (item && typeof item === 'object') {
              const input = item as Record<string, unknown>;
              const name = typeof input.name === 'string' ? input.name : '';
              const reason = typeof input.reason === 'string' ? input.reason : '';
              return { name, reason };
            }
            return null;
          })
          .filter((item): item is { name: string; reason: string } => Boolean(item))
      : [];

    return {
      type: typeof parsed.type === 'string' ? parsed.type : 'about:blank',
      title: typeof parsed.title === 'string' ? parsed.title : 'Erreur API',
      detail:
        typeof parsed.detail === 'string' ? parsed.detail
        : typeof parsed.message === 'string' ? parsed.message
        : typeof parsed.error === 'string' ? parsed.error
        : rawBody.trim(),
      instance: typeof parsed.instance === 'string' ? parsed.instance : '',
      status: typeof parsed.status === 'number' ? parsed.status : status,
      InvalidParams: invalidParams,
    };
  } catch {
    return {
      type: 'about:blank',
      title: 'Erreur API',
      detail: rawBody.trim(),
      instance: '',
      status,
      InvalidParams: [],
    };
  }
}

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
    const errorRawBody = await response.text();
    const parsedApiError = extractApiError(errorRawBody, response.status);
    const apiMessage = parsedApiError?.detail || `Erreur API (${response.status})`;

    if (response.status === 401) {
      if (!isHandlingUnauthorized) {
        isHandlingUnauthorized = true;
        Alert.alert('Session expirée', apiMessage || 'Votre session a expiré. Veuillez vous reconnecter.');
        try {
          await unauthorizedHandler?.();
        } finally {
          isHandlingUnauthorized = false;
        }
      }
    } else if (response.status >= 500) {
      Alert.alert('Erreur serveur', apiMessage || 'Une erreur serveur est survenue. Réessayez plus tard.');
    }

    const error = new Error(apiMessage || `Erreur API (${response.status})`) as HttpApiError;
    error.status = response.status;
    error.errorApi = parsedApiError ?? undefined;
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
