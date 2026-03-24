import { getApiUrl } from '@/config/api';
import { errorApi } from '@/types/errorAPI.type';

let unauthorizedHandler: (() => void | Promise<void>) | null = null;
let apiErrorPopupHandler: ((payload: { type: 'error' | 'info'; title: string; message: string }) => void) | null = null;
let isHandlingUnauthorized = false;
let lastApiPopupKey = '';
let lastApiPopupAt = 0;

const API_POPUP_COOLDOWN_MS = 1500;

type HttpApiError = Error & { status: number; errorApi?: errorApi };

function showApiErrorPopup(title: string, message: string) {
  const now = Date.now();
  const popupKey = `${title}|${message}`;

  if (lastApiPopupKey === popupKey && now - lastApiPopupAt < API_POPUP_COOLDOWN_MS) {
    return;
  }

  lastApiPopupKey = popupKey;
  lastApiPopupAt = now;

  if (apiErrorPopupHandler) {
    apiErrorPopupHandler({
      type: 'error',
      title,
      message,
    });
  }
}

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

export function setApiErrorPopupHandler(
  handler: ((payload: { type: 'error' | 'info'; title: string; message: string }) => void) | null
) {
  apiErrorPopupHandler = handler;
}

async function requestJson<T>(endpoint: string, init?: RequestInit): Promise<T> {
  try {
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
      const apiTitle = parsedApiError?.title || (response.status >= 500 ? 'Erreur serveur' : 'Erreur API');

      if (response.status === 401) {
        if (!isHandlingUnauthorized) {
          isHandlingUnauthorized = true;
          showApiErrorPopup('Session expirée', apiMessage || 'Votre session a expiré. Veuillez vous reconnecter.');
          try {
            await unauthorizedHandler?.();
          } finally {
            isHandlingUnauthorized = false;
          }
        }
      } else {
        showApiErrorPopup(apiTitle, apiMessage || `Erreur API (${response.status})`);
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
  } catch (error) {
    const httpError = error as Partial<HttpApiError>;
    if (typeof httpError?.status === 'number') {
      throw error;
    }

    const networkMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.';
    showApiErrorPopup('Erreur réseau', networkMessage);

    const networkError = new Error(networkMessage) as HttpApiError;
    networkError.status = 0;
    throw networkError;
  }
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
