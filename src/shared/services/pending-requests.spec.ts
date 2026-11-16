import { TestBed } from '@angular/core/testing';
import { PendingRequests } from './pending-requests';

describe('PendingRequests', () => {
  let pendingRequests: PendingRequests;

  beforeEach(() => {
    pendingRequests = TestBed.inject(PendingRequests);
  });

  it('starts with nothing pending', () => {
    expect(pendingRequests.hasPending()).toBe(false);
  });

  it('has pending requests until every started one finishes', () => {
    pendingRequests.start();
    pendingRequests.start();

    pendingRequests.finish();
    expect(pendingRequests.hasPending()).toBe(true);

    pendingRequests.finish();
    expect(pendingRequests.hasPending()).toBe(false);
  });

  it('ignores a finish without a matching start', () => {
    pendingRequests.finish();
    pendingRequests.start();

    expect(pendingRequests.hasPending()).toBe(true);
  });
});
