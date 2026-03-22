import apiConfig from '@/config/api';
import { bonAchatsFakeData, bonLivraisonsFakeData, commissionsFakeData, facturesFakeData, mouvementsFakeData, operationsFakeData, produitsFakeData, proformasFakeData, promotionsFakeData, reglementsFakeData, soldeFake, statsFake } from '@/data/datas.fake';
import { isFakeModeEnabled } from '@/tools/tools';
import { bonAchat, listBonAchats } from '@/types/bon-achats.type';
import { bonLivraison, listBonLivraisons } from '@/types/bon-livraisons.type';
import { commission, listCommissions } from '@/types/commissions.type';
import { devis, listDevis } from '@/types/devis.type';
import { facture, listFactures } from '@/types/factures.type';
import { listMouvements } from '@/types/mouvements.type';
import { listOperations } from '@/types/operations.type';
import { stat } from '@/types/other.type';
import { listProduits } from '@/types/produits.type';
import { listPromotions } from '@/types/promotions.type';
import { listReglements, reglement } from '@/types/reglements.type';
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

export async function getfetchDevis(token: string): Promise<listDevis> {

  if (isFakeModeEnabled()) {
    return proformasFakeData;
  }

  const d = await getJsonAuth<listDevis>(apiConfig.endpoints.devis, token);
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


export async function getfetchReglementById(token: string, id: string): Promise<reglement | null> {

  if (isFakeModeEnabled()) {
    return reglementsFakeData.data.filter(reglement => reglement.id === id).length > 0
      ? reglementsFakeData.data.filter(reglement => reglement.id === id)[0]
      : null;
  }

  const d = await getJsonAuth<reglement>(`${apiConfig.endpoints.reglements}/${id}`, token);

  return  d ;
}

export async function getfetchCommissionById(token: string, id: string): Promise<commission | null> {

  if (isFakeModeEnabled()) {
    return commissionsFakeData.data.filter(commission => commission.id === id).length > 0
      ? commissionsFakeData.data.filter(commission => commission.id === id)[0]
      : null;
  }

  const d = await getJsonAuth<commission>(`${apiConfig.endpoints.commissions}/${id}`, token);

  return  d ;
}


export async function getfetchBonAchatById(token: string, id: string): Promise<bonAchat | null> {

  if (isFakeModeEnabled()) {
    return bonAchatsFakeData.data.filter(bonAchat => bonAchat.id === id).length > 0
      ? bonAchatsFakeData.data.filter(bonAchat => bonAchat.id === id)[0]
      : null;
  }

  const d = await getJsonAuth<bonAchat>(`${apiConfig.endpoints.bonAchats}/${id}`, token);

  return  d ;
}


export async function getfetchDevisById(token: string, id: string): Promise<devis | null> {

  if (isFakeModeEnabled()) {
    return proformasFakeData.data.filter(devis => devis.id === id).length > 0
      ? proformasFakeData.data.filter(devis => devis.id === id)[0]
      : null;
  }

  const d = await getJsonAuth<devis>(`${apiConfig.endpoints.devis}/${id}`, token);

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

export async function getfetchBonLivraisons(token: string): Promise<listBonLivraisons> {
  
    if (isFakeModeEnabled()) {
      return bonLivraisonsFakeData;
    }
  
  const data = await getJsonAuth<listBonLivraisons>(`${apiConfig.endpoints.bonLivraisons}`, token);
  return data;
}

export async function getfetchBonLivraisonById(token: string, id: string): Promise<bonLivraison | null> {
  
    if (isFakeModeEnabled()) {
      return bonLivraisonsFakeData.data.filter(bonLivraison => bonLivraison.id === id).length > 0
        ? bonLivraisonsFakeData.data.filter(bonLivraison => bonLivraison.id === id)[0]
        : null;
    }
  
  const data = await getJsonAuth<bonLivraison>(`${apiConfig.endpoints.bonLivraisons}/${id}`, token);
  return data;
}