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
  totalHT: number;
  totalTaxe: number;
  totalNetPayer: number;
  totalBrutHT: number;
  totalBrutTTC: number;
  totalRemCialeHT: number;
  totalRemCialeTTC: number;
  status: factureStatus;
  fneUrl?: string;
  fneGeneree?: boolean;
  fneDate?: Date;
  fneRef?: string;
  details?: detailsFacture[];
};

export type detailsFacture = {
  id: string;
  qteLivree: number;
  prixVenteTTC: number;
  prixVenteHT: number;
  qteVendue: number;
  txTaxe: number;
  txRemise: number;
  remisePrix: number;
  montantRemiseHT: number;
  montantRemiseTTC: number;
  montantTTC: number;
  montantHT: number;
  montantBrutHT: number;
  montantBrutTTC: number;
  montantTaxe: number;
  qteGratuite: number;
  nomSuplementaire: string;
  reference: string;
  descPackage: string;
  designation: string;
}

export type listFactures = {
  meta?: meta;
  data: facture[];
};

