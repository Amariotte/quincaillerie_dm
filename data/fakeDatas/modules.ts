import { ModuleListItem } from '@/components/module-list-screen';

export type ProformaProductLine = {
  productId: string;
  quantity: number;
};

export const proformasData: ModuleListItem[] = [
  { id: 'pro-1', title: 'PRO-2026-001', subtitle: 'Ets Mavungu Construction', date: '17/03/2026', amount: '95 000 FCFA', status: 'Validée' },
  { id: 'pro-2', title: 'PRO-2026-002', subtitle: 'Société Lumière Services', date: '16/03/2026', amount: '62 500 FCFA', status: 'En attente' },
];

export const bonsLivraisonData: ModuleListItem[] = [
  { id: 'bl-1', title: 'BL-2026-018', subtitle: 'Livraison dépôt central', date: '17/03/2026', amount: '18 500 FCFA', status: 'Livré' },
  { id: 'bl-2', title: 'BL-2026-019', subtitle: 'Chantier Kintambo', date: '15/03/2026', amount: '42 000 FCFA', status: 'En route' },
];

export const reglementsData: ModuleListItem[] = [
  { id: 'reg-1', title: 'REG-2026-007', subtitle: 'Paiement facture FAC-001', date: '14/03/2026', amount: '30 000 FCFA', status: 'Confirmé' },
  { id: 'reg-2', title: 'REG-2026-008', subtitle: 'Règlement acompte', date: '12/03/2026', amount: '12 000 FCFA', status: 'Validé' },
];

export const achatsData: ModuleListItem[] = [
  { id: 'ach-1', title: 'BA-2026-011', subtitle: 'Commande ciment fournisseur A', date: '13/03/2026', amount: '210 000 FCFA', status: 'Reçu' },
  { id: 'ach-2', title: 'BA-2026-012', subtitle: 'Commande électricité fournisseur B', date: '11/03/2026', amount: '84 600 FCFA', status: 'En attente' },
];

export const transactionsData: ModuleListItem[] = [
  { id: 'trs-1', title: 'TRX-2026-051', subtitle: 'Encaissement client Alpha', date: '17/03/2026', amount: '15 000 FCFA', status: 'Entrée' },
  { id: 'trs-2', title: 'TRX-2026-052', subtitle: 'Décaissement fournisseur', date: '17/03/2026', amount: '8 500 FCFA', status: 'Sortie' },
];

export const promotionsData: ModuleListItem[] = [
  { id: 'prm-1', title: 'PROMO-PEINT-01', subtitle: 'Réduction peinture intérieure', date: '01/03/2026', amount: '15%', status: 'Active' },
  { id: 'prm-2', title: 'PROMO-CIMENT-02', subtitle: 'Offre lot de ciment', date: '10/03/2026', amount: '10%', status: 'Planifiée' },
];

export const operationsData: ModuleListItem[] = [
  { id: 'op-1', title: 'OP-CAISSE-001', subtitle: 'Ajustement inventaire rayon A', date: '15/03/2026', amount: 'N/A', status: 'Terminée' },
  { id: 'op-2', title: 'OP-CAISSE-002', subtitle: 'Clôture de caisse journalière', date: '16/03/2026', amount: 'N/A', status: 'En cours' },
];

export const commissionsData: ModuleListItem[] = [
  { id: 'com-1', title: 'COM-2026-003', subtitle: 'Commission vente équipe 1', date: '14/03/2026', amount: '25 000 FCFA', status: 'Calculée' },
  { id: 'com-2', title: 'COM-2026-004', subtitle: 'Commission vente équipe 2', date: '16/03/2026', amount: '18 400 FCFA', status: 'En attente' },
];

export const cartesData: ModuleListItem[] = [
  { id: 'car-1', title: 'Carte fidélité #A102', subtitle: 'Client: Maison Moderne', date: '12/03/2026', amount: '124 pts', status: 'Active' },
  { id: 'car-2', title: 'Carte fidélité #B078', subtitle: 'Client: Atelier Plus', date: '09/03/2026', amount: '92 pts', status: 'Active' },
];

export const proformaProductLines: Record<string, ProformaProductLine[]> = {
  'pro-1': [
    { productId: 'prod-001', quantity: 2 },
    { productId: 'prod-004', quantity: 5 },
    { productId: 'prod-007', quantity: 1 },
  ],
  'pro-2': [
    { productId: 'prod-002', quantity: 1 },
    { productId: 'prod-003', quantity: 3 },
    { productId: 'prod-005', quantity: 4 },
  ],
};
