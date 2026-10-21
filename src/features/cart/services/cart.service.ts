import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../../catalog/model/product.model';
import { Cafe } from '../../home/model/cafe.model';
import { CartCafe, CartItem } from '../model/cart.model';

const STORAGE_KEY = 'coffee-system-cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  items = signal<CartItem[]>([]);
  cafe = signal<CartCafe | null>(null);

  totalItems = computed(() => {
    let total = 0;
    for (const item of this.items()) {
      total += item.quantity;
    }
    return total;
  });

  totalPrice = computed(() => {
    let total = 0;
    for (const item of this.items()) {
      total += item.product.price * item.quantity;
    }
    return total;
  });

  constructor() {
    this.loadFromStorage();
  }

  isFromAnotherCafe(product: Product): boolean {
    const currentCafe = this.cafe();
    if (!currentCafe || this.items().length === 0) {
      return false;
    }
    return currentCafe.externalId !== product.cafeExternalId;
  }

  addProduct(product: Product, cafe: Cafe): boolean {
    if (this.isFromAnotherCafe(product)) {
      return false;
    }

    if (product.cafeExternalId !== cafe.externalId) {
      return false;
    }

    const list = [...this.items()];
    const index = list.findIndex((i) => i.product.externalId === product.externalId);

    if (index >= 0) {
      list[index] = { ...list[index], quantity: list[index].quantity + 1 };
    } else {
      list.push({ product: product, quantity: 1 });
    }

    this.items.set(list);
    this.cafe.set({ externalId: cafe.externalId, name: cafe.name });
    this.saveToStorage();
    return true;
  }

  replaceWithProduct(product: Product, cafe: Cafe): boolean {
    this.clear();
    return this.addProduct(product, cafe);
  }

  clear(): void {
    this.items.set([]);
    this.cafe.set(null);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const data = { cafe: this.cafe(), items: this.items() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('error saving cart:', error);
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return;
      }

      const data = JSON.parse(saved);
      if (data.items && data.items.length > 0 && data.cafe) {
        this.items.set(data.items);
        this.cafe.set(data.cafe);
      }
    } catch (error) {
      console.error('error loading cart:', error);
    }
  }
}
