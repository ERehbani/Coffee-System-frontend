import { Routes } from '@angular/router';
import { ClientLayout } from './layout/client-layout/client-layout';

export const routes: Routes = [
  {
    path: '',
    component: ClientLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () => import('./client-dashboard/client-dashboard.routes'),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
