import { getApiUrl } from '@/config/api';

export async function getJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(getApiUrl(endpoint));

  if (!response.ok) {
    throw new Error(`Erreur API (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function getJsonAuth<T>(endpoint: string, token: string): Promise<T> {
  const response = await fetch(getApiUrl(endpoint), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur API (${response.status})`);
  }

  return response.json() as Promise<T>;
}
