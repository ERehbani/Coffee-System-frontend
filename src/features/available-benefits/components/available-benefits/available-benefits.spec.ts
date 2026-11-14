import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CafeService } from '../../../home/services/cafe.service';
import { ProfileRepository } from '../../../profile/services/profile.repository';
import { AvailableBenefitService } from '../../services/available-benefit.service';
import { CAFE_BENEFIT_FIXTURE, GLOBAL_BENEFIT_FIXTURE } from '../../utils/available-benefit.fixture';
import { AvailableBenefits } from './available-benefits';

describe('AvailableBenefits', () => {
  let getAvailable: ReturnType<typeof vi.fn>;

  function render(): ComponentFixture<AvailableBenefits> {
    const fixture = TestBed.createComponent(AvailableBenefits);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    getAvailable = vi.fn(() => of([GLOBAL_BENEFIT_FIXTURE, CAFE_BENEFIT_FIXTURE]));
    await TestBed.configureTestingModule({
      imports: [AvailableBenefits],
      providers: [
        { provide: AvailableBenefitService, useValue: { getAvailable } },
        {
          provide: CafeService,
          useValue: { getAll: () => of([{ externalId: 'cafe-central', name: 'Cafe Central' }]) },
        },
        { provide: ProfileRepository, useValue: { getTierDetail: () => of({ currentTierThreshold: 0 }) } },
      ],
    }).compileComponents();
  });

  it('shows a card for every active benefit of the platform', () => {
    const fixture = render();
    const cards = fixture.nativeElement.querySelectorAll('app-available-benefit-card');

    expect(getAvailable).toHaveBeenCalledWith('', '');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('Descuento 15% bienvenida');
    expect(cards[1].textContent).toContain('Cafe Central');
  });

  it('counts the benefits the tier of the client unlocks', () => {
    const component = render().componentInstance;

    expect(component.unlockedCount()).toBe(1);
  });

  it('asks again with the cafe and the type chosen and clears them', () => {
    const component = render().componentInstance;

    component.selectCafe('cafe-central');
    component.selectType('PRODUCTO_POR_PUNTOS');
    expect(getAvailable).toHaveBeenLastCalledWith('cafe-central', 'PRODUCTO_POR_PUNTOS');
    expect(component.hasFilters()).toBe(true);

    component.clearFilters();
    expect(getAvailable).toHaveBeenLastCalledWith('', '');
    expect(component.hasFilters()).toBe(false);
  });

  it('offers to retry when the catalog cannot be loaded', () => {
    getAvailable.mockReturnValue(throwError(() => new Error('offline')));
    const fixture = render();

    expect(fixture.componentInstance.hasError()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('No pudimos cargar los beneficios');
  });

  it('explains when no benefit matches the filters', () => {
    getAvailable.mockReturnValue(of([]));
    const fixture = render();

    expect(fixture.nativeElement.textContent).toContain('No encontramos beneficios');
  });
});
