export type user = {
  id: string;
  nom: string;
  code: string;
  ncc: string;
  telFixe: string;
  telMobile: string;
  dateNaissance: string;
  adresse: string;
  nomRepresentantLegal: string;
  email: string;
  nomAgence: string;
  photo: string;
};



export type AuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: user | null;
};