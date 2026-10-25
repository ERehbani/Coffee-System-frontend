import { Routes } from '@angular/router';
import { OrderHistory } from './components/order-history/order-history';

export default [
  {
    path: '',
    component: OrderHistory,
  },
] satisfies Routes;
