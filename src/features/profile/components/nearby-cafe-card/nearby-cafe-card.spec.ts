import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NearbyCafe } from '../../types/profile.model';
import { NearbyCafeCard } from './nearby-cafe-card';

registerLocaleData(localeEsAr);

const cafe: NearbyCafe = {
  id: 'cafe-1',
  name: 'Cafe Central',
  imageUrl: 'https://example.com/cafe.jpg',
  rating: 4.5,
  reviewCount: 12,
  isOpenNow: true,
  distanceMeters: null,
  maxPointsPerProduct: null,
  tagline: 'Café de especialidad',
};

describe('NearbyCafeCard', () => {
  let fixture: ComponentFixture<NearbyCafeCard>;
  let element: HTMLElement;

  function render(overrides: Partial<NearbyCafe> = {}) {
    TestBed.configureTestingModule({
      imports: [NearbyCafeCard],
      providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
    });
    fixture = TestBed.createComponent(NearbyCafeCard);
    fixture.componentRef.setInput('cafe', { ...cafe, ...overrides });
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  it('shows the photo of the cafe', () => {
    render();

    expect(element.querySelector('img')?.getAttribute('src')).toContain('example.com/cafe.jpg');
  });

  it('shows a placeholder instead of a broken image when the cafe has no photo', () => {
    render({ imageUrl: null });

    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('[data-testid="cafe-placeholder"]')).not.toBeNull();
    expect(element.textContent).toContain('Cafe Central');
  });

  it('renders the tagline and no distance or points hint when they are null', () => {
    render({ imageUrl: null });

    expect(element.textContent).toContain('Café de especialidad');
    expect(element.textContent).not.toContain('null');
    expect(element.textContent).not.toContain('Otorga hasta');
    expect(element.textContent).not.toMatch(/\bA \d/);
  });
});
