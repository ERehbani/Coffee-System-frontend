import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveRedemptionView } from '../../services/profile.store';
import { ActiveRedemptionCard } from './active-redemption-card';

const redemption: ActiveRedemptionView = {
  id: 'redemption-1',
  title: 'Café de cortesía',
  description: 'Un café a elección',
  code: 'VLD-0001',
  expiresAt: new Date(2026, 11, 31),
  expiresAtHasTime: false,
  daysUntilExpiry: 5,
  cafeName: null,
  conditions: [],
};

describe('ActiveRedemptionCard', () => {
  let fixture: ComponentFixture<ActiveRedemptionCard>;
  let element: HTMLElement;

  function render(overrides: Partial<ActiveRedemptionView> = {}) {
    TestBed.configureTestingModule({ imports: [ActiveRedemptionCard] });
    fixture = TestBed.createComponent(ActiveRedemptionCard);
    fixture.componentRef.setInput('redemption', { ...redemption, ...overrides });
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  it('shows when the coupon expires', () => {
    render();

    expect(element.textContent).toContain('Expira en 5 días');
  });

  it('omits the expiry line when the coupon never expires', () => {
    render({ expiresAt: null, daysUntilExpiry: null });

    expect(element.textContent).not.toContain('Expira');
    expect(element.textContent).not.toContain('null');
    expect(element.textContent).toContain('VLD-0001');
  });
});
