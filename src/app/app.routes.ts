import { Routes } from '@angular/router';
import { ClientLayout } from '../shared/components/client-layout/client-layout';

export const routes: Routes = [
  {
    path: 'admin/users',
    loadChildren: () => import('../features/admin-users/admin-users.routes'),
  },
  {
    path: 'admin',
    pathMatch: 'full',
    redirectTo: 'admin/users',
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
        path: 'profile',
        loadChildren: () => import('../features/profile/profile.routes'),
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
