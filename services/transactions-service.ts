import apiConfig from '@/config/api';
import { mouvementsFakeData } from '@/data/fakeDatas/mouvements.fake';
import { isFakeModeEnabled } from '@/tools/tools';
import { listMouvements } from '@/types/mouvements.type';
import { getJsonAuth } from './api-client';

const LIMIT = 20;


export async function getfetchRecentMouvements(token: string): Promise<listMouvements> {
    if (isFakeModeEnabled()) {
      return getRecentMouvementsFromFakeData();
    }

  const data = await getJsonAuth<listMouvements>(`${apiConfig.endpoints.mouvements}?size=${LIMIT}`, token);
  return data;
}

export function getRecentMouvementsFromFakeData(): listMouvements {
  return {
    ...mouvementsFakeData,
    data: mouvementsFakeData.data.slice(0, LIMIT)
  };
}


export async function getfetchMouvements(token: string): Promise<listMouvements> {
  
    if (isFakeModeEnabled()) {
      return getRecentMouvementsFromFakeData();
    }
  
  const data = await getJsonAuth<listMouvements>(`${apiConfig.endpoints.mouvements}`, token);
  return data;
}