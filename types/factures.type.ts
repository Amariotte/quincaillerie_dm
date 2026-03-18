export type factureStatus = 'Soldée' | 'Non soldée' | 'Impayée';

export const statusFactureColorMap: Record<factureStatus, string> = {
  'Soldée': '#16a34a',
  'Non soldée': '#f59e0b',
  'Impayée': '#dc2626',
};


export type facture = {
  id: string;
  codeVente: string;
  nomSousCompte?: string;
  nomAgence?: string;
  nomCaisse?: string;
  operateurSaisie?: string;
  operateurValidation?: string;
  dateVente: string;
  dateEcheanceVente?: string;
  montant: number;
  status: factureStatus;
  nbProduits: number;
  fneURL?: string;
  fneDate?: string;
  fneReference?: string
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


