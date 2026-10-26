import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { RedemptionDetail } from './redemption-detail';

describe('RedemptionDetail', () => {
  async function createComponent(id: string) {
    await TestBed.configureTestingModule({
      imports: [RedemptionDetail],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id }) } } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RedemptionDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('should show the qr, the code, the conditions and the expiry date', async () => {
    const fixture = await createComponent('redemption-001');
    const component = fixture.componentInstance;
    const element: HTMLElement = fixture.nativeElement;

    expect(component.isReadyToUse()).toBe(true);
    expect(element.querySelector('app-qr-code svg')).not.toBeNull();
    expect(element.querySelector('.redemption-code')?.textContent?.trim()).toBe('VLD-8492-C0FF');
    expect(component.conditions().length).toBe(3);
    expect(element.textContent).toContain('No acumulable con otras promociones.');
    expect(element.textContent).toContain('Vencimiento');
    expect(component.expiryDate()).toEqual(new Date(2026, 11, 31));
  });

  it('should not show the qr when the redemption was already used', async () => {
    const fixture = await createComponent('redemption-104');
    const element: HTMLElement = fixture.nativeElement;

    expect(fixture.componentInstance.isReadyToUse()).toBe(false);
    expect(element.querySelector('app-qr-code')).toBeNull();
    expect(element.textContent).toContain('Este canje ya fue usado');
  });

  it('should show a not found message when the redemption does not exist', async () => {
    const fixture = await createComponent('missing');
    const element: HTMLElement = fixture.nativeElement;

    expect(fixture.componentInstance.redemption()).toBeNull();
    expect(element.textContent).toContain('No encontramos este canje');
  });
});
