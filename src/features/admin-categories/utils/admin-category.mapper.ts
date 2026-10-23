import { IconName } from '../../../shared/components/icon/icon-registry';
import { CategoryDto } from '../types/admin-category.dto';
import { AdminCategory, CategoryStatus } from '../types/admin-category.model';

export function toAdminCategory(dto: CategoryDto): AdminCategory {
  const id = dto.categoryId || dto.externalId || dto.id || '';
  const status: CategoryStatus = dto.status === 'inactive' ? 'inactive' : 'active';
  const createdAt = dto.createdAt ? new Date(dto.createdAt) : new Date();
  const updatedAt = dto.updatedAt ? new Date(dto.updatedAt) : new Date();
  const icon = (dto.icon as IconName) || 'tag';

  return {
    id,
    name: dto.name,
    description: dto.description || '',
    icon,
    color: dto.color || 'amber',
    status,
    productCount: dto.productCount ?? 0,
    cafeCount: dto.cafeCount ?? 0,
    createdAt,
    updatedAt,
  };
}

export function toAdminCategoryList(dtos: readonly CategoryDto[]): readonly AdminCategory[] {
  return dtos.map(toAdminCategory);
}
