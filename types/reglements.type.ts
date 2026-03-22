import { meta } from "./other.type";

export type typeDetails = 'Vente' | 'Décaissement';
export type statusEncaisse = 'Encaissé' | 'Non encaissé';

export const statusEncaisseColorMap: Record<statusEncaisse, string> = {
  'Encaissé': '#16a34a',
  'Non encaissé': '#dc2626',
};




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
  details?: detailsTransaction[];
};


export type detailsTransaction = {
  id: string;
  montantRegDoc: number;
  montantDoc: number;
  dateAction: Date;
  dateEchDoc: Date;
  dateDoc: Date;
  idDoc: string;
  codeDoc: string;
  typeDoc: typeDetails;
};

export type listReglements = {
  meta?: meta;
  data: reglement[];
};


