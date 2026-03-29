import { meta } from "./other.type";

export type promotionStatus = 'En cours' | 'A venir' | 'Terminée';

export const statusPromotionColorMap: Record<promotionStatus, string> = {
  'En cours': '#16a34a',
  'A venir': '#f59e0b',
   'Terminée': '#6b7280'
};

export type promotion = {
  id: string;
  description?: string;
  nomProduit?: string;
  libelle?: string;
  dateDebut?: Date;
  dateFin?: Date;
  nbMax: number;
  status: promotionStatus
  details?: promotionDetail[];
};


export type promotionDetail = {
 valeurMaxi?: number;
  valeurMini?: number;
  gains?: number;
  type?: number;
  description?: string;
  nomProduit?: string;
  libelle?: string;
};



export type listPromotions = {
  meta: meta;
  data: promotion[];
};

