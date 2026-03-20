import { meta } from "./other.type";

export type devisStatus = 'En saisie' | 'Validé' | 'Transformé';

export const statusDevisColorMap: Record<devisStatus, string> = {
  'En saisie': '#f50b0b',
  'Validé': '#e47e08',
  'Transformé': '#16a34a',
};


export type devis = {
  id: string;
  codeDevis: string;
  nomSousCompte?: string;
  nomAgence?: string;
  operateurSaisie?: string;
  operateurValidation?: string;
  dateDevis: string;
  montant: number;
  status: devisStatus;
  totalRemCciale: number;
  totalRemCialeTTC: number;
  totalRemCialeHT: number;
  totalTaxe: number;
  totalNetPayer: number;
  totalHTBrut: number;
  totalHT: number;
  totalTTCBrut: number;
  nbProduits: number;
  details?: detailsDevis[];
};

export type detailsDevis = {
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

export type listDevis = {
  meta?:meta;
  data: devis[];
};

export type QuoteClient = {
  id: string;
  name: string;
  sector: string;
};

export type QuoteProduct = {
  id: string;
  label: string;
  unit: string;
  price: number;
};

