import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PurchaseHistory } from './purchase-history';

describe('PurchaseHistory', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseHistory],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the purchase history component', () => {
    const fixture = TestBed.createComponent(PurchaseHistory);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load purchases on init', async () => {
    const fixture = TestBed.createComponent(PurchaseHistory);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.purchases().length).toBeGreaterThan(0);
    expect(component.isLoading()).toBe(false);
  });

  it('should mark the purchase as reviewed after sending the review', async () => {
    const fixture = TestBed.createComponent(PurchaseHistory);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const purchase = component.purchases().find((o) => o.status === 'CONFIRMED' && !o.reviewed)!;
    component.openReview(purchase.externalId);
    component.submitReview(purchase, { rating: 5, message: 'Excelente atención' });

    const updated = component.purchases().find((o) => o.externalId === purchase.externalId)!;
    expect(updated.reviewed).toBe(true);
    expect(component.reviewingPurchaseId()).toBeNull();
    expect(component.successMessage()).toContain(purchase.cafeName);
  });
});
