import { meta } from "./other.type";

export type commission = {
  id: string;
  baseCalculCom: number;
  tauxCom: number;
  typeCom: number;
  montCom: number;
  dateCom: Date;
  codeCom: string;
  descVente?: Date;
  dateEchVente?: Date;
  nomSousCompte?: string;
  codeVente?: string;
  nomAgence?: string;
  nbProduits?: number;
};

	

export type listCommissions = {
  meta?: meta;
  data: commission[];
};

