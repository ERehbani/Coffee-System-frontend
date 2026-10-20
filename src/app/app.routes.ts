import { Routes } from '@angular/router';
import { ClientLayout } from '../shared/components/client-layout/client-layout';

export const routes: Routes = [
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
