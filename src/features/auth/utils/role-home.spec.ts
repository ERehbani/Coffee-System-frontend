import { getHomeForRoles } from './role-home';

describe('getHomeForRoles', () => {
  it('sends the superadmin to the admin panel', () => {
    expect(getHomeForRoles(['ROLE_SUPERADMIN'])).toBe('/admin');
  });

  it('sends the cafe to its profile', () => {
    expect(getHomeForRoles(['ROLE_CAFETERIA'])).toBe('/cafe/profile');
  });

  it('sends the client to the home', () => {
    expect(getHomeForRoles(['ROLE_CLIENTE'])).toBe('/home');
  });

  it('sends to the login when there is no role', () => {
    expect(getHomeForRoles([])).toBe('/login');
  });
});
