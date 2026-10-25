import { TestBed } from '@angular/core/testing';
import { ReviewFormData } from '../../model/order.model';
import { ReviewForm } from './review-form';

describe('ReviewForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewForm],
    }).compileComponents();
  });

  function createForm() {
    const fixture = TestBed.createComponent(ReviewForm);
    fixture.componentRef.setInput('cafeName', 'Cafe Central');
    fixture.detectChanges();
    return fixture;
  }

  it('should not submit without rating and message', () => {
    const fixture = createForm();
    const component = fixture.componentInstance;
    let sent: ReviewFormData | null = null;
    component.submitted.subscribe((data) => (sent = data));

    component.onSubmit(new Event('submit'));

    expect(sent).toBeNull();
    expect(component.ratingError()).not.toBeNull();
    expect(component.messageError()).not.toBeNull();
  });

  it('should submit the rating and the message', () => {
    const fixture = createForm();
    const component = fixture.componentInstance;
    let sent: ReviewFormData | null = null;
    component.submitted.subscribe((data) => (sent = data));

    component.setRating(4);
    component.reviewModel.update((review) => ({ ...review, message: '  Muy rico  ' }));
    component.onSubmit(new Event('submit'));

    expect(sent).toEqual({ rating: 4, message: 'Muy rico' });
  });
});
