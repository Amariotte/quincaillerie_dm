export type ProductImageKey = 'ciment' | 'peinture' | 'fer' | 'interrupteur' | 'prise' | 'vernis' | 'tole' | 'marteau';

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  image: ProductImageKey;
  unit: string;
  stock: number;
  price: number;
};

export const products: Product[] = [
  { id: 'prod-001', name: 'Ciment gris 50kg', sku: 'CIM-50-001', category: 'Construction', image: 'ciment', unit: 'sac', stock: 120, price: 18500 },
  { id: 'prod-002', name: 'Peinture blanche 20L', sku: 'PNT-20-004', category: 'Peinture', image: 'peinture', unit: 'bidon', stock: 34, price: 42000 },
  { id: 'prod-003', name: 'Fer à béton 12mm', sku: 'FER-12-018', category: 'Construction', image: 'fer', unit: 'barre', stock: 260, price: 9600 },
  { id: 'prod-004', name: 'Interrupteur double', sku: 'ELEC-INT-022', category: 'Électricité', image: 'interrupteur', unit: 'pièce', stock: 77, price: 3500 },
  { id: 'prod-005', name: 'Prise murale renforcée', sku: 'ELEC-PRI-016', category: 'Électricité', image: 'prise', unit: 'pièce', stock: 65, price: 4100 },
  { id: 'prod-006', name: 'Vernis satiné 5L', sku: 'PNT-VRN-009', category: 'Peinture', image: 'vernis', unit: 'pot', stock: 22, price: 19500 },
  { id: 'prod-007', name: 'Tôle galvanisée 3m', sku: 'COV-TOL-031', category: 'Couverture', image: 'tole', unit: 'feuille', stock: 48, price: 31500 },
  { id: 'prod-008', name: 'Marteau 500g', sku: 'OUT-MAR-005', category: 'Outillage', image: 'marteau', unit: 'pièce', stock: 29, price: 8500 },
];
