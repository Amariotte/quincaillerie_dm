import { meta } from "./other.type";

export type sousCompte = {
  id: string;
  nom: string;
  description: string;
  ncc: string;
  mobile: string;
  email: string;
};

export type listSousComptes = {
  meta?: meta;
  data: sousCompte[];
};
