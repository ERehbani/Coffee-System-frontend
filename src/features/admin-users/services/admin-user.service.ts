import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AdminUserDto } from '../types/admin-user.dto';
import { UserStatus } from '../types/admin-user.model';
import { ADMIN_USERS_FIXTURE } from '../utils/admin-user.fixture';

export const ADMIN_USERS_STORAGE_KEY = 'coffee-system-admin-users';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private users: AdminUserDto[] = [];

  constructor() {
    this.initUsers();
  }

  private initUsers(): void {
    const loaded = this.loadFromStorage();
    if (loaded && loaded.length > 0) {
      this.users = loaded.map((u) => {
        const fixtureUser = ADMIN_USERS_FIXTURE.find((f) => f.id === u.id);
        if (fixtureUser && fixtureUser.role === 'cafe_admin' && fixtureUser.cafeAdminDetails) {
          const updated: AdminUserDto = {
            ...u,
            firstName: fixtureUser.firstName,
            lastName: fixtureUser.lastName,
            cafeAdminDetails: fixtureUser.cafeAdminDetails,
          };
          return updated;
        }
        return u;
      });
      this.saveToStorage();
    } else {
      this.users = ADMIN_USERS_FIXTURE.map((u) => ({ ...u }));
      this.saveToStorage();
    }
  }

  getAll(): AdminUserDto[] {
    return [...this.users];
  }

  getUsers(): Observable<readonly AdminUserDto[]> {
    return of([...this.users]);
  }

  getUserById(id: string): Observable<AdminUserDto | null> {
    const found = this.users.find((u) => u.id === id);
    return of(found ? { ...found } : null);
  }

  addUser(user: AdminUserDto): void {
    const index = this.users.findIndex(
      (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase(),
    );
    if (index >= 0) {
      this.users[index] = { ...user };
    } else {
      // Prepend so newly created owners appear at the top of the users list
      this.users = [user, ...this.users];
    }
    this.saveToStorage();
  }

  updateUserStatus(id: string, status: UserStatus): AdminUserDto | undefined {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      return undefined;
    }

    const current = this.users[index];
    let updatedNotes = current.notes;
    if (status === 'active' && current.status === 'inactive') {
      updatedNotes =
        current.role === 'cafe_admin'
          ? 'Cafetería reactivada por Superadmin.'
          : 'Usuario reactivado por Superadmin.';
    } else if (status === 'inactive') {
      updatedNotes =
        current.role === 'cafe_admin'
          ? 'Cafetería dada de baja por Superadmin.'
          : 'Usuario dado de baja por Superadmin.';
    }

    const updatedDto: AdminUserDto = {
      ...current,
      status,
      notes: updatedNotes,
    };

    this.users[index] = updatedDto;
    this.saveToStorage();
    return updatedDto;
  }

  updateUserStatusByCafeId(cafeId: string, status: UserStatus): void {
    const index = this.users.findIndex((u) => u.cafeAdminDetails?.cafeId === cafeId);
    if (index >= 0) {
      this.updateUserStatus(this.users[index].id, status);
    }
  }

  resetToDefault(): void {
    this.users = ADMIN_USERS_FIXTURE.map((u) => ({ ...u }));
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch (error) {
      console.error('error saving admin users to storage:', error);
    }
  }

  private loadFromStorage(): AdminUserDto[] | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const saved = localStorage.getItem(ADMIN_USERS_STORAGE_KEY);
      if (!saved) {
        return null;
      }
      const data = JSON.parse(saved);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (error) {
      console.error('error loading admin users from storage:', error);
    }
    return null;
  }
}
