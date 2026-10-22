import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MOCK_CAFES } from '../data/cafes.mock';
import { Cafe } from '../model/cafe.model';

export const CAFE_STORAGE_KEY = 'coffee-system-cafes';

@Injectable({
  providedIn: 'root',
})
export class CafeService {
  private readonly url = `${environment.apiBaseUrl}/cafes`;
  private cafes: Cafe[] = [];

  constructor(private http: HttpClient) {
    this.initCafes();
  }

  private initCafes(): void {
    const loaded = this.loadFromStorage();
    if (loaded && loaded.length > 0) {
      this.cafes = loaded;
    } else {
      this.cafes = MOCK_CAFES.map((c) => ({ ...c }));
      this.saveToStorage();
    }
  }

  getAll(): Observable<Cafe[]> {
    if (environment.useMockApi) {
      return of([...this.cafes]);
    }

    return this.http.get<Cafe[]>(this.url).pipe(
      catchError(() => of([...this.cafes]))
    );
  }

  getByExternalId(externalId: string): Observable<Cafe | undefined> {
    if (environment.useMockApi) {
      return of(this.cafes.find((c) => c.externalId === externalId));
    }

    return this.http.get<Cafe>(`${this.url}/${externalId}`).pipe(
      catchError(() => of(this.cafes.find((c) => c.externalId === externalId)))
    );
  }

  getAllRaw(): Cafe[] {
    return [...this.cafes];
  }

  addCafe(cafe: Cafe): void {
    // Prepend so newly added cafes appear at the top of the home page and admin table
    this.cafes = [cafe, ...this.cafes];
    this.saveToStorage();
  }

  updateCafeStatus(externalId: string, state: boolean): Cafe | undefined {
    const index = this.cafes.findIndex((c) => c.externalId === externalId);
    if (index === -1) {
      return undefined;
    }
    this.cafes[index] = {
      ...this.cafes[index],
      state,
    };
    this.saveToStorage();
    return this.cafes[index];
  }

  resetToDefault(): void {
    this.cafes = MOCK_CAFES.map((c) => ({ ...c }));
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(CAFE_STORAGE_KEY, JSON.stringify(this.cafes));
    } catch (error) {
      console.error('error saving cafes to storage:', error);
    }
  }

  private loadFromStorage(): Cafe[] | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const saved = localStorage.getItem(CAFE_STORAGE_KEY);
      if (!saved) {
        return null;
      }
      const data = JSON.parse(saved);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (error) {
      console.error('error loading cafes from storage:', error);
    }
    return null;
  }
}
