import apiConfig, { getApiUrl } from '@/config/api';
import { userDataFake } from '@/data/fakeDatas/user.fake';
import { isFakeModeEnabled } from '@/tools/tools';

export type AuthUser = { id: string; email: string; name: string };
export type AuthResponse = { token: string; user: AuthUser | null };




async function parseResponseBody(response: Response) {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractUser(data: Record<string, unknown> | null): AuthUser | null {
  if (!data) {
    return null;
  }

  const rawUser = (data.user as Record<string, unknown>) ?? data;

  const id = (rawUser.id ?? rawUser.userId ?? '') as string;
  const email = (rawUser.email ?? '') as string;
  const name = ((rawUser.name ?? rawUser.nom ?? '') as string);

  if (!id || !email || !name) {
    return null;
  }

  return { id, email, name };
}

export async function signInApi(login: string, password: string): Promise<AuthResponse> {
  if (isFakeModeEnabled()) {
    return { token: 'fake-token', user: { id: userDataFake.id, email: userDataFake.email, name: userDataFake.nom } };
  }

  const response = await fetch(getApiUrl(apiConfig.endpoints.login), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error((data?.message as string) || 'Erreur lors de la connexion');
  }

  const token = data?.token as string | undefined;

  if (!token) {
    throw new Error('Réponse invalide du serveur de connexion');
  }

  const user = extractUser(data);

  return { token, user };
}

export async function signUpApi(email: string, password: string, name: string): Promise<AuthResponse> {
  if (isFakeModeEnabled()) {
    throw new Error('FAKE_MODE');
  }

  const response = await fetch(getApiUrl(apiConfig.endpoints.register), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error((data?.message as string) || "Erreur lors de l'inscription");
  }

  const token = data?.token as string | undefined;

  if (!token) {
    throw new Error("Réponse invalide du serveur d'inscription");
  }

  const user = extractUser(data);

  return { token, user };
}

export async function signOutApi(userToken: string): Promise<void> {
  if (isFakeModeEnabled()) {
    return;
  }

  await fetch(getApiUrl(apiConfig.endpoints.logout), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
  });
}
