import { Routes } from '@angular/router';
import { ClientLayout } from '../shared/components/client-layout/client-layout';

export const routes: Routes = [
  {
    path: '',
    component: ClientLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profile' },
      {
        path: 'profile',
        loadChildren: () => import('../features/profile/profile.routes'),
      },
    ],
  },
  { path: '**', redirectTo: 'profile' },
];
