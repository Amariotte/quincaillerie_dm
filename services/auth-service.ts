import apiConfig, { getApiUrl } from '@/config/api';
import { userDataFake } from '@/data/fakeDatas/user.fake';
import { isFakeModeEnabled } from '@/tools/tools';
import { user } from '@/types/user.type';

export type AuthResponse = { token: string; user: user | null };

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

function extractUser(data: Record<string, unknown> | null): user | null {
  if (!data) {
    return null;
  }

  const rawUser = (data.user as Record<string, unknown>) ?? data;

  const id = (rawUser.id ?? rawUser.userId ?? '') as string;
  const email = (rawUser.email ?? '') as string;
  const nom = ((rawUser.nom ?? rawUser.name ?? '') as string);

  if (!id || !email || !nom) {
    return null;
  }

  return { id, email, nom, representantLegal: rawUser.representantLegal as string ?? '', dateNaissance: rawUser.dateNaissance as string ?? '', adresse: rawUser.adresse as string ?? '' };
}

export async function signInApi(login: string, password: string): Promise<AuthResponse> {
  if (isFakeModeEnabled()) {
    return { token: 'fake-token', user: userDataFake };
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
