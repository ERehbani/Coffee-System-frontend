import { Product } from '../../catalog/model/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartCafe {
  externalId: string;
  name: string;
}
