import apiConfig from '@/config/api';
import { userDataFake } from '@/data/fakeDatas/user.fake';
import { isFakeModeEnabled } from '@/tools/tools';
import { user } from '@/types/user.type';
import { getJsonAuth } from './api-client';


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
