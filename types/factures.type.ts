export type factureStatus = 'Payée' | 'En attente' | 'Impayée';

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
  label: string;
  quantity: number;
  unitPrice: number;
  quantityGratuite?: number;
  tauxRemise?: number;
  prixRemise?: number;
  tauxTVA?: number;
};


