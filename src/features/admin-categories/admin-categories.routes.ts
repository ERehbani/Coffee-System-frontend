import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { AdminCategoriesPage } from './pages/admin-categories-page/admin-categories-page';
import { AdminCategoryRepository } from './services/admin-category.repository';
import { AdminCategoryStore } from './services/admin-category.store';
import { HttpAdminCategoryRepository } from './services/http-admin-category.repository';
import { MockAdminCategoryRepository } from './services/mock-admin-category.repository';

export default [
  {
    path: '',
    component: AdminCategoriesPage,
    providers: [
      {
        provide: AdminCategoryRepository,
        useClass: environment.useMockApi ? MockAdminCategoryRepository : HttpAdminCategoryRepository,
      },
      AdminCategoryStore,
    ],
  },
] satisfies Routes;
