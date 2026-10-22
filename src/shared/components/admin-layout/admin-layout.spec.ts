import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AdminLayout } from './admin-layout';

const EXPECTED_ITEMS = [
  { label: 'Panel', href: '/admin/dashboard' },
  { label: 'Usuarios', href: '/admin/users' },
  { label: 'Clientes', href: '/admin/clients' },
  { label: 'Cafeterías', href: '/admin/cafes' },
  { label: 'Tiers', href: '/admin/tiers' },
  { label: 'Categorías', href: '/admin/categories' },
  { label: 'Tipos de beneficio', href: '/admin/benefit-types' },
  { label: 'Beneficios globales', href: '/admin/global-benefits' },
  { label: 'Historial de compras', href: '/admin/purchases' },
];

describe('AdminLayout', () => {
  let fixture: ComponentFixture<AdminLayout>;
  let root: HTMLElement;

  const menuButton = () => root.querySelector<HTMLButtonElement>('button[aria-controls]');
  const backdrop = () => root.querySelector<HTMLElement>('[data-testid="admin-backdrop"]');
  const navLinks = () => Array.from(root.querySelectorAll<HTMLAnchorElement>('nav[aria-label] a'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayout);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('shows the brand in the sidebar', () => {
    const brand = root.querySelector('aside [data-testid="admin-brand"]');

    expect(brand?.textContent?.trim()).toBe('Coffee System');
  });

  it('renders the nine sections in order inside the "Administración" navigation landmark', () => {
    const nav = root.querySelector('nav');

    expect(nav?.getAttribute('aria-label')).toBe('Administración');
    expect(navLinks().map((link) => link.textContent?.trim())).toEqual(
      EXPECTED_ITEMS.map((item) => item.label),
    );
    expect(navLinks().map((link) => link.getAttribute('href'))).toEqual(
      EXPECTED_ITEMS.map((item) => item.href),
    );
  });

  it('shows the role caption and a link back to the client app in the footer', () => {
    const footer = root.querySelector('aside footer');
    const backLink = footer?.querySelector<HTMLAnchorElement>('a');

    expect(footer?.textContent).toContain('Superadmin');
    expect(backLink?.textContent?.trim()).toBe('Volver a la app');
    expect(backLink?.getAttribute('href')).toBe('/home');
  });

  it('renders the routed content outside of a nested main landmark', () => {
    expect(root.querySelector('router-outlet')).not.toBeNull();
    expect(root.querySelector('main')).toBeNull();
  });

  it('marks the current section with aria-current="page"', async () => {
    await TestBed.inject(Router).navigateByUrl('/admin/tiers');
    await fixture.whenStable();

    const current = navLinks().filter((link) => link.getAttribute('aria-current') === 'page');

    expect(current.map((link) => link.textContent?.trim())).toEqual(['Tiers']);
  });

  describe('off-canvas menu below lg', () => {
    it('starts collapsed with an accessible menu button wired to the sidebar', () => {
      const button = menuButton();
      const sidebar = root.querySelector('aside');

      expect(button?.getAttribute('aria-expanded')).toBe('false');
      expect(button?.getAttribute('aria-label')).toBe('Abrir menú');
      expect(sidebar?.id).toBeTruthy();
      expect(button?.getAttribute('aria-controls')).toBe(sidebar?.id);
      expect(backdrop()).toBeNull();
    });

    it('opens when the menu button is clicked and swaps the icon', async () => {
      menuButton()?.click();
      await fixture.whenStable();

      expect(menuButton()?.getAttribute('aria-expanded')).toBe('true');
      expect(menuButton()?.getAttribute('aria-label')).toBe('Cerrar menú');
      expect(backdrop()).not.toBeNull();
      expect(menuButton()?.querySelectorAll('svg path').length).toBe(2);
    });

    it('closes when the menu button is clicked again', async () => {
      menuButton()?.click();
      await fixture.whenStable();
      menuButton()?.click();
      await fixture.whenStable();

      expect(menuButton()?.getAttribute('aria-expanded')).toBe('false');
      expect(menuButton()?.getAttribute('aria-label')).toBe('Abrir menú');
      expect(backdrop()).toBeNull();
      expect(menuButton()?.querySelectorAll('svg path').length).toBe(3);
    });

    it('closes when the backdrop is clicked', async () => {
      menuButton()?.click();
      await fixture.whenStable();

      backdrop()?.click();
      await fixture.whenStable();

      expect(menuButton()?.getAttribute('aria-expanded')).toBe('false');
      expect(backdrop()).toBeNull();
    });

    it('closes and returns focus to the menu button when Escape is pressed', async () => {
      menuButton()?.click();
      await fixture.whenStable();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();

      expect(menuButton()?.getAttribute('aria-expanded')).toBe('false');
      expect(backdrop()).toBeNull();
      expect(document.activeElement).toBe(menuButton());
    });

    it('does not steal focus when Escape is pressed while collapsed', async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();

      expect(document.activeElement).not.toBe(menuButton());
    });

    it('closes when a section is selected', async () => {
      menuButton()?.click();
      await fixture.whenStable();

      navLinks()[4].click();
      await fixture.whenStable();

      expect(menuButton()?.getAttribute('aria-expanded')).toBe('false');
      expect(backdrop()).toBeNull();
    });
  });
});
