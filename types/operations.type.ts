import { meta } from "./other.type";

export type typeOperation = 'Décaissement' | 'Encaissement';

export const typeMouvementColorMap: Record<typeOperation, string> = {
  'Décaissement': '#fe1818',
  'Encaissement': '#16a34a',
};

export type operation = {
  id: string;
  codeOp: string;
  dateOp: Date;
  descOp: string;
  solliciteurOp: string;
  montantOp: number;
  refOp?: string;
  depoOrBene: string;
  nomAgence?: string;
  nomSousCompte?: string;
  libRubrique?: string;
  libType?: typeOperation;
  nomModePaiement?: string;
};

export type listOperations = {      
  meta?: meta;
  data: operation[];
};
