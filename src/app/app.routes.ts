import { Routes } from '@angular/router';
import { AdminLayout } from '../shared/components/admin-layout/admin-layout';
import { ADMIN_NAV_ITEMS } from '../shared/components/admin-layout/admin-nav';
import { AdminPlaceholderPage } from '../shared/components/admin-placeholder-page/admin-placeholder-page';
import { ClientLayout } from '../shared/components/client-layout/client-layout';
import { roleGuard } from '../features/auth/guards/auth.guard';

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
  {
    path: 'global-benefits',
    loadChildren: () => import('../features/admin-global-benefits/admin-global-benefits.routes'),
  },
  {
    path: 'purchases',
    loadChildren: () => import('../features/admin-purchases/admin-purchases.routes'),
  },
  {
    path: 'tiers',
    loadChildren: () => import('../features/admin-tiers/admin-tiers.routes'),
  },
  {
    path: 'benefit-types',
    loadChildren: () => import('../features/admin-benefit-types/admin-benefit-types.routes'),
  },
  {
    path: 'cafes',
    loadChildren: () => import('../features/admin-cafes/admin-cafes.routes'),
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
    path: 'login',
    loadChildren: () => import('../features/auth/auth.routes'),
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [roleGuard('ROLE_SUPERADMIN')],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'users' },
      ...adminSectionRoutes,
      ...adminPlaceholderRoutes,
    ],
  },
  {
    path: 'cafe/profile',
    canActivate: [roleGuard('ROLE_CAFETERIA')],
    loadChildren: () => import('../features/cafe-profile/cafe-profile.routes'),
  },
  {
    path: '',
    component: ClientLayout,
    canActivate: [roleGuard('ROLE_CLIENTE')],
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
        path: 'purchases',
        loadChildren: () => import('../features/purchase-history/purchase-history.routes'),
      },
      {
        path: 'checkout',
        loadChildren: () => import('../features/checkout/checkout.routes'),
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
