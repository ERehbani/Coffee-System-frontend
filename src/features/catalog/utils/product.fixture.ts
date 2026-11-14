import { Product } from '../model/product.model';
import { ProductDto } from '../types/product.dto';

export const PRODUCT_CAFE_ID = 'cafe-central-001';
export const OTHER_PRODUCT_CAFE_ID = 'cafe-norte-001';

export const ESPRESSO_FIXTURE: Product = {
  externalId: 'prod-central-001',
  name: 'Espresso Doble',
  description: 'Extracción doble con blend de la casa.',
  price: 2800,
  awardedPoints: 50,
  state: true,
  category: 'Cafetería',
  cafeExternalId: PRODUCT_CAFE_ID,
  image: null,
};

export const FLAT_WHITE_FIXTURE: Product = {
  externalId: 'prod-central-002',
  name: 'Flat White',
  description: 'Doble shot de espresso con leche texturizada.',
  price: 3600,
  awardedPoints: 70,
  state: true,
  category: 'Cafetería',
  cafeExternalId: PRODUCT_CAFE_ID,
  image: null,
};

export const CROISSANT_FIXTURE: Product = {
  externalId: 'prod-central-004',
  name: 'Croissant de Almendras',
  description: 'Masa hojaldrada rellena de crema de almendras.',
  price: 3400,
  awardedPoints: 60,
  state: true,
  category: 'Pastelería',
  cafeExternalId: PRODUCT_CAFE_ID,
  image: null,
};

export const COOKIE_FIXTURE: Product = {
  externalId: 'prod-central-005',
  name: 'Cookie Red Velvet',
  description: 'Galleta artesanal con centro de chocolate blanco.',
  price: 2500,
  awardedPoints: 45,
  state: true,
  category: 'Pastelería',
  cafeExternalId: PRODUCT_CAFE_ID,
  image: null,
};

export const NORTE_LATTE_FIXTURE: Product = {
  externalId: 'prod-norte-001',
  name: 'Latte',
  description: 'Espresso con leche vaporizada.',
  price: 3100,
  awardedPoints: 30,
  state: true,
  category: 'Cafetería',
  cafeExternalId: OTHER_PRODUCT_CAFE_ID,
  image: null,
};

export const PRODUCTS_FIXTURE: Product[] = [
  ESPRESSO_FIXTURE,
  FLAT_WHITE_FIXTURE,
  CROISSANT_FIXTURE,
  COOKIE_FIXTURE,
];

export const ESPRESSO_DTO_FIXTURE: ProductDto = {
  externalId: ESPRESSO_FIXTURE.externalId,
  name: ESPRESSO_FIXTURE.name,
  description: 'Extracción doble con blend de la casa.',
  price: ESPRESSO_FIXTURE.price,
  awardedPoints: 50,
  cafe: PRODUCT_CAFE_ID,
  categoryId: 'category-cafeteria',
  category: 'Cafetería',
  image: null,
  state: true,
  tags: ['café', 'intenso'],
};
