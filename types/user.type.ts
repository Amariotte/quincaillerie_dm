export type user = {
  id: string;
  civilite: string;
  nom: string;
  code: string;
  type: string;
  ncc: string;
  telFixe: string;
  telMobile: string;
  dateNaissance: Date;
  dateAnniversaire: string;
  typePiece: string;
  numPiece: string;
  adresse: string;
  nomRepresentantLegal: string;
  email: string;
  nomAgence: string;
  plafond: number;
  photo: string;
};


export type AuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: user | null;
};