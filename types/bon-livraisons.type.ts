import { meta } from "./other.type";

export type factureStatus = 'Soldée' | 'Non soldée' | 'Echue';

export const statusFactureColorMap: Record<factureStatus, string> = {
  'Soldée': '#16a34a',
  'Non soldée': '#f59e0b',
  'Echue': '#dc2626',
};


export type bonLivraison = {
  id: string;
  codeBL: string;
  dateBL: string;
  dateLivraison: string;
  descBL: string;
  descRecepBL: string;
  vehiculeLivreur: string;
  nomLivreur: string;
  lieuLivraison: string;
  nomRecepteur: string;
  numPieceRecepteur: string;
  libTypePiece: string;
  nomAgence: string;
  details?: detailsBonLivraison[];
};

export type listBonLivraisons = {
  meta?: meta;
  data: bonLivraison[];
};

export type detailsBonLivraison = {
  id: string;
  qteLivree: number;
  reference: string;
  designation: string;
}
