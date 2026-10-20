import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateReviewInput } from '../../types/order.model';
import { ReviewForm } from './review-form';

describe('ReviewForm', () => {
  let fixture: ComponentFixture<ReviewForm>;
  let element: HTMLElement;
  let emitted: CreateReviewInput | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ReviewForm] }).compileComponents();
    fixture = TestBed.createComponent(ReviewForm);
    fixture.componentRef.setInput('orderId', 'purchase-001');
    fixture.componentRef.setInput('cafeName', 'Cafe Central');
    emitted = null;
    fixture.componentInstance.submitted.subscribe((value) => (emitted = value));
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  const submit = () => {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  it('shows a 1 to 5 star selector and a comment field', () => {
    const stars = element.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    expect(Array.from(stars).map((star) => star.value)).toEqual(['1', '2', '3', '4', '5']);
    expect(element.querySelector('textarea')).not.toBeNull();
  });

  it('requires a rating before sending', () => {
    submit();

    expect(emitted).toBeNull();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Elige una calificación');
  });

  it('emits the selected rating and trimmed comment', () => {
    const fourStars = element.querySelectorAll<HTMLInputElement>('input[type="radio"]')[3];
    fourStars.click();
    const textarea = element.querySelector('textarea')!;
    textarea.value = '  Muy rico  ';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    submit();

    expect(emitted).toEqual({ rating: 4, comment: 'Muy rico' });
  });

  it('disables the form while submitting', () => {
    fixture.componentRef.setInput('isSubmitting', true);
    fixture.detectChanges();

    const submitButton = element.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(submitButton.disabled).toBe(true);
    expect(submitButton.textContent).toContain('Enviando');
  });
});
