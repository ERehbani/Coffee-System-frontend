import { IconName } from '../../../shared/components/icon/icon-registry';

export type CategoryStatus = 'active' | 'inactive';

export interface AdminCategory {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly icon: IconName;
  readonly color: string;
  readonly status: CategoryStatus;
  readonly productCount: number;
  readonly cafeCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CategoryFormData {
  readonly name: string;
  readonly description: string;
  readonly icon: IconName;
  readonly color: string;
  readonly status: CategoryStatus;
}

export interface CategoryStatsSummary {
  readonly totalCategories: number;
  readonly activeCategories: number;
  readonly inactiveCategories: number;
  readonly totalProducts: number;
}
