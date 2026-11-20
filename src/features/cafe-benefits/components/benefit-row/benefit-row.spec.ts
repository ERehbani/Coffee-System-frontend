import { TestBed } from '@angular/core/testing';
import { CafeBenefit } from '../../model/cafe-benefit.model';
import { BenefitRow } from './benefit-row';

describe('BenefitRow', () => {
  const benefit: CafeBenefit = {
    externalId: 'benefit-1',
    name: '2x1 Espresso',
    description: 'Dos por uno',
    pointsCost: 100,
    status: true,
    isPublic: true,
    maxRedemptions: 10,
    global: false,
  };

  function validityOf(dates: Pick<CafeBenefit, 'startDate' | 'endDate'>): string {
    const fixture = TestBed.createComponent(BenefitRow);
    fixture.componentRef.setInput('benefit', { ...benefit, ...dates });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return element.querySelector('[data-testid="benefit-validity"]')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BenefitRow] }).compileComponents();
  });

  it('shows the validity range when both dates are set', () => {
    expect(validityOf({ startDate: '2026-11-15', endDate: '2026-12-15' })).toBe(
      '15/11/2026 al 15/12/2026',
    );
  });

  it('shows only the start date when there is no end date', () => {
    expect(validityOf({ startDate: '2026-11-15', endDate: null })).toBe('Desde 15/11/2026');
  });

  it('shows only the end date when there is no start date', () => {
    expect(validityOf({ startDate: null, endDate: '2026-12-15' })).toBe('Hasta 15/12/2026');
  });

  it('says the benefit does not expire when there are no dates', () => {
    expect(validityOf({})).toBe('Sin vencimiento');
  });

  describe('actions', () => {
    function render(status: boolean) {
      const fixture = TestBed.createComponent(BenefitRow);
      fixture.componentRef.setInput('benefit', { ...benefit, status });
      fixture.detectChanges();
      return fixture;
    }

    function click(fixture: ReturnType<typeof render>, selector: string): void {
      (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(selector)!.click();
      fixture.detectChanges();
    }

    it('offers pausing an active benefit', () => {
      const fixture = render(true);
      const paused = vi.fn();
      fixture.componentInstance.pause.subscribe(paused);

      click(fixture, '[data-testid="pause-benefit"]');

      expect(paused).toHaveBeenCalledWith({ ...benefit, status: true });
      expect(fixture.nativeElement.querySelector('[data-testid="resume-benefit"]')).toBeNull();
    });

    it('offers resuming a paused benefit', () => {
      const fixture = render(false);
      const resumed = vi.fn();
      fixture.componentInstance.resume.subscribe(resumed);

      click(fixture, '[data-testid="resume-benefit"]');

      expect(resumed).toHaveBeenCalledWith({ ...benefit, status: false });
    });

    it('asks for confirmation before deleting', () => {
      const fixture = render(true);
      const removed = vi.fn();
      fixture.componentInstance.remove.subscribe(removed);

      click(fixture, '[data-testid="remove-benefit"]');

      expect(fixture.nativeElement.textContent).toContain('¿Eliminar esta promoción?');
      expect(removed).not.toHaveBeenCalled();

      const confirm = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === 'Eliminar',
      )!;
      confirm.click();

      expect(removed).toHaveBeenCalledWith({ ...benefit, status: true });
    });

    it('disables the actions while a change of this benefit is in progress', () => {
      const fixture = render(true);
      fixture.componentRef.setInput('busy', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-testid="pause-benefit"]').disabled).toBe(true);
      expect(fixture.nativeElement.querySelector('[data-testid="remove-benefit"]').disabled).toBe(true);
    });
  });
});
