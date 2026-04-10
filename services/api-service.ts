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
import { isModeDemoEnabled } from "@/tools/tools";
import { bonAchat, listBonAchats } from "@/types/bon-achats.type";
import { bonLivraison, listBonLivraisons } from "@/types/bon-livraisons.type";
import { commission, listCommissions } from "@/types/commissions.type";
import {
  deleteDevisLigneEdit,
  devis,
  devisLigneEdit,
  listDevis,
} from "@/types/devis.type";
import { facture, listFactures } from "@/types/factures.type";
import { listMouvements } from "@/types/mouvements.type";
import { listOperations } from "@/types/operations.type";
import {
  dataChart,
  meta,
  PaginatedResponse,
  PaginationParams,
  stat,
} from "@/types/other.type";
import { listProduits } from "@/types/produits.type";
import { listPromotions, promotion } from "@/types/promotions.type";
import { listReglements, reglement } from "@/types/reglements.type";
import { SoldeResponse } from "@/types/solde.type";
import { listSousComptes } from "@/types/sousCompte.type";
import { getJsonAuth, postJsonAuth } from "./api-client";

const LIMIT_RECENT_TRANSACTIONS = process.env
  .EXPO_PUBLIC_NBRE_RECENT_TRANSACTIONS
  ? Number(process.env.EXPO_PUBLIC_NBRE_RECENT_TRANSACTIONS)
  : 20;
const DEFAULT_PAGE_SIZE = 20;

function normalizePaginationParams(
  params?: PaginationParams,
): Required<PaginationParams> {
  const page = Number.isFinite(params?.page)
    ? Math.max(1, Math.floor(params?.page ?? 1))
    : 1;
  const size = Number.isFinite(params?.size)
    ? Math.max(1, Math.floor(params?.size ?? DEFAULT_PAGE_SIZE))
    : DEFAULT_PAGE_SIZE;

  return { page, size };
}

function buildPaginationMeta(total: number, params?: PaginationParams): meta {
  const normalized = normalizePaginationParams(params);
  const totalPages = Math.max(1, Math.ceil(total / normalized.size));
  const page = Math.min(normalized.page, totalPages);

  return {
    page,
    next: page < totalPages ? page + 1 : page,
    totalPages,
    total,
    size: normalized.size,
  };
}

function buildPaginatedEndpoint(
  endpoint: string,
  params?: PaginationParams,
): string {
  const normalized = normalizePaginationParams(params);
  const separator = endpoint.includes("?") ? "&" : "?";

  return `${endpoint}${separator}page=${normalized.page}&size=${normalized.size}`;
}

function paginateFakeResponse<
  TItem,
  TResponse extends PaginatedResponse<TItem>,
>(source: TResponse, params?: PaginationParams): TResponse {
  const paginationMeta = buildPaginationMeta(source.data.length, params);
  const startIndex = (paginationMeta.page - 1) * paginationMeta.size;

  return {
    ...source,
    meta: paginationMeta,
    data: source.data.slice(startIndex, startIndex + paginationMeta.size),
  } as TResponse;
}

async function fetchPaginatedList<
  TItem,
  TResponse extends PaginatedResponse<TItem>,
>(
  token: string,
  endpoint: string,
  params: PaginationParams | undefined,
  fakeData: TResponse,
): Promise<TResponse> {
  if (!params) {
    if (isModeDemoEnabled()) {
      return fakeData;
    }

    const firstPage = await getJsonAuth<TResponse>(
      buildPaginatedEndpoint(endpoint, { page: 1, size: DEFAULT_PAGE_SIZE }),
      token,
    );

    if (!firstPage?.meta) {
      return {
        ...firstPage,
        meta: buildPaginationMeta(firstPage?.data?.length ?? 0, params),
      } as TResponse;
    }

    const totalPages = Math.max(1, firstPage.meta.totalPages || 1);

    if (totalPages === 1) {
      return firstPage;
    }

    let mergedItems = Array.isArray(firstPage.data) ? [...firstPage.data] : [];

    for (let page = 2; page <= totalPages; page += 1) {
      const nextPage = await getJsonAuth<TResponse>(
        buildPaginatedEndpoint(endpoint, {
          page,
          size: firstPage.meta.size || DEFAULT_PAGE_SIZE,
        }),
        token,
      );

      if (Array.isArray(nextPage?.data) && nextPage.data.length > 0) {
        mergedItems = [...mergedItems, ...nextPage.data];
      }
    }

    return {
      ...firstPage,
      data: mergedItems,
      meta: buildPaginationMeta(mergedItems.length, {
        page: 1,
        size: mergedItems.length || 1,
      }),
    } as TResponse;
  }

  if (isModeDemoEnabled()) {
    return paginateFakeResponse(fakeData, params);
  }

  const response = await getJsonAuth<TResponse>(
    buildPaginatedEndpoint(endpoint, params),
    token,
  );

  if (response?.meta) {
    return response;
  }

  return {
    ...response,
    meta: buildPaginationMeta(response?.data?.length ?? 0, params),
  } as TResponse;
}

function parseSoldeValue(
  rawBalance: number | string | null | undefined,
): number {
  const parsedBalance = Number(rawBalance);

  if (Number.isNaN(parsedBalance)) {
    throw new Error("Format de solde invalide");
  }

  return parsedBalance;
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
    return getSoldeFromFakeData();
  }

  const payload = await getJsonAuth<SoldeResponse>(
    `${apiConfig.endpoints.sousComptes}/${sousCompteId}/soldes`,
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
    token,
    `${apiConfig.endpoints.promotions}`,
  );
  return data;
}

export async function getfetchProduits(
  token: string,
  params?: PaginationParams,
): Promise<listProduits> {
  const data = await fetchPaginatedList(
    token,
    `${apiConfig.endpoints.produits}`,
    params,
    produitsFakeData,
  );
  return data;
}

export async function getAllProduits(token: string): Promise<listProduits> {
  if (isModeDemoEnabled()) {
    return produitsFakeData;
  }

  const data = await getJsonAuth<listProduits>(
    token,
    `${apiConfig.endpoints.produits}`,
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
    token,
    `${apiConfig.endpoints.sousComptes}`,
  );
  return data;
}

export async function getfetchBonAchats(token: string): Promise<listBonAchats> {
  if (isModeDemoEnabled()) {
    return bonAchatsFakeData;
  }

  const data = await getJsonAuth<listBonAchats>(
    token,
    `${apiConfig.endpoints.bonAchats}`,
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

export async function getfetchFactures(
  token: string,
  params?: PaginationParams,
): Promise<listFactures> {
  const d = await fetchPaginatedList(
    token,
    apiConfig.endpoints.factures,
    params,
    facturesFakeData,
  );
  return d;
}

export async function getfetchDevis(
  token: string,
  params?: PaginationParams,
): Promise<listDevis> {
  const d = await fetchPaginatedList(
    token,
    apiConfig.endpoints.devis,
    params,
    proformasFakeData,
  );
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
  ligne: deleteDevisLigneEdit,
): Promise<devis | null> {
  if (isModeDemoEnabled()) {
    const found = proformasFakeData.data.find((devis) => devis.id === devisId);
    return found ?? null;
  }

  const endpoint = `${apiConfig.endpoints.devis}/${devisId}/lignes/${ligneId}/delete`;
  const d = await postJsonAuth<devis, deleteDevisLigneEdit>(
    endpoint,
    token,
    ligne,
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

  const data = await getJsonAuth<listOperations>(
    token,
    `${apiConfig.endpoints.operations}`,
  );
  return data;
}

export async function getfetchReglements(
  token: string,
): Promise<listReglements> {
  if (isModeDemoEnabled()) {
    return reglementsFakeData;
  }

  const data = await getJsonAuth<listReglements>(
    token,
    `${apiConfig.endpoints.reglements}`,
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
  params?: PaginationParams,
): Promise<listMouvements> {
  const data = await fetchPaginatedList(
    token,
    `${apiConfig.endpoints.mouvements}`,
    params,
    mouvementsFakeData,
  );
  return data;
}

export async function getfetchCommissions(
  token: string,
  params?: PaginationParams,
): Promise<listCommissions> {
  const data = await fetchPaginatedList(
    token,
    `${apiConfig.endpoints.commissions}`,
    params,
    commissionsFakeData,
  );
  return data;
}

export async function getfetchBonLivraisons(
  token: string,
  params?: PaginationParams,
): Promise<listBonLivraisons> {
  const data = await fetchPaginatedList(
    token,
    `${apiConfig.endpoints.bonLivraisons}`,
    params,
    bonLivraisonsFakeData,
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

export async function postSaveDevis(
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
    `${apiConfig.endpoints.devis}/${id}/save`,
    token,
  );
  return d;
}
