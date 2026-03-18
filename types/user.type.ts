export type user = {
  id: string;
  nom: string;
  representantLegal: string;
  dateNaissance: string;
  adresse: string;
  email: string;
};


export type AuthResponse = {
  token: string;
  user: user | null;
};