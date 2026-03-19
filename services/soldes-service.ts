import apiConfig from '@/config/api';
import { soldeFake } from '@/data/fakeDatas/solde.fake';
import { isFakeModeEnabled } from '@/tools/tools';
import { SoldeResponse } from '@/types/solde.type';
import { getJsonAuth } from './api-client';


export async function fetchSoldeCompte(token: string): Promise<number> {

  if (isFakeModeEnabled()) {
    return getSoldeFromFakeData();
}

  const payload = await getJsonAuth<SoldeResponse>(apiConfig.endpoints.soldes, token);
  const rawBalance = payload?.solde;
  const parsedBalance = Number(rawBalance);

  if (Number.isNaN(parsedBalance)) {
    throw new Error('Format de solde invalide');
  }

  return parsedBalance;
}

export function getSoldeFromFakeData(): number {
    const parsedBalance = Number(soldeFake.solde);
    if (Number.isNaN(parsedBalance)) {
        throw new Error('Format de solde invalide');
    }

    return parsedBalance;
}
