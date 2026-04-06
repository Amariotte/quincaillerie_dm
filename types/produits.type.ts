import { meta } from "./other.type";

export type Produit = {
  id: string;
  reference: string;
  designation: string;
  nomfamille: string;
  prixVenteTTC: number;
  txTva?: number;
  prixVenteHT?: number;
  detailPackage?: detailPackage[];
};


export type detailPackage = {
  id: string;
  nom: string;
  qte: number; 
  puVenteTTC: number;
  puAchatHT: number;
  taxe: number;
};


export type listProduits = {
  meta?: meta;
  data: Produit[];
};
