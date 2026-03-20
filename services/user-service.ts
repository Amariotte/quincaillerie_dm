import apiConfig from '@/config/api';
import { userDataFake, userDataFakeAuthResponse } from '@/data/datas.fake';
import { isFakeModeEnabled } from '@/tools/tools';
import { AuthResponse, user } from '@/types/user.type';
import { getJsonAuth, postJson, postJsonAuth } from './api-client';

export async function fetchConnectedUser(userToken: string): Promise<user> {
  if (!userToken) {
    throw new Error('Token utilisateur manquant');
  }

  if (isFakeModeEnabled()) {
    return userDataFake;
  }

  const data = await getJsonAuth<user>(apiConfig.endpoints.currentUser, userToken);
  return data;
}

export async function signInApi(login: string, password: string): Promise<AuthResponse> {
  if (isFakeModeEnabled()) {
    return userDataFakeAuthResponse;
  }
 try {
   const data = await postJson<AuthResponse, { login: string; password: string }>(
    apiConfig.endpoints.login,
    { login, password }
  );

  const token = typeof data?.access_token === 'string' ? data.access_token : '';

  if (!token) {
    throw new Error('Réponse invalide du serveur de connexion');
  }

  return data;
  
 } catch (error) {
  throw error;
 }
 
}

export async function signOutApi(userToken: string): Promise<void> {
  if (isFakeModeEnabled()) {
    return;
  }

  if (!userToken) {
    throw new Error('Token utilisateur manquant');
  }

  await postJsonAuth<void>(apiConfig.endpoints.logout, userToken);
}


export async function updatePasswordApi(userToken: string, oldPassword: string, newPassword: string): Promise<void> {
  if (isFakeModeEnabled()) {
    return;
  }

  if (!userToken) {
    throw new Error('Token utilisateur manquant');
  }

  await postJsonAuth<void>(apiConfig.endpoints.changePassword, userToken, { oldPassword, newPassword });
}
