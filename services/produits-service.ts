import apiConfig from '@/config/api';
import { produitsFakeData } from '@/data/fakeDatas/produits.fake';
import { isFakeModeEnabled } from '@/tools/tools';
import { listProduits } from '@/types/produits.type';
import { getJsonAuth } from './api-client';

export async function getfetchProduits(token: string): Promise<listProduits> {
  
    if (isFakeModeEnabled()) {
      return produitsFakeData;
    }
  
  const data = await getJsonAuth<listProduits>(`${apiConfig.endpoints.produits}`, token);
  return data;
}
