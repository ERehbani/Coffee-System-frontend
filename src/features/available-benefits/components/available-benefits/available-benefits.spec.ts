import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MOCK_CAFES } from '../../../home/data/cafes.mock';
import { ProfileRepository } from '../../../profile/services/profile.repository';
import { AvailableBenefits } from './available-benefits';

describe('AvailableBenefits', () => {
  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [AvailableBenefits],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProfileRepository, useValue: { getTierDetail: () => of({ currentTierThreshold: 1000 }) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AvailableBenefits);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('should list the whole catalog with the requirements of each benefit', async () => {
    const fixture = await createComponent();
    const cards = fixture.nativeElement.querySelectorAll('app-benefit-card');

    expect(fixture.componentInstance.benefits().length).toBe(5);
    expect(cards.length).toBe(5);
    expect(cards[0].textContent).toContain('Requisitos');
    expect(cards[0].textContent).toContain('150 pts');
    expect(cards[0].textContent).toContain('Nivel BRONCE');
    expect(cards[2].textContent).toContain('Todas las cafeterías');
  });

  it('should filter by cafe', async () => {
    const fixture = await createComponent();
    const component = fixture.componentInstance;

    component.selectCafe(MOCK_CAFES[0].externalId);
    fixture.detectChanges();

    expect(component.benefits().every((benefit) => benefit.cafeEntity === 'Cafe Central')).toBe(true);
    expect(component.benefits().length).toBe(2);
    expect(component.hasFilters()).toBe(true);
  });

  it('should filter by benefit type', async () => {
    const fixture = await createComponent();
    const component = fixture.componentInstance;

    component.selectType('PRODUCTO_POR_PUNTOS');
    fixture.detectChanges();

    expect(component.benefits().every((benefit) => benefit.benefitType === 'PRODUCTO_POR_PUNTOS')).toBe(true);
    expect(component.benefits().length).toBe(2);
  });

  it('should mark which benefits the client can already access', async () => {
    const fixture = await createComponent();
    const text = fixture.nativeElement.textContent;

    expect(fixture.componentInstance.unlockedCount()).toBe(3);
    expect(text).toContain('Disponible');
    expect(text).toContain('Bloqueado');
  });

  it('should show an empty message and clear the filters', async () => {
    const fixture = await createComponent();
    const component = fixture.componentInstance;

    component.selectCafe(MOCK_CAFES[3].externalId);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No encontramos beneficios');

    component.clearFilters();
    fixture.detectChanges();
    expect(component.benefits().length).toBe(5);
    expect(component.hasFilters()).toBe(false);
  });
});
