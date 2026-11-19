import { getHomeForRoles, getLoginForRoles } from './role-home';

describe('getHomeForRoles', () => {
  it('sends the superadmin to the admin panel', () => {
    expect(getHomeForRoles(['ROLE_SUPERADMIN'])).toBe('/admin');
  });

  it('sends the cafe to its profile', () => {
    expect(getHomeForRoles(['ROLE_CAFETERIA'])).toBe('/cafe/dashboard');
  });

  it('sends the client to the home', () => {
    expect(getHomeForRoles(['ROLE_CLIENTE'])).toBe('/home');
  });

  it('sends to the login when there is no role', () => {
    expect(getHomeForRoles([])).toBe('/login');
  });
});

describe('getLoginForRoles', () => {
  it('sends the superadmin to the superadmin login', () => {
    expect(getLoginForRoles(['ROLE_SUPERADMIN'])).toBe('/superadmin/login');
  });

  it('sends the cafe to the cafe login', () => {
    expect(getLoginForRoles(['ROLE_CAFETERIA'])).toBe('/cafe/login');
  });

  it('sends the client to the client login', () => {
    expect(getLoginForRoles(['ROLE_CLIENTE'])).toBe('/login');
  });

  it('sends to the client login when there is no role', () => {
    expect(getLoginForRoles([])).toBe('/login');
  });
});
