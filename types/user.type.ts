export type user = {
  id: string;
  nom: string;
  code: string;
  ncc: string;
  telFixe: string;
  telMobile: string;
  dateNaissance: string;
  adresse: string;
  email: string;
  nomAgence: string;
  photo: string;
};


export type AuthResponse = {
  token: string;
  user: user | null;
};