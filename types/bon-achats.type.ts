import { meta } from "./other.type";

 
export type bonAchat = {
  id: string;
  dateExpBa: Date;
  dateBa: Date;
  numeroBa: string;
  etatBa: number;
  montantBa: number;
  CoutBa: number;
  uniqueUse: boolean;
  autreClientUse: boolean;
  uniqueAgence: boolean;
  nomAgence: string;
};

export type listBonAchats = {
  meta?: meta;
  data: bonAchat[];
};