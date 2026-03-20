import { listProduits } from "@/types/produits.type";


export const produitsFakeData: listProduits = {
  meta: {
    page: 1,
    next: 2,
    totalPages: 12,
    total: 1116,
    size: 100
  },
  data : [
  { id: 'prod-001', designation: 'Ciment gris 50kg', reference: 'CIM-50-001', nomfamille: 'Construction', image: 'ciment', unit: 'sac', prixVenteTTC: 18500 },
  { id: 'prod-002', designation: 'Peinture acrylique 5L', reference: 'PEI-5L-002', nomfamille: 'Peinture', image: 'peinture', unit: 'pot', prixVenteTTC: 45000 },
  { id: 'prod-003', designation: 'Fer à béton 12mm', reference: 'FER-12-003', nomfamille: 'Construction', image: 'fer', unit: 'tonne', prixVenteTTC: 750000 },
  { id: 'prod-004', designation: 'Interrupteur simple', reference: 'INT-S-004', nomfamille: 'Électricité', image: 'interrupteur', unit: 'pièce', prixVenteTTC: 1500 },
  { id: 'prod-005', designation: 'Prise électrique double', reference: 'PRI-D-005', nomfamille: 'Électricité', image: 'prise', unit: 'pièce',  prixVenteTTC: 2500 },
  { id: 'prod-006', designation: 'Vernis bois 1L', reference: 'VER-1L-006', nomfamille: 'Peinture', image: 'vernis', unit: 'pot', prixVenteTTC: 30000 },
  { id: 'prod-007', designation: 'Tôle ondulée 2m x 1m', reference: 'TOL-2X1-007', nomfamille: 'Construction', image: 'tole', unit: 'feuille',  prixVenteTTC: 20000 },
  { id: 'prod-008', designation: 'Marteau de charpentier', reference: 'MAR-CH-008', nomfamille: 'Outils', image: 'marteau', unit: 'pièce',  prixVenteTTC: 12000 },
]
  
  };
