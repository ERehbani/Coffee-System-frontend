import { Page } from './page';

export function pageOf<T>(content: readonly T[]): Page<T> {
  return { content, page: 0, size: 100, totalElements: content.length, totalPages: 1 };
}
