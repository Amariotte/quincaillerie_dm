import { bonAchat, listBonAchats } from "@/types/bon-achats.type";
import { bonLivraison, listBonLivraisons } from "@/types/bon-livraisons.type";
import { commission, listCommissions } from "@/types/commissions.type";
import { devis, listDevis } from "@/types/devis.type";
import { detailsFacture, listFactures } from "@/types/factures.type";
import { listMouvements } from "@/types/mouvements.type";
import { listOperations, operation } from "@/types/operations.type";
import { dataChart, meta, stat } from "@/types/other.type";
import { listProduits } from "@/types/produits.type";
import { listPromotions } from "@/types/promotions.type";
import { listReglements, reglement } from "@/types/reglements.type";
import { SoldeResponse } from "@/types/solde.type";
import { listSousComptes, sousCompte } from "@/types/sousCompte.type";
import { AuthResponse, user } from "@/types/user.type";

export const soldeFake: SoldeResponse = {
  solde: 100000,
};

export const metaFakeData: meta = {
  page: 1,
  next: 2,
  totalPages: 12,
  total: 1116,
  size: 100,
};

export const statsFake: stat = {
  venteNonSoldee: {
    total: 50,
    nbre: 30,
  },
  venteEchue: {
    nbre: 20,
    total: 100000,
  },
  promotionActive: 5,
  sousCompte: 10,
};

export const produitsFakeData: listProduits = {
  meta: metaFakeData,
  data: [
    {
      id: "prod-001",
      designation: "Ciment gris 50kg",
      reference: "CIM-50-001",
      nomfamille: "Construction",
      unit: "sac",
      prixVenteTTC: 18500,
    },
    {
      id: "prod-002",
      designation: "Peinture acrylique 5L",
      reference: "PEI-5L-002",
      nomfamille: "Peinture",
      unit: "pot",
      prixVenteTTC: 45000,
    },
    {
      id: "prod-003",
      designation: "Fer à béton 12mm",
      reference: "FER-12-003",
      nomfamille: "Construction",
      unit: "tonne",
      prixVenteTTC: 750000,
    },
    {
      id: "prod-004",
      designation: "Interrupteur simple",
      reference: "INT-S-004",
      nomfamille: "Électricité",
      unit: "pièce",
      prixVenteTTC: 1500,
    },
    {
      id: "prod-005",
      designation: "Prise électrique double",
      reference: "PRI-D-005",
      nomfamille: "Électricité",
      unit: "pièce",
      prixVenteTTC: 2500,
    },
    {
      id: "prod-006",
      designation: "Vernis bois 1L",
      reference: "VER-1L-006",
      nomfamille: "Peinture",
      unit: "pot",
      prixVenteTTC: 30000,
    },
  ],
};

export const userDataFake: user = {
  id: "user-123",
  nom: "Ange mariotte",
  code: "AM123",
  ncc: "NCC123",
  telFixe: "0123456789",
  telMobile: "0987654321",
  nomRepresentantLegal: "BEUGRE AIKPA ANGE MARIOTTE",
  dateNaissance: new Date("1990-01-01"),
  adresse: "Abidjan, Cocody, Riviera 2",
  email: "ange.mariotte@example.com",
  nomAgence: "Agence Abidjan",
  photo: "https://example.com/photos/ange-mariotte.jpg",
  civilite: "M.",
  type: "PARTICULIER",
  dateAnniversaire: "26 avril",
  typePiece: "PASSEPORT",
  numPiece: "000  000000",
  plafond: 200000,
};

export const userDataFakeAuthResponse: AuthResponse = {
  access_token: "fake-token",
  token_type: "Bearer",
  expires_in: 3600,
  refresh_token: "fake-refresh-token",
  user: userDataFake,
};

export const fallbackItems: detailsFacture[] = [
  {
    id: "1",
    qteLivree: 0,
    prixVenteTTC: 0,
    prixVenteHT: 0,
    qteVendue: 0,
    txTaxe: 0,
    txRemise: 0,
    remisePrix: 0,
    montantRemiseHT: 0,
    montantRemiseTTC: 0,
    montantTTC: 0,
    montantHT: 0,
    montantBrutHT: 0,
    montantBrutTTC: 0,
    montantTaxe: 0,
    qteGratuite: 0,
    nomSuplementaire: "",
    reference: "",
    descPackage: "",
    designation: "",
  },
];

export const facturesFakeData: listFactures = {
  meta: metaFakeData,
  data: [
    {
      id: "fac-001",
      codeVente: "FAC-2026-001",
      descVente: "Vente de matériaux de construction",
      nomSousCompte: "Ets Mavungu Construction",
      nomAgence: "Agence Gombe",
      nomCaisse: "Caisse Principale",
      operateurSaisie: "M. Ilunga",
      operateurValidation: "Mme Kanku",
      dateVente: new Date("2026-03-17"),
      dateEchVente: new Date("2026-04-17"),
      dateLivSouhaite: new Date("2026-03-25"),
      lieuLivSouhaite: "Chantier Mavungu, Gombe",
      soldeVente: 50000,
      nbProduits: 3,
      totalHT: 125000,
      totalTaxe: 25000,
      totalNetPayer: 150000,
      totalBrutHT: 125000,
      totalBrutTTC: 150000,
      totalRemCialeHT: 0,
      totalRemCialeTTC: 0,
      status: "Non soldée",
      details: fallbackItems,
    },
    {
      id: "fac-002",
      codeVente: "FAC-2026-002",
      descVente: "Vente de peintures et accessoires",
      nomSousCompte: "Société Lumière Services",
      nomAgence: "Agence Limete",
      nomCaisse: "Banque BCDC",
      operateurSaisie: "Mme Kanku",
      operateurValidation: "M. Ilunga",
      dateVente: new Date("2026-03-16"),
      dateEchVente: new Date("2026-04-16"),
      dateLivSouhaite: new Date("2026-03-26"),
      lieuLivSouhaite: "Bureau Lumière Services, Limete",
      soldeVente: 0,
      nbProduits: 5,
      totalHT: 200000,
      totalTaxe: 40000,
      totalNetPayer: 240000,
      totalBrutHT: 200000,
      totalBrutTTC: 240000,
      totalRemCialeHT: 0,
      totalRemCialeTTC: 0,
      status: "Soldée",
      details: fallbackItems,
    },
  ],
};

export const promotionsFakeData: listPromotions = {
  meta: metaFakeData,
  data: [
    {
      id: "promo-001",
      description: "Promotion spéciale sur les produits de construction",
      nomProduit: "Ciment gris 50kg",
      dateDebut: new Date("2026-03-01"),
      dateFin: new Date("2026-03-31"),
      nbMax: 100,
      status: "En cours",
    },
    {
      id: "promo-002",
      description: "Offre de printemps sur les peintures",
      nomProduit: "Peinture blanche 20L",
      dateDebut: new Date("2026-04-01"),
      dateFin: new Date("2026-04-30"),
      nbMax: 50,
      status: "A venir",
    },
    {
      id: "promo-003",
      description: "Remise sur les équipements électriques",
      nomProduit: "Interrupteur double",
      dateDebut: new Date("2026-03-15"),
      dateFin: new Date("2026-03-25"),
      nbMax: 200,
      status: "En cours",
    },
  ],
};

export const mouvementsFakeData: listMouvements = {
  meta: metaFakeData,
  data: [
    {
      id: "1",
      codeOp: "OP001",
      libType: "Vente",
      dateOp: "17/03/2026",
      montant: 15000,
      type: 1,
      nomAgence: "Agence Centrale",
      nomSousCompte: "Sous-compte A",
    },
    {
      id: "2",
      codeOp: "OP002",
      libType: "Commission",
      dateOp: "18/03/2026",
      montant: 5000,
      type: 1,
      nomAgence: "Agence Centrale",
      nomSousCompte: "Sous-compte B",
    },
    {
      id: "3",
      codeOp: "OP003",
      libType: "Vente",
      dateOp: "19/03/2026",
      montant: 20000,
      type: 1,
      nomAgence: "Agence Centrale",
      nomSousCompte: "Sous-compte C",
    },
    {
      id: "4",
      codeOp: "OP004",
      libType: "Vente",
      dateOp: "20/03/2026",
      montant: 30000,
      type: 2,
      nomAgence: "Agence Centrale",
      nomSousCompte: "Sous-compte D",
    },
  ],
};

export const reglements: reglement[] = [
  {
    id: "reg-001",
    codeReg: "REG-2026-001",
    nomSousCompte: "Ets Mavungu Construction",
    nomAgence: "Agence Gombe",
    nomCompte: "Caisse Principale",
    operateurSaisie: "M. Ilunga",
    dateReg: new Date("2026-03-17"),
    montantReg: 150000,
    refReg: "REF-REG-001",
    nomModePaiement: "Espèces",
    statusEncaisse: "Encaissé",
  },
  {
    id: "reg-002",
    codeReg: "REG-2026-002",
    nomSousCompte: "Société Lumière Services",
    nomAgence: "Agence Limete",
    nomCompte: "Banque BCDC",
    operateurSaisie: "Mme Kanku",
    dateReg: new Date("2026-03-16"),
    montantReg: 89000,
    refReg: "REF-REG-002",
    nomModePaiement: "Virement",
    statusEncaisse: "Non encaissé",
  },
];

export const operations: operation[] = [
  {
    id: "op-001",
    codeOp: "OP-2026-001",
    dateOp: new Date("2026-03-17"),
    montantOp: 150000,
    libType: "Décaissement",
    nomAgence: "Agence Gombe",
    nomSousCompte: "Ets Mavungu Construction",
    solliciteurOp: "M. Ilunga",
    descOp: "",
    depoOrBene: "Ange",
  },
  {
    id: "op-002",
    codeOp: "OP-2026-002",
    dateOp: new Date("2026-03-16"),
    montantOp: 7500,
    libType: "Décaissement",
    nomAgence: "Agence Gombe",
    nomSousCompte: "Ets Mavungu Construction",
    solliciteurOp: "M. Ilunga",
    descOp: "",
    depoOrBene: "Ange",
  },
  {
    id: "op-003",
    codeOp: "OP-2026-003",
    dateOp: new Date("2026-03-16"),
    montantOp: 89000,
    libType: "Décaissement",
    nomAgence: "Agence Limete",
    nomSousCompte: "Société Lumière Services",
    solliciteurOp: "Mme Kanku",
    descOp: "",
    depoOrBene: "Ange",
  },
  {
    id: "op-004",
    codeOp: "OP-2026-004",
    dateOp: new Date("2026-03-15"),
    montantOp: 4450,
    libType: "Décaissement",
    nomAgence: "Agence Limete",
    nomSousCompte: "Société Lumière Services",
    solliciteurOp: "Mme Kanku",
    descOp: "",
    depoOrBene: "Ange",
  },
];

export const commissions: commission[] = [
  {
    id: "com-001",
    baseCalculCom: 150000,
    montCom: 7500,
    tauxCom: 5,
    typeCom: 1,
    dateCom: new Date("2026-03-17"),
    codeCom: "COM-2026-001",
    descVente: new Date("2026-03-10"),
    nomSousCompte: "Ets Mavungu Construction",
    codeVente: "FAC-2026-001",
    nomAgence: "Agence Gombe",
  },
  {
    id: "com-002",
    baseCalculCom: 89000,
    montCom: 4450,
    tauxCom: 5,
    typeCom: 1,
    dateCom: new Date("2026-03-16"),
    codeCom: "COM-2026-002",
    descVente: new Date("2026-03-16"),
    nomSousCompte: "Société Lumière Services",
    codeVente: "FAC-2026-002",
    nomAgence: "Agence Limete",
  },
  {
    id: "com-003",
    baseCalculCom: 48200,
    montCom: 2410,
    tauxCom: 5,
    typeCom: 1,
    dateCom: new Date("2026-03-15"),
    codeCom: "COM-2026-003",
    descVente: new Date("2026-03-15"),
    nomSousCompte: "Mme Kanku Déco",
    codeVente: "FAC-2026-003",
    nomAgence: "Agence Matete",
  },
  {
    id: "com-004",
    baseCalculCom: 210500,
    montCom: 10525,
    tauxCom: 5,
    typeCom: 1,
    dateCom: new Date("2026-03-14"),
    codeCom: "COM-2026-004",
    descVente: new Date("2026-03-14"),
    nomSousCompte: "Atelier Bâtir Plus",
    codeVente: "FAC-2026-004",
    nomAgence: "Agence Bandalungwa",
  },
];

export const bonAchats: bonAchat[] = [];

export const proformas: devis[] = [];

export const bonLivraisons: bonLivraison[] = [];

export const sousComptes: sousCompte[] = [
  {
    id: "reg-001",
    nom: "REG-2026-001",
    description: "Description du sous-compte",
    ncc: "NCC-001",
    mobile: "0123456789",
    email: "email@example.com",
    solde: -125000,
  },
  {
    id: "reg-002",
    nom: "REG-2026-002",
    description: "Description du sous-compte",
    ncc: "NCC-002",
    mobile: "0123456789",
    email: "b@gmail.com",
    solde: 245000,
  },
];

export const dataChartsFakeData: dataChart[] = [
  {
    mois: "Janvier",
    vente: 150000,
    decaissement: 50000,
    commission: 7500,
    reglement: 120000,
    encaissement: 100000,
    entree: 150000,
    sortie: 50000,
  },
  {
    mois: "Février",
    vente: 200000,
    decaissement: 80000,
    commission: 10000,
    reglement: 180000,
    encaissement: 150000,
    entree: 200000,
    sortie: 80000,
  },
  {
    mois: "Mars",
    vente: 250000,
    decaissement: 120000,
    commission: 12500,
    reglement: 220000,
    encaissement: 200000,
    entree: 250000,
    sortie: 120000,
  },
];

export const reglementsFakeData: listReglements = {
  meta: metaFakeData,
  data: reglements,
};

export const operationsFakeData: listOperations = {
  meta: metaFakeData,
  data: operations,
};

export const commissionsFakeData: listCommissions = {
  meta: metaFakeData,
  data: commissions,
};

export const bonAchatsFakeData: listBonAchats = {
  meta: metaFakeData,
  data: bonAchats,
};

export const proformasFakeData: listDevis = {
  meta: metaFakeData,
  data: proformas,
};

export const bonLivraisonsFakeData: listBonLivraisons = {
  meta: metaFakeData,
  data: bonLivraisons,
};

export const sousComptesFakeData: listSousComptes = {
  meta: metaFakeData,
  data: sousComptes,
};
