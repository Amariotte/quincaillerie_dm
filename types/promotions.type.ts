import { meta } from "./other.type";

export type promotionStatus = 'En cours' | 'A venir';

export const statusPromotionColorMap: Record<promotionStatus, string> = {
  'En cours': '#16a34a',
  'A venir': '#f59e0b',
};

export type promotion = {
  id: string;
  description?: string;
  nomProduit?: string;
  libelle?: string;
  dateDebut?: Date;
  dateFin?: Date;
  nbMax: number;
  status: promotionStatus
};


export type detailsFacture = {
  id: string;
  codeProduit: string;
  nomProduit: string;
  detailsPackage?: string;
  qteFacturee: number;
  prixHT?: number;
  prixTTC: number;
  qteGratuite?: number;
  tauxRemise?: number;
  prixRemise?: number;
  remise?: number;
  tauxTVA?: number;
  montantTVA?: number;
};


export type listPromotions = {
  meta: meta;
  data: promotion[];
};

