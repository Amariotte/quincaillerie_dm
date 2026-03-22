import { meta } from "./other.type";
import { detailsTransaction } from "./reglements.type";

export type commission = {
  id: string;
  baseCalculCom: number;
  tauxCom: number;
  typeCom: number;
  montCom: number;
  dateCom: Date;
  codeCom: string;
  descVente?: Date;
  nomSousCompte?: string;
  codeVente?: string;
  dateVente?: Date;

  nomAgence?: string;
  details?: detailsTransaction[];
  
};

	

export type listCommissions = {
  meta?: meta;
  data: commission[];
};

