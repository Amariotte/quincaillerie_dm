import { meta } from "./other.type";

export type factureStatus = 'Soldée' | 'Non soldée' | 'Echue';

export const statusFactureColorMap: Record<factureStatus, string> = {
  'Soldée': '#16a34a',
  'Non soldée': '#f59e0b',
  'Echue': '#dc2626',
};


export type facture = {
  id: string;
  codeVente: string;
  descVente: string;
  nomSousCompte?: string;
  nomAgence?: string;
  nomCaisse?: string;
  operateurSaisie?: string;
  operateurValidation?: string;
  dateVente: Date;
  dateEchVente?: Date;
  dateLivSouhaite?: Date;
  lieuLivSouhaite?: string;
  soldeVente: number;
  nbProduits: number;
  totalRemise: number;
  totalHT: number;
  totalTaxe: number;
  totalNetPayer: number;
  fneUrl?: string;
  fneGeneree?: boolean;
  fneDate?: Date;
  fneRef?: string;
  status: factureStatus
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


export type listFactures = {
  meta: meta;
  data: facture[];
};

