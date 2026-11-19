import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { Purchase, PurchaseStatus } from '../../model/purchase.model';
import { PENDING_REVIEW_PURCHASE_FIXTURE } from '../../utils/purchase.fixture';
import { RefundPurchase } from './refund-purchase';

describe('RefundPurchase', () => {
  const statusUrl = `${environment.apiBaseUrl}/purchases/purchase-001/status`;
  let fixture: ComponentFixture<RefundPurchase>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let refunded: Purchase | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefundPurchase],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function render(purchase: Purchase): void {
    fixture = TestBed.createComponent(RefundPurchase);
    element = fixture.nativeElement;
    refunded = null;
    fixture.componentInstance.refunded.subscribe((updated) => (refunded = updated));
    fixture.componentRef.setInput('purchase', purchase);
    fixture.detectChanges();
  }

  function click(text: string): void {
    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === text)!
      .click();
    fixture.detectChanges();
  }

  it.each<PurchaseStatus>(['CONFIRMED', 'IN_PREPARATION', 'READY', 'DELIVERED'])(
    'offers the refund of a %s order',
    (status) => {
      render({ ...PENDING_REVIEW_PURCHASE_FIXTURE, status });

      expect(element.querySelector('[data-testid="refund-purchase"]')).not.toBeNull();
    },
  );

  it.each<PurchaseStatus>(['CANCELLED', 'REFUNDED'])(
    'does not offer the refund of a %s order',
    (status) => {
      render({ ...PENDING_REVIEW_PURCHASE_FIXTURE, status });

      expect(element.textContent?.trim()).toBe('');
    },
  );

  it('explains how many points the client loses before refunding', () => {
    render({ ...PENDING_REVIEW_PURCHASE_FIXTURE, status: 'DELIVERED' });

    click('Reembolsar pedido');

    expect(element.querySelector('[data-testid="refund-confirmation"]')?.textContent).toContain(
      '55 puntos',
    );
    expect(element.textContent).not.toContain('cupón');
    http.expectNone(statusUrl);
  });

  it('mentions that the coupon comes back when the order used one', () => {
    render({
      ...PENDING_REVIEW_PURCHASE_FIXTURE,
      status: 'DELIVERED',
      redemptionId: 'redemption-1',
    });

    click('Reembolsar pedido');

    expect(element.textContent).toContain('El cupón que usó vuelve a quedar disponible');
  });

  it('marks the order as refunded and hands the updated order to the page', () => {
    render({ ...PENDING_REVIEW_PURCHASE_FIXTURE, status: 'DELIVERED' });

    click('Reembolsar pedido');
    click('Sí, reembolsar');

    const request = http.expectOne(statusUrl);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'REFUNDED' });
    request.flush({ ...PENDING_REVIEW_PURCHASE_FIXTURE, status: 'REFUNDED' });

    expect(refunded?.status).toBe('REFUNDED');
  });

  it('keeps the confirmation open with the reason when the backend rejects the refund', () => {
    render({ ...PENDING_REVIEW_PURCHASE_FIXTURE, status: 'DELIVERED' });

    click('Reembolsar pedido');
    click('Sí, reembolsar');
    http
      .expectOne(statusUrl)
      .flush(
        { detail: 'A purchase cannot go from REFUNDED to REFUNDED' },
        { status: 409, statusText: 'Conflict' },
      );
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'El pedido ya cambió de estado y no se puede reembolsar.',
    );
    expect(element.textContent).not.toContain('cannot go from');
    expect(refunded).toBeNull();
  });
});
