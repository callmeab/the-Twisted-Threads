import { Injectable } from '@angular/core';

const AUDIT_KEY = 'tthAdminAuditLog';

export interface AuditEntry {
  timestamp: string;
  action: string;
  actor?: string;
  details?: any;
}

@Injectable({ providedIn: 'root' })
export class AdminAuditService {
  log(action: string, details?: any) {
    const entry: AuditEntry = { timestamp: new Date().toISOString(), action, details };
    try {
      const raw = localStorage.getItem(AUDIT_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift(entry);
      localStorage.setItem(AUDIT_KEY, JSON.stringify(arr.slice(0, 500)));
    } catch {
      // ignore
    }
  }

  getAll(): AuditEntry[] {
    try {
      const raw = localStorage.getItem(AUDIT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
