export interface PurchaseDetail {
  externalId: string;
  productId: string;
  productName: string;
  amount: number;
  unitPrice: number;
  generatedPoints: number;
  subtotal: number;
}

export interface Purchase {
  externalId: string;
  date: string;
  price: number;
  status: string;
  clientId: string;
  cafeId: string;
  cafeName: string;
  redemptionId?: string | null;
  details: PurchaseDetail[];
}
