import { Routes } from '@angular/router';
import { guestGuard } from './guards/auth.guard';
import { RegisterPage } from './pages/register-page/register-page';

export default [
  {
    path: '',
    component: RegisterPage,
    canActivate: [guestGuard],
  },
] satisfies Routes;
