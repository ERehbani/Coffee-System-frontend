import { Product } from '../model/product.model';
import { ProductDto } from '../types/product.dto';

export const UNCATEGORIZED_LABEL = 'Sin categoría';

export function toProduct(dto: ProductDto): Product {
  return {
    externalId: dto.externalId,
    name: dto.name,
    description: dto.description,
    price: dto.price,
    awardedPoints: dto.awardedPoints,
    state: dto.state,
    category: dto.category ?? UNCATEGORIZED_LABEL,
    cafeExternalId: dto.cafe,
    image: dto.image,
  };
}

export function toProducts(dtos: readonly ProductDto[]): Product[] {
  return dtos.map(toProduct);
}
