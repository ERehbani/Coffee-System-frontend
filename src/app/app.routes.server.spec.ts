import { RenderMode } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';

describe('server routes', () => {
  const find = (path: string) => serverRoutes.find((route) => route.path === path);

  it('renders the whole admin area on the client', () => {
    expect(find('admin/**')?.renderMode).toBe(RenderMode.Client);
    expect(find('admin')?.renderMode).toBe(RenderMode.Client);
  });

  it('renders the my coupons page on the client', () => {
    expect(find('profile/coupons')?.renderMode).toBe(RenderMode.Client);
  });

  it.each(['purchases', 'profile/edit', 'profile/redemptions'])(
    'renders /%s on the client so the guard sees the session after a reload',
    (path) => {
      expect(find(path)?.renderMode).toBe(RenderMode.Client);
    },
  );

  it('declares the admin wildcard before the catch-all prerender route', () => {
    const paths = serverRoutes.map((route) => route.path);

    expect(paths.indexOf('admin/**')).toBeGreaterThanOrEqual(0);
    expect(paths.indexOf('admin/**')).toBeLessThan(paths.indexOf('**'));
    expect(find('**')?.renderMode).toBe(RenderMode.Prerender);
  });
});
