import { Routes } from '@angular/router';
import { guestGuard } from './guards/auth.guard';
import { LoginPage } from './pages/login-page/login-page';

export default [
  {
    path: '',
    component: LoginPage,
    canActivate: [guestGuard],
  },
] satisfies Routes;
