import { Routes } from '@angular/router';
import { AdminLayout } from '../shared/components/admin-layout/admin-layout';
import { ADMIN_NAV_ITEMS } from '../shared/components/admin-layout/admin-nav';
import { AdminPlaceholderPage } from '../shared/components/admin-placeholder-page/admin-placeholder-page';
import { ClientLayout } from '../shared/components/client-layout/client-layout';

/** Admin sections that already have a page. Add new ones here to replace their placeholder. */
const adminSectionRoutes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('../features/admin-users/admin-users.routes'),
  },
  {
    path: 'categories',
    loadChildren: () => import('../features/admin-categories/admin-categories.routes'),
  },
];

const adminPlaceholderRoutes: Routes = ADMIN_NAV_ITEMS.filter(
  (item) => !adminSectionRoutes.some((route) => route.path === item.path),
).map((item) => ({
  path: item.path,
  component: AdminPlaceholderPage,
  data: { title: item.label },
}));

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'users' },
      ...adminSectionRoutes,
      ...adminPlaceholderRoutes,
    ],
  },
  {
    path: 'cafe/profile',
    loadChildren: () => import('../features/cafe-profile/cafe-profile.routes'),
  },
  {
    path: '',
    component: ClientLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadChildren: () => import('../features/home/home.routes'),
      },
      {
        path: 'catalog',
        loadChildren: () => import('../features/catalog/catalog.routes'),
      },
      {
        path: 'profile',
        loadChildren: () => import('../features/profile/profile.routes'),
      },
      {
        path: 'orders',
        loadChildren: () => import('../features/orders/orders.routes'),
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
