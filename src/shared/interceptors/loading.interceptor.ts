import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { Observable, combineLatest, finalize, map, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { PendingRequests } from '../services/pending-requests';

function holdFor<T>(source: Observable<T>, minimumMs: number): Observable<T> {
  return combineLatest([source, timer(minimumMs)]).pipe(map(([event]) => event));
}

export const loadingInterceptor: HttpInterceptorFn = (request, next) => {
  const isDataLoad = request.method === 'GET' && isPlatformBrowser(inject(PLATFORM_ID));
  if (!isDataLoad) {
    return next(request);
  }

  const pendingRequests = inject(PendingRequests);
  pendingRequests.start();

  return holdFor(next(request), environment.minLoadingMs).pipe(
    finalize(() => pendingRequests.finish()),
  );
};
