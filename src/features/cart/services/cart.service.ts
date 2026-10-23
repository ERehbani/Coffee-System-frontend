import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Product } from '../../catalog/model/product.model';
import { Cafe } from '../../home/model/cafe.model';
import { CartCafe, CartItem, CartResponse } from '../model/cart.model';

const STORAGE_KEY = 'coffee-system-cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/carts`;

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

    const previousItems = this.items();
    const previousCafe = this.cafe();
    const list = [...previousItems];
    const index = list.findIndex((i) => i.product.externalId === product.externalId);

    if (index >= 0) {
      list[index] = { ...list[index], quantity: list[index].quantity + 1 };
    } else {
      list.push({ product: product, quantity: 1 });
    }

    this.items.set(list);
    this.cafe.set({ externalId: cafe.externalId, name: cafe.name });
    this.saveToStorage();

    if (!environment.useMockApi) {
      this.http
        .post<CartResponse>(`${this.url}/${cafe.externalId}/items`, {
          productId: product.externalId,
          quantity: 1,
        })
        .subscribe({
          error: (error) => {
            console.error('error adding product to cart:', error);
            this.restore(previousItems, previousCafe);
          },
        });
    }

    return true;
  }

  replaceWithProduct(product: Product, cafe: Cafe): boolean {
    if (product.cafeExternalId !== cafe.externalId) {
      return false;
    }

    this.items.set([]);
    this.cafe.set(null);
    this.saveToStorage();

    if (environment.useMockApi) {
      return this.addProduct(product, cafe);
    }

    this.http.delete<void>(`${this.url}/clear`).subscribe({
      next: () => this.addProduct(product, cafe),
      error: (error) => console.error('error clearing cart:', error),
    });

    return true;
  }

  increaseQuantity(productId: string): void {
    const item = this.items().find((i) => i.product.externalId === productId);
    if (!item) {
      return;
    }

    this.updateQuantity(productId, item.quantity + 1);
  }

  decreaseQuantity(productId: string): void {
    const item = this.items().find((i) => i.product.externalId === productId);
    if (!item || item.quantity <= 1) {
      return;
    }

    this.updateQuantity(productId, item.quantity - 1);
  }

  removeProduct(productId: string): void {
    const previousItems = this.items();
    const previousCafe = this.cafe();
    const list = previousItems.filter((i) => i.product.externalId !== productId);

    this.items.set(list);
    if (list.length === 0) {
      this.cafe.set(null);
    }
    this.saveToStorage();

    if (environment.useMockApi) {
      return;
    }

    this.http.delete<CartResponse>(`${this.url}/items/${productId}`).subscribe({
      error: (error) => {
        console.error('error removing product from cart:', error);
        this.restore(previousItems, previousCafe);
      },
    });
  }

  clear(): void {
    this.items.set([]);
    this.cafe.set(null);
    this.saveToStorage();

    if (environment.useMockApi) {
      return;
    }

    this.http.delete<void>(`${this.url}/clear`).subscribe({
      error: (error) => console.error('error clearing cart:', error),
    });
  }

  private updateQuantity(productId: string, quantity: number): void {
    const previousItems = this.items();
    const list = previousItems.map((i) =>
      i.product.externalId === productId ? { ...i, quantity: quantity } : i
    );

    this.items.set(list);
    this.saveToStorage();

    if (environment.useMockApi) {
      return;
    }

    this.http.put<CartResponse>(`${this.url}/items/${productId}`, { quantity: quantity }).subscribe({
      error: (error) => {
        console.error('error updating cart quantity:', error);
        this.restore(previousItems, this.cafe());
      },
    });
  }

  private restore(items: CartItem[], cafe: CartCafe | null): void {
    this.items.set(items);
    this.cafe.set(cafe);
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
