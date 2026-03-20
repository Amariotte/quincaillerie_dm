import { meta } from "./other.type";

export type typeDetails = 'Vente' | 'Décaissement' | 'Impayée';
export type statusEncaisse = 'Encaissé' | 'Non encaissé';


export type reglement = {
  id: string;
  codeReg: string;
  nomSousCompte?: string;
  nomAgence?: string;
  nomCompte?: string;
  operateurSaisie?: string;
  dateReg: Date;
  dateEncaissement?: Date;
  montantReg: number;
  descReg?: string;
  refReg?: string,
  nomModePaiement?: string;
  statusEncaisse?: statusEncaisse;
};

export type detailsReglement = {
  id: string;
  codeVente: string;
  nomClient: string;
  montantRegle: number;
  type: typeDetails;
};

export type listReglements = {
  meta?: meta;
  data: reglement[];
};


