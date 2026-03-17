export type InvoiceStatus = 'Payée' | 'En attente' | 'Impayée';

export type Invoice = {
  id: string;
  reference: string;
  client: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  itemsCount: number;
};

export type detailsInvoice = {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
  quantityGratuite?: number;
  tauxRemise?: number;
  prixRemise?: number;
  tauxTVA?: number;
};


export const fallbackItems: detailsInvoice[] = [
  { id: '1', label: 'Ciment gris 50kg', quantity: 4, unitPrice: 18500, quantityGratuite: 10 },
  { id: '2', label: 'Interrupteur double', quantity: 10, unitPrice: 3500, tauxTVA: 18 },
  { id: '3', label: 'Fer à béton 12mm', quantity: 8, unitPrice: 9600, tauxRemise: 10, prixRemise: 960 },
  { id: '4', label: 'Peinture blanche 20L', quantity: 1, unitPrice: 42000 },
  { id: '5', label: 'Prise murale renforcée', quantity: 6, unitPrice: 4100 },
  { id: '6', label: 'Vernis satiné 5L', quantity: 2, unitPrice: 19500 },
];

export const invoices: Invoice[] = [
  {
    id: 'inv-001',
    reference: 'FAC-2026-001',
    client: 'Ets Mavungu Construction',
    issueDate: '17/03/2026',
    dueDate: '24/03/2026',
    amount: 150000,
    status: 'Payée',
    itemsCount: 8,
  },
  {
    id: 'inv-002',
    reference: 'FAC-2026-002',
    client: 'Société Lumière Services',
    issueDate: '16/03/2026',
    dueDate: '22/03/2026',
    amount: 89000,
    status: 'En attente',
    itemsCount: 5,
  },
  {
    id: 'inv-003',
    reference: 'FAC-2026-003',
    client: 'Mme Kanku Déco',
    issueDate: '15/03/2026',
    dueDate: '18/03/2026',
    amount: 48200,
    status: 'Impayée',
    itemsCount: 3,
  },
  {
    id: 'inv-004',
    reference: 'FAC-2026-004',
    client: 'Atelier Bâtir Plus',
    issueDate: '14/03/2026',
    dueDate: '21/03/2026',
    amount: 210500,
    status: 'Payée',
    itemsCount: 11,
  },
  {
    id: 'inv-005',
    reference: 'FAC-2026-005',
    client: 'Alpha Travaux Publics',
    issueDate: '12/03/2026',
    dueDate: '19/03/2026',
    amount: 63500,
    status: 'En attente',
    itemsCount: 4,
  },
  {
    id: 'inv-006',
    reference: 'FAC-2026-006',
    client: 'Boutique Maison Moderne',
    issueDate: '10/03/2026',
    dueDate: '15/03/2026',
    amount: 97000,
    status: 'Impayée',
    itemsCount: 7,
  },
];
