export type devisStatus = 'En saisie' | 'Validé' | 'Transformé';

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
  totalTaxeEncaisse: number;
  totalTaxe: number;
  totalHTBrut: number;
  totalTTCBrut: number;
  nbProduits: number;
};


export type detailsDevis = {
  id: string;
  codeProduit: string;
  nomProduit: string;
  detailsPackage?: string;
  qteFacturee: number;
  prixHT: number;
  prixTTC: number;
  qteGratuite?: number;
  tauxRemise?: number;
  prixRemise?: number;
  remise?: number;
  tauxTVA?: number;
  montantTVA?: number;
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

