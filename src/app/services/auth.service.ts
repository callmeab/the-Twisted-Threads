import { Injectable, inject, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router = inject(Router);

  // Reactive signal containing the current authenticated user
  public currentUser = signal<User | null | undefined>(undefined);

  constructor() {
    // Listen to Firebase Auth state changes
    user(this.auth).subscribe(u => {
      this.currentUser.set(u);
    });
  }

  // Simplified login handler
  async loginAdmin(email: string, pass: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, pass);
      this.router.navigate(['/admin/dashboard']);
    } catch (e) {
      console.error('Login failed', e);
      throw e;
    }
  }

  // Logout handler
  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/admin/login']);
  }
}
