import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { OrderHistoryPage } from './pages/order-history-page/order-history-page';
import { HttpOrdersRepository } from './services/http-orders.repository';
import { MockOrdersRepository } from './services/mock-orders.repository';
import { OrderHistoryStore } from './services/order-history.store';
import { OrdersRepository } from './services/orders.repository';

export default [
  {
    path: '',
    providers: [
      {
        provide: OrdersRepository,
        useClass: environment.useMockApi ? MockOrdersRepository : HttpOrdersRepository,
      },
      OrderHistoryStore,
    ],
    children: [{ path: '', component: OrderHistoryPage }],
  },
] satisfies Routes;
