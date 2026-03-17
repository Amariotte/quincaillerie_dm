export type Transaction = {
  id: string;
  label: string;
  date: string;
  amount: string;
  status: string;
};

export const transactions: Transaction[] = [
  { id: '1', label: 'Facture #001', date: '17/03/2026', amount: '15 000 FCFA', status: 'Payée' },
  { id: '2', label: 'Proforma #042', date: '16/03/2026', amount: '8 500 FCFA', status: 'En attente' },
  { id: '3', label: 'Bon de livraison #018', date: '15/03/2026', amount: '22 000 FCFA', status: 'Livré' },
  { id: '4', label: 'Règlement #007', date: '14/03/2026', amount: '30 000 FCFA', status: 'Payée' },
  { id: '5', label: 'Facture #038', date: '13/03/2026', amount: '5 200 FCFA', status: 'Impayée' },
  { id: '6', label: 'Commissions #001', date: '12/03/2026', amount: '12 000 FCFA', status: 'Payée' },
  { id: '7', label: 'Facture #041', date: '11/03/2026', amount: '9 800 FCFA', status: 'En attente' },
  { id: '8', label: 'Bon de livraison #022', date: '10/03/2026', amount: '18 500 FCFA', status: 'Livré' },
  { id: '9', label: 'Règlement #012', date: '09/03/2026', amount: '27 000 FCFA', status: 'Payée' },
  { id: '10', label: 'Facture #044', date: '08/03/2026', amount: '6 100 FCFA', status: 'Impayée' },

];
