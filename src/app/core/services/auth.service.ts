import { Injectable, signal, computed } from '@angular/core';
import { UserDto } from '../models/booking.model';


const STORAGE_KEY = 'currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  private readonly _currentUser = signal<UserDto | null>(this.loadFromStorage());

  // para acesso externo
  readonly currentUser = this._currentUser.asReadonly();

  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  setUser(user: UserDto): void {
    this._currentUser.set(user);
    this.saveToStorage(user);
  }

  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  // para refreshes, etc
  private loadFromStorage(): UserDto | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(user: UserDto): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
}
