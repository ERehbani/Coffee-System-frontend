import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { Redemption } from '../../model/redemption.model';
import { RedemptionService } from '../../services/redemption.service';
import { READY_REDEMPTION_FIXTURE, USED_REDEMPTION_FIXTURE } from '../../utils/redemption.fixture';
import { RedemptionDetail } from './redemption-detail';

describe('RedemptionDetail', () => {
  async function createComponent(
    result: Observable<Redemption | undefined>,
  ): Promise<ComponentFixture<RedemptionDetail>> {
    await TestBed.configureTestingModule({
      imports: [RedemptionDetail],
      providers: [
        provideRouter([]),
        { provide: RedemptionService, useValue: { getById: () => result } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'redemption-001' }) } },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RedemptionDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('should show the qr, the code, the conditions and the expiry date', async () => {
    const fixture = await createComponent(of(READY_REDEMPTION_FIXTURE));
    const component = fixture.componentInstance;
    const element: HTMLElement = fixture.nativeElement;

    expect(component.isReadyToUse()).toBe(true);
    expect(element.querySelector('app-qr-code svg')).not.toBeNull();
    expect(element.querySelector('.redemption-code')?.textContent?.trim()).toBe('VLD-8492-C0FF');
    expect(component.conditions().length).toBe(3);
    expect(element.textContent).toContain('No acumulable con otras promociones.');
    expect(element.textContent).toContain('Vencimiento');
    expect(component.expiryDate()).toEqual(new Date(2026, 11, 31));
    expect(element.textContent).toContain('Válido en todas las cafeterías');
  });

  it('should not show the qr when the redemption was already used', async () => {
    const fixture = await createComponent(of(USED_REDEMPTION_FIXTURE));
    const element: HTMLElement = fixture.nativeElement;

    expect(fixture.componentInstance.isReadyToUse()).toBe(false);
    expect(element.querySelector('app-qr-code')).toBeNull();
    expect(element.textContent).toContain('Este canje ya fue usado');
  });

  it('should show a not found message when the redemption does not exist', async () => {
    const fixture = await createComponent(of(undefined));
    const element: HTMLElement = fixture.nativeElement;

    expect(fixture.componentInstance.redemption()).toBeNull();
    expect(element.textContent).toContain('No encontramos este canje');
  });

  it('should offer to retry when the redemption cannot be loaded', async () => {
    const fixture = await createComponent(throwError(() => new Error('500')));
    const element: HTMLElement = fixture.nativeElement;

    expect(fixture.componentInstance.hasError()).toBe(true);
    expect(element.textContent).toContain('No pudimos cargar tu canje');
    expect(element.textContent).toContain('Reintentar');
  });
});
