export type ProformaProductLine = {
  productId: string;
  quantity: number;
  freeQuantity?: number;
  discountRate?: number;
  discountAmount?: number;
  vatRate?: number;
};