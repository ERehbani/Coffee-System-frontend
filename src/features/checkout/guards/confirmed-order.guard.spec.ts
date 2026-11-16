import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { CheckoutRepository } from '../services/checkout.repository';
import { CheckoutStore } from '../services/checkout.store';
import {
  buildPurchaseResponse,
  CHECKOUT_CAFE_FIXTURE,
  CHECKOUT_ITEMS_FIXTURE,
} from '../utils/checkout.fixture';
import { toConfirmedOrder } from '../utils/checkout.mapper';
import { confirmedOrderGuard } from './confirmed-order.guard';

describe('confirmedOrderGuard', () => {
  let store: CheckoutStore;

  function runGuard() {
    return runInInjectionContext(TestBed.inject(EnvironmentInjector), () =>
      confirmedOrderGuard({} as never, {} as never),
    );
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        CheckoutStore,
        { provide: CheckoutRepository, useValue: {} },
      ],
    });
    store = TestBed.inject(CheckoutStore);
  });

  afterEach(() => localStorage.clear());

  it('redirects to the purchase history when there is no confirmed order', () => {
    const result = runGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/purchases');
  });

  it('lets the client in when there is a confirmed order', () => {
    store.confirmedOrder.set(
      toConfirmedOrder(
        buildPurchaseResponse('purchase-1', CHECKOUT_CAFE_FIXTURE, CHECKOUT_ITEMS_FIXTURE, new Date()),
      ),
    );

    expect(runGuard()).toBe(true);
  });
});
