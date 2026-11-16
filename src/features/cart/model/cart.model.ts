import { Product } from '../../catalog/model/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartCafe {
  externalId: string;
  name: string;
}

export interface CartItemResponse {
  productId: string;
  catalogProductId: string;
  productName: string;
  quantity: number;
}

export interface CartResponse {
  externalId: string;
  clientid: string;
  cafeid: string;
  totalPrice: number;
  products: CartItemResponse[];
}
