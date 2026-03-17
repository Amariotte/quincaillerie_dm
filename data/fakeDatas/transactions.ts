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
  { id: '1', label: 'Commissions #001', date: '17/03/2026', amount: '15 000 FCFA', status: 'Payée' },
  { id: '2', label: 'Proforma #042', date: '16/03/2026', amount: '8 500 FCFA', status: 'En attente' },
  { id: '3', label: 'Bon de livraison #018', date: '15/03/2026', amount: '22 000 FCFA', status: 'Livré' },
  { id: '4', label: 'Règlement #007', date: '14/03/2026', amount: '30 000 FCFA', status: 'Payée' },
  { id: '5', label: 'Facture #038', date: '13/03/2026', amount: '5 200 FCFA', status: 'Impayée' },

];
