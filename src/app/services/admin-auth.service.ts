import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const ADMIN_SESSION_KEY = 'tthAdminSession';
const ADMIN_PASSWORD = 'ChangeMe123!'; // Change in production
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  constructor(private router: Router) {}

  login(password: string): boolean {
    if (password === ADMIN_PASSWORD) {
      const session = { authenticated: true, lastActive: Date.now() };
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    this.router.navigate(['/admin/login']);
  }

  isAuthenticated(): boolean {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    try {
      const s = JSON.parse(raw) as { authenticated: boolean; lastActive: number };
      if (!s.authenticated) return false;
      if (Date.now() - s.lastActive > SESSION_TIMEOUT_MS) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  touch(): void {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return;
    try {
      const s = JSON.parse(raw) as { authenticated: boolean; lastActive: number };
      s.lastActive = Date.now();
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(s));
    } catch {}
  }
}
