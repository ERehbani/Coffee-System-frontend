import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'register',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'home',
    renderMode: RenderMode.Client,
  },
  {
    path: 'catalog',
    renderMode: RenderMode.Client,
  },
  {
    path: 'profile',
    renderMode: RenderMode.Client,
  },
  {
    path: 'profile/tier',
    renderMode: RenderMode.Client,
  },
  {
    path: 'profile/coupons',
    renderMode: RenderMode.Client,
  },
  {
    path: 'profile/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: 'profile/redemptions',
    renderMode: RenderMode.Client,
  },
  {
    path: 'profile/redemptions/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'purchases',
    renderMode: RenderMode.Client,
  },
  {
    path: 'checkout',
    renderMode: RenderMode.Client,
  },
  {
    path: 'checkout/success',
    renderMode: RenderMode.Client,
  },
  {
    path: 'cafe/profile',
    renderMode: RenderMode.Client,
  },
  {
    path: 'cafe/validate',
    renderMode: RenderMode.Client,
  },
  {
    path: 'cafe/benefits',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
