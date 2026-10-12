import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturedBenefit } from '../../domain/client-dashboard.model';
import { FeaturedBenefitCard } from './featured-benefit-card';

describe('FeaturedBenefitCard', () => {
  const capuccino: FeaturedBenefit = {
    id: 'benefit-capuccino',
    title: 'Capuccino por tus puntos',
    description: 'Caliente o frío, leche a elección',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600',
    pointsCost: 300,
  };
  let fixture: ComponentFixture<FeaturedBenefitCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedBenefitCard],
    }).compileComponents();
    fixture = TestBed.createComponent(FeaturedBenefitCard);
    fixture.componentRef.setInput('benefit', capuccino);
  });

  async function render(availablePoints: number): Promise<HTMLButtonElement> {
    fixture.componentRef.setInput('availablePoints', availablePoints);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    if (!button) {
      throw new Error('Redeem button not found');
    }
    return button;
  }

  it('disables "Canjear" and explains why when the client cannot afford the benefit', async () => {
    const redeem = vi.fn();
    fixture.componentInstance.redeem.subscribe(redeem);
    const button = await render(100);

    button.click();

    expect(button.disabled).toBe(true);
    expect(redeem).not.toHaveBeenCalled();
    const hintId = button.getAttribute('aria-describedby');
    const hint = (fixture.nativeElement as HTMLElement).querySelector(`[id="${hintId}"]`);
    expect(hint?.textContent).toContain('Te faltan 200 pts');
  });

  it('emits the benefit id when the client can afford it', async () => {
    const redeem = vi.fn();
    fixture.componentInstance.redeem.subscribe(redeem);
    const button = await render(850);

    button.click();

    expect(button.disabled).toBe(false);
    expect(button.textContent).toContain('Canjear');
    expect(button.getAttribute('aria-describedby')).toBeNull();
    expect(redeem).toHaveBeenCalledWith('benefit-capuccino');
  });

  it('allows redeeming with exactly the required points', async () => {
    const button = await render(300);

    expect(button.disabled).toBe(false);
  });
});
