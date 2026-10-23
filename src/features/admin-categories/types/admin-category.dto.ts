export interface CategoryDto {
  readonly categoryId?: string;
  readonly externalId?: string;
  readonly id?: string;
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly status?: string;
  readonly productCount?: number;
  readonly cafeCount?: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface CreateCategoryRequestDto {
  readonly name: string;
}

export interface UpdateCategoryRequestDto {
  readonly name: string;
}
