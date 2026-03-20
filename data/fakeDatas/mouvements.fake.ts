import { listMouvements } from "@/types/mouvements.type";


export const mouvementsFakeData: listMouvements = {
  meta: {
    page: 1,
    next: 2,
    totalPages: 12,
    total: 1116,
    size: 100
  },
  data : [
  { id: '1', codeOp: 'OP001', libType: 'Vente', dateOp: '17/03/2026', montant: 15000, type: 1, nomAgence: 'Agence Centrale', nomSousCompte: 'Sous-compte A' },
  { id: '2', codeOp: 'OP002', libType: 'Commission', dateOp: '18/03/2026', montant: 5000, type: 1, nomAgence: 'Agence Centrale', nomSousCompte: 'Sous-compte B' },
  { id: '3', codeOp: 'OP003', libType: 'Vente', dateOp: '19/03/2026', montant: 20000, type: 1, nomAgence: 'Agence Centrale', nomSousCompte: 'Sous-compte C' },
  { id: '4', codeOp: 'OP004', libType: 'Vente', dateOp: '20/03/2026', montant: 30000, type: 2, nomAgence: 'Agence Centrale', nomSousCompte: 'Sous-compte D' },
  { id: '5', codeOp: 'OP005', libType: 'Commission', dateOp: '21/03/2026', montant: 12000, type: 1, nomAgence: 'Agence Centrale', nomSousCompte: 'Sous-compte E' },
  { id: '6', codeOp: 'OP006', libType: 'Réglement', dateOp: '22/03/2026', montant: 8000, type: 2, nomAgence: 'Agence Centrale', nomSousCompte: 'Sous-compte F' },
  { id: '7', codeOp: 'OP007', libType: 'Vente', dateOp: '23/03/2026', montant: 25000, type: 1, nomAgence: 'Agence Centrale', nomSousCompte: 'Sous-compte G' },
  { id: '8', codeOp: 'OP008', libType: 'Commission', dateOp: '24/03/2026', montant: 35000, type: 2, nomAgence: 'Agence Centrale', nomSousCompte: 'Sous-compte H' },
  { id: '9', codeOp: 'OP009', libType: 'Réglement', dateOp: '25/03/2026', montant: 40000, type: 1, nomAgence: 'Agence Centrale', nomSousCompte: 'Sous-compte I' },
]
};