export type QuoteClient = {
  id: string;
  name: string;
  sector: string;
};

export type QuoteProduct = {
  id: string;
  label: string;
  unit: string;
  price: number;
};

export const quoteClients: QuoteClient[] = [
  { id: 'client-1', name: 'Ets Mavungu Construction', sector: 'BTP' },
  { id: 'client-2', name: 'Société Lumière Services', sector: 'Maintenance' },
  { id: 'client-3', name: 'Mme Kanku Déco', sector: 'Aménagement intérieur' },
];

export const quoteProducts: QuoteProduct[] = [
  { id: 'prod-1', label: 'Ciment gris 50kg', unit: 'sac', price: 18500 },
  { id: 'prod-2', label: 'Peinture blanche 20L', unit: 'bidon', price: 42000 },
  { id: 'prod-3', label: 'Fer à béton 12mm', unit: 'barre', price: 9600 },
  { id: 'prod-4', label: 'Interrupteur double', unit: 'pièce', price: 3500 },
  { id: 'prod-5', label: 'Prise murale renforcée', unit: 'pièce', price: 4100 },
];
