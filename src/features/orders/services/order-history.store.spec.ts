import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CreateReviewInput, Order, OrderReview } from '../types/order.model';
import { OrderHistoryStore } from './order-history.store';
import { OrdersRepository } from './orders.repository';

const completedOrder: Order = {
  id: 'purchase-002',
  placedAt: new Date('2026-10-18T10:00:00Z'),
  total: 4500,
  status: 'completed',
  cafe: { id: 'cafe-norte', name: 'Cafe Norte', imageUrl: null },
  items: [{ id: 'detail-1', name: 'Filtrado V60', quantity: 1, subtotal: 4500 }],
  review: null,
};

const cancelledOrder: Order = {
  ...completedOrder,
  id: 'purchase-001',
  placedAt: new Date('2026-10-10T10:00:00Z'),
  status: 'cancelled',
};

const sentReview: OrderReview = {
  id: 'review-1',
  rating: 5,
  comment: 'Excelente',
  createdAt: new Date('2026-10-20T10:00:00Z'),
};

describe('OrderHistoryStore', () => {
  let store: OrderHistoryStore;
  let repository: {
    getOrders: () => ReturnType<OrdersRepository['getOrders']>;
    createReview: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repository = {
      getOrders: () => of([cancelledOrder, completedOrder]),
      createReview: vi.fn((_order: Order, _input: CreateReviewInput) => of(sentReview)),
    };
    TestBed.configureTestingModule({
      providers: [OrderHistoryStore, { provide: OrdersRepository, useValue: repository }],
    });
    store = TestBed.inject(OrderHistoryStore);
    TestBed.flushEffects();
  });

  it('loads orders sorted from newest to oldest', () => {
    expect(store.status()).toBe('ready');
    expect(store.orders().map((order) => order.id)).toEqual(['purchase-002', 'purchase-001']);
  });

  it('opens the review form only for completed orders without a review', () => {
    store.openReview('purchase-001');
    expect(store.reviewingOrderId()).toBeNull();

    store.openReview('purchase-002');
    expect(store.reviewingOrderId()).toBe('purchase-002');
  });

  it('sends the review, marks the order as reviewed and confirms it', () => {
    store.openReview('purchase-002');
    store.submitReview('purchase-002', { rating: 5, comment: 'Excelente' });

    expect(repository.createReview).toHaveBeenCalledWith(completedOrder, {
      rating: 5,
      comment: 'Excelente',
    });
    expect(store.orders()[0].review).toEqual(sentReview);
    expect(store.reviewingOrderId()).toBeNull();
    expect(store.submittingOrderId()).toBeNull();
    expect(store.successMessage()).toContain('Cafe Norte');
  });

  it('does not allow reviewing the same order twice', () => {
    store.submitReview('purchase-002', { rating: 5, comment: '' });
    store.openReview('purchase-002');
    store.submitReview('purchase-002', { rating: 3, comment: '' });

    expect(store.reviewingOrderId()).toBeNull();
    expect(repository.createReview).toHaveBeenCalledTimes(1);
  });

  it('keeps the form open and shows an error when the backend fails', () => {
    repository.createReview.mockReturnValue(throwError(() => new Error('500')));

    store.openReview('purchase-002');
    store.submitReview('purchase-002', { rating: 4, comment: '' });

    expect(store.reviewingOrderId()).toBe('purchase-002');
    expect(store.reviewError()).toBe('No pudimos enviar tu reseña. Inténtalo de nuevo.');
    expect(store.orders()[0].review).toBeNull();
    expect(store.successMessage()).toBeNull();
  });
});
