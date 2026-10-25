import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrderHistory } from './order-history';

describe('OrderHistory', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderHistory],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the order history component', () => {
    const fixture = TestBed.createComponent(OrderHistory);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load orders on init', async () => {
    const fixture = TestBed.createComponent(OrderHistory);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.orders().length).toBeGreaterThan(0);
    expect(component.isLoading()).toBe(false);
  });

  it('should mark the order as reviewed after sending the review', async () => {
    const fixture = TestBed.createComponent(OrderHistory);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const order = component.orders().find((o) => o.status === 'CONFIRMED' && !o.reviewed)!;
    component.openReview(order.externalId);
    component.submitReview(order, { rating: 5, message: 'Excelente atención' });

    const updated = component.orders().find((o) => o.externalId === order.externalId)!;
    expect(updated.reviewed).toBe(true);
    expect(component.reviewingOrderId()).toBeNull();
    expect(component.successMessage()).toContain(order.cafeName);
  });
});
