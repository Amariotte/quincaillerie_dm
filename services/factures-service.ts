import apiConfig from '@/config/api';
import { facturesFakeData } from '@/data/fakeDatas/factures.fake';
import { isFakeModeEnabled } from '@/tools/tools';
import { listFactures } from '@/types/factures.type';
import { getJsonAuth } from './api-client';


export async function getFactures(token: string): Promise<listFactures> {

  if (isFakeModeEnabled()) {
    return getFacturesFromFakeData();
  }

  const d = await getJsonAuth<listFactures>(apiConfig.endpoints.factures, token);
  return  d ;
}

export function getFacturesFromFakeData(): listFactures {
    return facturesFakeData;
}

