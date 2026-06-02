import { Injectable, inject, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // Reactive signal for auth state: undefined = loading, null = unauthenticated, User = authenticated
  public currentUser = signal<User | null | undefined>(undefined);

  constructor() {
    // Subscribe to Firebase Auth state changes globally
    onAuthStateChanged(this.auth, (u) => {
      this.currentUser.set(u);
    });
  }

  // Used by the legacy adminAuthGuard (synchronous check)
  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }

  // No-op touch kept for backward compat with guard
  touch(): void {}

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/admin/login']);
  }
}
