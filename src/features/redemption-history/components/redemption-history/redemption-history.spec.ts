import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RedemptionHistory } from './redemption-history';

describe('RedemptionHistory', () => {
  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [RedemptionHistory],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    const fixture = TestBed.createComponent(RedemptionHistory);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('should list only the used benefits', async () => {
    const fixture = await createComponent();
    const component = fixture.componentInstance;

    expect(component.isLoading()).toBe(false);
    expect(component.usedCount()).toBe(3);
    expect(component.redemptions().every((r) => r.usedDate !== null)).toBe(true);
    expect(component.totalUsedPoints()).toBe(950);
  });

  it('should show the redemption date and the cafe of each benefit', async () => {
    const fixture = await createComponent();
    const items = fixture.nativeElement.querySelectorAll('li.history-item');

    expect(items.length).toBe(3);
    expect(items[0].textContent).toContain('Cappuccino gratis');
    expect(items[0].textContent).toContain('Cafe Central');
    expect(items[0].textContent).toContain('Canjeado el');
    expect(items[2].textContent).toContain('Todas las cafeterías');
  });

  it('should show an empty message when there are no used benefits', async () => {
    const fixture = await createComponent();
    fixture.componentInstance.redemptions.set([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Todavía no usaste ningún beneficio');
  });
});
