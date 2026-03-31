import apiConfig from "@/config/api";
import {
  bonAchatsFakeData,
  bonLivraisonsFakeData,
  commissionsFakeData,
  dataChartsFakeData,
  facturesFakeData,
  mouvementsFakeData,
  operationsFakeData,
  produitsFakeData,
  proformasFakeData,
  promotionsFakeData,
  reglementsFakeData,
  soldeFake,
  sousComptesFakeData,
  statsFake,
} from "@/data/datas.fake";
import {
  SOUS_COMPTES_BALANCES_CACHE_KEY,
  getCacheData,
  setCacheData,
} from "@/services/cache-service";
import { isModeDemoEnabled } from "@/tools/tools";
import { bonAchat, listBonAchats } from "@/types/bon-achats.type";
import { bonLivraison, listBonLivraisons } from "@/types/bon-livraisons.type";
import { commission, listCommissions } from "@/types/commissions.type";
import { devis, devisLigneEdit, listDevis } from "@/types/devis.type";
import { facture, listFactures } from "@/types/factures.type";
import { listMouvements } from "@/types/mouvements.type";
import { listOperations } from "@/types/operations.type";
import { dataChart, stat } from "@/types/other.type";
import { listProduits } from "@/types/produits.type";
import { listPromotions, promotion } from "@/types/promotions.type";
import { listReglements, reglement } from "@/types/reglements.type";
import { SoldeResponse } from "@/types/solde.type";
import { listSousComptes } from "@/types/sousCompte.type";
import { getJsonAuth, postJsonAuth } from "./api-client";

const LIMIT_RECENT_TRANSACTIONS = 20;
type SousCompteBalanceCache = Record<string, number>;

function parseSoldeValue(
  rawBalance: number | string | null | undefined,
): number {
  const parsedBalance = Number(rawBalance);

  if (Number.isNaN(parsedBalance)) {
    throw new Error("Format de solde invalide");
  }

  return parsedBalance;
}

function tryParseSoldeValue(
  rawBalance: number | string | null | undefined,
): number | null {
  if (rawBalance === null || rawBalance === undefined || rawBalance === "") {
    return null;
  }

  const parsedBalance = Number(rawBalance);
  return Number.isFinite(parsedBalance) ? parsedBalance : null;
}

export function getSoldeFromFakeData(): number {
  return parseSoldeValue(soldeFake.solde);
}

export async function fetchSoldeCompte(token: string): Promise<number> {
  if (isModeDemoEnabled()) {
    return getSoldeFromFakeData();
  }

  const payload = await getJsonAuth<SoldeResponse>(
    apiConfig.endpoints.soldes,
    token,
  );
  return parseSoldeValue(payload?.solde);
}

export async function fetchSousCompteSolde(
  token: string,
  sousCompteId: string,
): Promise<number> {
  if (isModeDemoEnabled()) {
    const fakeSousCompte = sousComptesFakeData.data.find(
      (sousCompte) => sousCompte.id === sousCompteId,
    );

    return parseSoldeValue(fakeSousCompte?.solde);
  }

  const payload = await getJsonAuth<SoldeResponse>(
    `${apiConfig.endpoints.sousComptes}/${sousCompteId}/solde`,
    token,
  );

  return parseSoldeValue(payload?.solde);
}

export async function getfetchPromotions(
  token: string,
): Promise<listPromotions> {
  if (isModeDemoEnabled()) {
    return promotionsFakeData;
  }

  const data = await getJsonAuth<listPromotions>(
    `${apiConfig.endpoints.promotions}`,
    token,
  );
  return data;
}

export async function getfetchProduits(token: string): Promise<listProduits> {
  if (isModeDemoEnabled()) {
    return produitsFakeData;
  }

  const data = await getJsonAuth<listProduits>(
    `${apiConfig.endpoints.produits}`,
    token,
  );
  return data;
}

export async function getfetchSousComptes(
  token: string,
): Promise<listSousComptes> {
  if (isModeDemoEnabled()) {
    return sousComptesFakeData;
  }

  const data = await getJsonAuth<listSousComptes>(
    `${apiConfig.endpoints.sousComptes}`,
    token,
  );

  const cachedBalances =
    (await getCacheData<SousCompteBalanceCache>(
      SOUS_COMPTES_BALANCES_CACHE_KEY,
    )) ?? {};
  const nextBalanceCache: SousCompteBalanceCache = { ...cachedBalances };

  const normalizedSousComptes = data.data.map((item) => {
    const inlineBalance = tryParseSoldeValue(item.solde);
    const cachedBalance = tryParseSoldeValue(cachedBalances[String(item.id)]);
    const resolvedBalance = inlineBalance ?? cachedBalance;

    if (inlineBalance !== null) {
      nextBalanceCache[String(item.id)] = inlineBalance;
    }

    return {
      ...item,
      solde: resolvedBalance,
    };
  });

  const sousCompteIdsToFetch = normalizedSousComptes
    .filter((item) => item.solde === null)
    .map((item) => String(item.id));

  if (sousCompteIdsToFetch.length === 0) {
    await setCacheData(SOUS_COMPTES_BALANCES_CACHE_KEY, nextBalanceCache);
    return {
      ...data,
      data: normalizedSousComptes,
    };
  }

  const sousComptesWithBalance = await Promise.all(
    normalizedSousComptes.map(async (item) => {
      if (item.solde !== null) {
        return item;
      }

      try {
        const solde = await fetchSousCompteSolde(token, String(item.id));
        nextBalanceCache[String(item.id)] = solde;
        return {
          ...item,
          solde,
        };
      } catch {
        return {
          ...item,
          solde: null,
        };
      }
    }),
  );

  await setCacheData(SOUS_COMPTES_BALANCES_CACHE_KEY, nextBalanceCache);

  return {
    ...data,
    data: sousComptesWithBalance,
  };
}

export async function getfetchBonAchats(token: string): Promise<listBonAchats> {
  if (isModeDemoEnabled()) {
    return bonAchatsFakeData;
  }

  const data = await getJsonAuth<listBonAchats>(
    `${apiConfig.endpoints.bonAchats}`,
    token,
  );
  return data;
}

export async function getStats(token: string): Promise<stat> {
  if (isModeDemoEnabled()) {
    return statsFake;
  }

  const payload = await getJsonAuth<stat>(apiConfig.endpoints.stats, token);
  return payload;
}

export async function getfetchFactures(token: string): Promise<listFactures> {
  if (isModeDemoEnabled()) {
    return facturesFakeData;
  }

  const d = await getJsonAuth<listFactures>(
    apiConfig.endpoints.factures,
    token,
  );
  return d;
}

export async function getfetchDevis(token: string): Promise<listDevis> {
  if (isModeDemoEnabled()) {
    return proformasFakeData;
  }

  const d = await getJsonAuth<listDevis>(apiConfig.endpoints.devis, token);
  return d;
}

export async function getfetchFactureById(
  token: string,
  id: string,
): Promise<facture | null> {
  if (isModeDemoEnabled()) {
    return facturesFakeData.data.filter((facture) => facture.id === id).length >
      0
      ? facturesFakeData.data.filter((facture) => facture.id === id)[0]
      : null;
  }

  const d = await getJsonAuth<facture>(
    `${apiConfig.endpoints.factures}/${id}`,
    token,
  );

  return d;
}

export async function getfetchReglementById(
  token: string,
  id: string,
): Promise<reglement | null> {
  if (isModeDemoEnabled()) {
    return reglementsFakeData.data.filter((reglement) => reglement.id === id)
      .length > 0
      ? reglementsFakeData.data.filter((reglement) => reglement.id === id)[0]
      : null;
  }

  const d = await getJsonAuth<reglement>(
    `${apiConfig.endpoints.reglements}/${id}`,
    token,
  );

  return d;
}

export async function getfetchCommissionById(
  token: string,
  id: string,
): Promise<commission | null> {
  if (isModeDemoEnabled()) {
    return commissionsFakeData.data.filter((commission) => commission.id === id)
      .length > 0
      ? commissionsFakeData.data.filter((commission) => commission.id === id)[0]
      : null;
  }

  const d = await getJsonAuth<commission>(
    `${apiConfig.endpoints.commissions}/${id}`,
    token,
  );

  return d;
}

export async function getfetchBonAchatById(
  token: string,
  id: string,
): Promise<bonAchat | null> {
  if (isModeDemoEnabled()) {
    return bonAchatsFakeData.data.filter((bonAchat) => bonAchat.id === id)
      .length > 0
      ? bonAchatsFakeData.data.filter((bonAchat) => bonAchat.id === id)[0]
      : null;
  }

  const d = await getJsonAuth<bonAchat>(
    `${apiConfig.endpoints.bonAchats}/${id}`,
    token,
  );

  return d;
}

export async function getfetchDevisById(
  token: string,
  id: string,
): Promise<devis | null> {
  if (isModeDemoEnabled()) {
    return proformasFakeData.data.filter((devis) => devis.id === id).length > 0
      ? proformasFakeData.data.filter((devis) => devis.id === id)[0]
      : null;
  }

  const d = await getJsonAuth<devis>(
    `${apiConfig.endpoints.devis}/${id}`,
    token,
  );

  return d;
}

export async function postDevisLigne(
  token: string,
  ligne: devisLigneEdit,
  devisId?: string,
): Promise<devis | null> {
  if (isModeDemoEnabled()) {
    if (!devisId) {
      return null;
    }

    const found = proformasFakeData.data.find((devis) => devis.id === devisId);
    return found ?? null;
  }

  const endpoint = devisId
    ? `${apiConfig.endpoints.devis}/${devisId}`
    : `${apiConfig.endpoints.devis}`;

  const d = await postJsonAuth<devis, devisLigneEdit>(endpoint, token, ligne);
  return d;
}

export async function updateDevisLigne(
  token: string,
  devisId: string,
  ligneId: string,
  ligne: devisLigneEdit,
): Promise<devis | null> {
  if (isModeDemoEnabled()) {
    const found = proformasFakeData.data.find((devis) => devis.id === devisId);
    return found ?? null;
  }

  const d = await postJsonAuth<devis, devisLigneEdit>(
    `${apiConfig.endpoints.devis}/${devisId}/lignes/${ligneId}`,
    token,
    ligne,
  );

  return d;
}

export async function deleteDevisLigne(
  token: string,
  devisId: string,
  ligneId: string,
): Promise<devis | null> {
  if (isModeDemoEnabled()) {
    const found = proformasFakeData.data.find((devis) => devis.id === devisId);
    return found ?? null;
  }

  const d = await getJsonAuth<devis | null>(
    `${apiConfig.endpoints.devis}/${devisId}/lignes/${ligneId}/delete`,
    token,
  );

  return d;
}

export async function deleteDevis(token: string, id: string): Promise<boolean> {
  if (isModeDemoEnabled()) {
    const initialLength = proformasFakeData.data.length;
    proformasFakeData.data = proformasFakeData.data.filter(
      (devis) => devis.id !== id,
    );
    return proformasFakeData.data.length < initialLength;
  }

  await getJsonAuth<null>(`${apiConfig.endpoints.devis}/${id}/delete`, token);
  return true;
}

export async function getfetchOperations(
  token: string,
): Promise<listOperations> {
  if (isModeDemoEnabled()) {
    return operationsFakeData;
  }

  const d = await getJsonAuth<listOperations>(
    apiConfig.endpoints.operations,
    token,
  );
  return d;
}

export async function getfetchReglements(
  token: string,
): Promise<listReglements> {
  if (isModeDemoEnabled()) {
    return reglementsFakeData;
  }

  const data = await getJsonAuth<listReglements>(
    `${apiConfig.endpoints.reglements}`,
    token,
  );
  return data;
}

export async function getfetchStatistiques(
  token: string,
): Promise<dataChart[]> {
  if (isModeDemoEnabled()) {
    return dataChartsFakeData;
  }

  const data = await getJsonAuth<dataChart[]>(
    `${apiConfig.endpoints.statistiques}`,
    token,
  );
  return data;
}

export async function getfetchRecentMouvements(
  token: string,
): Promise<listMouvements> {
  if (isModeDemoEnabled()) {
    return getRecentMouvementsFromFakeData();
  }

  const data = await getJsonAuth<listMouvements>(
    `${apiConfig.endpoints.mouvements}?size=${LIMIT_RECENT_TRANSACTIONS}`,
    token,
  );
  return data;
}

export function getRecentMouvementsFromFakeData(): listMouvements {
  return {
    ...mouvementsFakeData,
    data: mouvementsFakeData.data.slice(0, LIMIT_RECENT_TRANSACTIONS),
  };
}

export async function getfetchMouvements(
  token: string,
): Promise<listMouvements> {
  if (isModeDemoEnabled()) {
    return mouvementsFakeData;
  }

  const data = await getJsonAuth<listMouvements>(
    `${apiConfig.endpoints.mouvements}`,
    token,
  );
  return data;
}

export async function getfetchCommissions(
  token: string,
): Promise<listCommissions> {
  if (isModeDemoEnabled()) {
    return commissionsFakeData;
  }

  const data = await getJsonAuth<listCommissions>(
    `${apiConfig.endpoints.commissions}`,
    token,
  );
  return data;
}

export async function getfetchBonLivraisons(
  token: string,
): Promise<listBonLivraisons> {
  if (isModeDemoEnabled()) {
    return bonLivraisonsFakeData;
  }

  const data = await getJsonAuth<listBonLivraisons>(
    `${apiConfig.endpoints.bonLivraisons}`,
    token,
  );
  return data;
}

export async function getfetchBonLivraisonById(
  token: string,
  id: string,
): Promise<bonLivraison | null> {
  if (isModeDemoEnabled()) {
    return bonLivraisonsFakeData.data.filter(
      (bonLivraison) => bonLivraison.id === id,
    ).length > 0
      ? bonLivraisonsFakeData.data.filter(
          (bonLivraison) => bonLivraison.id === id,
        )[0]
      : null;
  }

  const data = await getJsonAuth<bonLivraison>(
    `${apiConfig.endpoints.bonLivraisons}/${id}`,
    token,
  );
  return data;
}

export async function getfetchPromotionById(
  token: string,
  id: string,
): Promise<promotion | null> {
  if (isModeDemoEnabled()) {
    return promotionsFakeData.data.filter((promotion) => promotion.id === id)
      .length > 0
      ? promotionsFakeData.data.filter((promotion) => promotion.id === id)[0]
      : null;
  }

  const data = await getJsonAuth<promotion>(
    `${apiConfig.endpoints.promotions}/${id}`,
    token,
  );
  return data;
}

export async function postValidateDevis(
  token: string,
  id: string,
): Promise<devis | null> {
  if (isModeDemoEnabled()) {
    const initialLength = proformasFakeData.data.length;
    proformasFakeData.data = proformasFakeData.data.filter(
      (devis) => devis.id !== id,
    );
    return proformasFakeData.data.length < initialLength
      ? (proformasFakeData.data.find((devis) => devis.id === id) ?? null)
      : null;
  }

  const d = await getJsonAuth<devis>(
    `${apiConfig.endpoints.devis}/${id}/validate`,
    token,
  );
  return d;
}
