import apiConfig from '@/config/api';
import { bonAchatsFakeData, commissionsFakeData, facturesFakeData, mouvementsFakeData, operationsFakeData, produitsFakeData, promotionsFakeData, reglementsFakeData, soldeFake, statsFake } from '@/data/datas.fake';
import { isFakeModeEnabled } from '@/tools/tools';
import { listBonAchats } from '@/types/bon-achats.type';
import { listCommissions } from '@/types/commissions.type';
import { facture, listFactures } from '@/types/factures.type';
import { listMouvements } from '@/types/mouvements.type';
import { listOperations } from '@/types/operations.type';
import { stat } from '@/types/other.type';
import { listProduits } from '@/types/produits.type';
import { listPromotions } from '@/types/promotions.type';
import { listReglements } from '@/types/reglements.type';
import { SoldeResponse } from '@/types/solde.type';
import { getJsonAuth } from './api-client';

const LIMIT_RECENT_TRANSACTIONS = 20;


export function getSoldeFromFakeData(): number {
    const parsedBalance = Number(soldeFake.solde);
    if (Number.isNaN(parsedBalance)) {
        throw new Error('Format de solde invalide');
    }

    return parsedBalance;
}

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


export async function getfetchPromotions(token: string): Promise<listPromotions> {
  
    if (isFakeModeEnabled()) {
      return promotionsFakeData;
    }
  
  const data = await getJsonAuth<listPromotions>(`${apiConfig.endpoints.promotions}`, token);
  return data;
}

export async function getfetchProduits(token: string): Promise<listProduits> {
  
    if (isFakeModeEnabled()) {
      return produitsFakeData;
    }
  
  const data = await getJsonAuth<listProduits>(`${apiConfig.endpoints.produits}`, token);
  return data;
}

export async function getfetchBonAchats(token: string): Promise<listBonAchats> {
  
    if (isFakeModeEnabled()) {
      return bonAchatsFakeData;
    }
  
  const data = await getJsonAuth<listBonAchats>(`${apiConfig.endpoints.bonAchats}`, token);
  return data;
}

export async function getStats(token: string): Promise<stat> {

  if (isFakeModeEnabled()) {
    return statsFake;
}

  const payload = await getJsonAuth<stat>(apiConfig.endpoints.stats, token);
  return payload;
}


export async function getfetchFactures(token: string): Promise<listFactures> {

  if (isFakeModeEnabled()) {
    return facturesFakeData;
  }

  const d = await getJsonAuth<listFactures>(apiConfig.endpoints.factures, token);
  return  d ;
}

export async function getfetchFactureById(token: string, id: string): Promise<facture | null> {

  if (isFakeModeEnabled()) {
    return facturesFakeData.data.filter(facture => facture.id === id).length > 0
      ? facturesFakeData.data.filter(facture => facture.id === id)[0]
      : null;
  }

  const d = await getJsonAuth<facture>(`${apiConfig.endpoints.factures}/${id}`, token);
  return  d ;
}

export async function getfetchOperations(token: string): Promise<listOperations> {

  if (isFakeModeEnabled()) {
    return operationsFakeData;
  }

  const d = await getJsonAuth<listOperations>(apiConfig.endpoints.operations, token);
  return  d ;
}



export async function getfetchReglements(token: string): Promise<listReglements> {
  
    if (isFakeModeEnabled()) {
      return reglementsFakeData;
    }
  
  const data = await getJsonAuth<listReglements>(`${apiConfig.endpoints.reglements}`, token);
  return data;
}

export async function getfetchRecentMouvements(token: string): Promise<listMouvements> {
    if (isFakeModeEnabled()) {
      return getRecentMouvementsFromFakeData();
    }

  const data = await getJsonAuth<listMouvements>(`${apiConfig.endpoints.mouvements}?size=${LIMIT_RECENT_TRANSACTIONS}`, token);
  return data;
}

export function getRecentMouvementsFromFakeData(): listMouvements {
  return {
    ...mouvementsFakeData,
    data: mouvementsFakeData.data.slice(0, LIMIT_RECENT_TRANSACTIONS)
  };
}


export async function getfetchMouvements(token: string): Promise<listMouvements> {
  
    if (isFakeModeEnabled()) {
      return getRecentMouvementsFromFakeData();
    }
  
  const data = await getJsonAuth<listMouvements>(`${apiConfig.endpoints.mouvements}`, token);
  return data;
}

export async function getfetchCommissions(token: string): Promise<listCommissions> {
  
    if (isFakeModeEnabled()) {
      return commissionsFakeData;
    }
  
  const data = await getJsonAuth<listCommissions>(`${apiConfig.endpoints.commissions}`, token);
  return data;
}