export type menuItem = {
  id: string;
  title : string;
  icon: string;
  tint: string;
  featured?: boolean;
};

export const menuItems = [
  { id: 'ventes', title: 'Ventes', icon: 'receipt', tint: '#4f46e5' },
  { id: 'proformas', title: 'Proformas', icon: 'description', tint: '#ef4444' },
  { id: 'bons', title: 'Bons de livraison', icon: 'local-shipping', tint: '#f59e0b' },
  { id: 'reglements', title: 'Règlements', icon: 'account-balance-wallet', tint: '#7c3aed' },
  { id: 'produits', title: 'Produits', icon: 'shopping-bag', tint: '#10b981' },
  { id: 'bonsAchats', title: "Bon d'achats", icon: 'description', tint: '#fb7185' },
  { id: 'transactions', title: 'Transactions', icon: 'payments', tint: '#22c55e' },
  { id: 'promotions', title: 'Promotions', icon: 'redeem', tint: '#f97316' },
  { id: 'operations', title: 'Opérations', icon: 'trending-down', tint: '#eab308' },
  { id: 'commissions', title: 'Commissions', icon: 'percent', tint: '#ec4899' },
  { id: 'cartes', title: 'Cartes', icon: 'credit-card', tint: '#3b82f6' },
  { id: 'devis', title: 'Faire un devis', icon: 'request-quote', tint: '#d97706', featured: true },
];

