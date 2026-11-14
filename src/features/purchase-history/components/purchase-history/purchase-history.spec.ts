import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { Purchase, Review, ReviewRequest } from '../../model/purchase.model';
import { PurchaseService } from '../../services/purchase.service';
import {
  PENDING_REVIEW_PURCHASE_FIXTURE,
  PURCHASES_FIXTURE,
  REVIEW_FIXTURE,
} from '../../utils/purchase.fixture';
import { PurchaseHistory } from './purchase-history';

describe('PurchaseHistory', () => {
  let getMyPurchases: Mock<() => Observable<Purchase[]>>;
  let createReview: Mock<(request: ReviewRequest) => Observable<Review>>;

  function render(): ComponentFixture<PurchaseHistory> {
    const fixture = TestBed.createComponent(PurchaseHistory);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    getMyPurchases = vi.fn(() => of(PURCHASES_FIXTURE));
    createReview = vi.fn(() => of(REVIEW_FIXTURE));
    await TestBed.configureTestingModule({
      imports: [PurchaseHistory],
      providers: [
        provideRouter([]),
        { provide: PurchaseService, useValue: { getMyPurchases, createReview } },
      ],
    }).compileComponents();
  });

  it('should load purchases on init', () => {
    const component = render().componentInstance;

    expect(component.purchases()).toEqual(PURCHASES_FIXTURE);
    expect(component.isLoading()).toBe(false);
    expect(component.hasError()).toBe(false);
  });

  it('lists the newest purchase first and adds up the totals', () => {
    const component = render().componentInstance;

    expect(component.sortedPurchases().map((purchase) => purchase.externalId)).toEqual([
      'purchase-002',
      'purchase-001',
    ]);
    expect(component.totalSpent()).toBe(10600);
    expect(component.totalPoints()).toBe(100);
  });

  it('should mark the purchase as reviewed after sending the review', () => {
    const component = render().componentInstance;
    const purchase = PENDING_REVIEW_PURCHASE_FIXTURE;

    component.openReview(purchase.externalId);
    component.submitReview(purchase, { rating: 5, message: 'Excelente atención' });

    const updated = component.purchases().find((p) => p.externalId === purchase.externalId);
    expect(createReview).toHaveBeenCalledWith({
      cafeId: purchase.cafeId,
      purchaseId: purchase.externalId,
      rating: 5,
      message: 'Excelente atención',
    });
    expect(updated?.reviewed).toBe(true);
    expect(component.reviewingPurchaseId()).toBeNull();
    expect(component.successMessage()).toContain(purchase.cafeName);
  });

  it('keeps the review open and explains it when the backend rejects it', () => {
    createReview.mockReturnValueOnce(throwError(() => new Error('400')));
    const component = render().componentInstance;
    const purchase = PENDING_REVIEW_PURCHASE_FIXTURE;

    component.openReview(purchase.externalId);
    component.submitReview(purchase, { rating: 5, message: 'Excelente atención' });

    expect(component.reviewError()).toBe('No pudimos enviar tu reseña. Intentá de nuevo.');
    expect(component.reviewingPurchaseId()).toBe(purchase.externalId);
    expect(component.isSubmitting()).toBe(false);
  });

  describe('when the purchases fail to load', () => {
    beforeEach(() => getMyPurchases.mockReturnValueOnce(throwError(() => new Error('500'))));

    it('shows an error instead of the empty history', () => {
      const fixture = render();
      const element: HTMLElement = fixture.nativeElement;

      expect(fixture.componentInstance.hasError()).toBe(true);
      expect(element.querySelector('[role="alert"]')?.textContent).toContain(
        'No pudimos cargar tus compras',
      );
      expect(element.textContent).not.toContain('Todavía no hiciste compras');
    });

    it('loads the purchases when the client retries', () => {
      const fixture = render();
      const element: HTMLElement = fixture.nativeElement;

      element.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
      fixture.detectChanges();

      expect(getMyPurchases).toHaveBeenCalledTimes(2);
      expect(fixture.componentInstance.hasError()).toBe(false);
      expect(element.querySelectorAll('app-purchase-card').length).toBe(PURCHASES_FIXTURE.length);
    });
  });
});
