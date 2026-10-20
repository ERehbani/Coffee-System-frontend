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
        path: 'catalog',
        loadChildren: () => import('../features/catalog/catalog.routes'),
      },
      {
        path: 'profile',
        loadChildren: () => import('../features/profile/profile.routes'),
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
