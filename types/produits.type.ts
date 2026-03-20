import { meta } from "./other.type";

 
export type Produit = {
  id: string;
  reference: string;
  designation: string;
  nomfamille: string;
  imageUrl?: string;
  unit?: string;
  prixVenteTTC: number;
  txTva?: number;
  prixVenteHT?: number;
};


export type listProduits = {
  meta?: meta;
  data: Produit[];
};
