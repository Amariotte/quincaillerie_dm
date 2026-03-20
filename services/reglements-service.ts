import apiConfig from '@/config/api';
import { produitsFakeData } from '@/data/fakeDatas/produits.fake';
import { isFakeModeEnabled } from '@/tools/tools';
import { listReglements } from '@/types/reglements.type';
import { getJsonAuth } from './api-client';

export async function getfetchReglements(token: string): Promise<listReglements> {
  
    if (isFakeModeEnabled()) {
      return produitsFakeData;
    }
  
  const data = await getJsonAuth<listReglements>(`${apiConfig.endpoints.reglements}`, token);
  return data;
}
