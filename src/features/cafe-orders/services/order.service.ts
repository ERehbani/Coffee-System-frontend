import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderPage } from '../model/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/purchases`;

  getActiveOrders(): Observable<OrderPage> {
    return this.http.get<OrderPage>(this.url, {
      params: { status: ['CONFIRMED', 'IN_PREPARATION'], size: 100 },
    });
  }

  takeOrder(externalId: string): Observable<Order> {
    return this.http.patch<Order>(`${this.url}/${externalId}/status`, { status: 'IN_PREPARATION' });
  }
}
