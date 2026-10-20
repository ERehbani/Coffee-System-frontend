import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { OrderHistoryStore } from '../../services/order-history.store';
import { OrdersRepository } from '../../services/orders.repository';
import { CreateReviewInput, Order } from '../../types/order.model';
import { OrderHistoryPage } from './order-history-page';

const completedOrder: Order = {
  id: 'purchase-001',
  placedAt: new Date('2026-10-18T10:00:00Z'),
  total: 7800,
  status: 'completed',
  cafe: { id: 'cafe-central', name: 'Cafe Central', imageUrl: null },
  items: [{ id: 'detail-1', name: 'Flat white', quantity: 2, subtotal: 7800 }],
  review: null,
};

describe('OrderHistoryPage', () => {
  let fixture: ComponentFixture<OrderHistoryPage>;
  let element: HTMLElement;

  const repository = {
    getOrders: () => of([completedOrder]),
    createReview: (_order: Order, input: CreateReviewInput) =>
      of({ id: 'review-1', ...input, createdAt: new Date() }),
  };

  const findButton = (text: string) =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
      button.textContent?.includes(text),
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderHistoryPage],
      providers: [
        provideRouter([]),
        OrderHistoryStore,
        { provide: OrdersRepository, useValue: repository },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderHistoryPage);
    TestBed.flushEffects();
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('CA1: pressing "Dejar reseña" on a completed order shows the star selector and comment field', () => {
    expect(element.querySelector('app-review-form')).toBeNull();

    findButton('Dejar reseña')!.click();
    fixture.detectChanges();

    expect(element.querySelector('app-review-form')).not.toBeNull();
    expect(element.querySelectorAll('input[type="radio"]').length).toBe(5);
    expect(element.querySelector('textarea')).not.toBeNull();
  });

  it('CA2: after a successful submit the review option is disabled and the submission is confirmed', () => {
    findButton('Dejar reseña')!.click();
    fixture.detectChanges();

    element.querySelectorAll<HTMLInputElement>('input[type="radio"]')[4].click();
    fixture.detectChanges();
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(element.querySelector('app-review-form')).toBeNull();
    expect(findButton('Dejar reseña')).toBeUndefined();
    expect(findButton('Reseña enviada')?.disabled).toBe(true);
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Tu reseña de Cafe Central fue enviada',
    );
  });
});
