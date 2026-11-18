import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BottomNav } from './bottom-nav';

const EXPECTED_ITEMS = [
  { label: 'Inicio', href: '/home' },
  { label: 'Catálogo', href: '/catalog' },
  { label: 'Carrito', href: '/cart' },
  { label: 'Beneficios', href: '/rewards' },
];

describe('BottomNav', () => {
  let fixture: ComponentFixture<BottomNav>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNav);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('muestra las cuatro secciones del cliente en español', () => {
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('nav a'));

    expect(links.map((link) => link.textContent?.trim())).toEqual(
      EXPECTED_ITEMS.map((item) => item.label),
    );
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      EXPECTED_ITEMS.map((item) => item.href),
    );
  });
});
