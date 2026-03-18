export type typeDetails = 'Vente' | 'Décaissement' | 'Impayée';

export type reglement = {
  id: string;
  codeReg: string;
  nomSousCompte?: string;
  nomAgence?: string;
  nomCompte?: string;
  operateurSaisie?: string;
  dateReg: string;
  montant: number;
  soldeReg: number;
  refReg?: string,
  modePaiement?: string;
  isEncaisse?: boolean;
};

export type detailsReglement = {
  id: string;
  codeVente: string;
  nomClient: string;
  montantRegle: number;
  type: typeDetails;
};


