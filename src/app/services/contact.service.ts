import { Injectable } from '@angular/core';
import { ContactInquiry } from '../models/contact.model';

const INQUIRIES_STORAGE_KEY = 'twistedThreadsContactInquiries';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  public async submitInquiry(
    inquiry: Omit<ContactInquiry, 'id' | 'submittedAt'>
  ): Promise<ContactInquiry> {
    await this.simulateNetworkDelay();

    const record: ContactInquiry = {
      ...inquiry,
      id: this.generateId(),
      submittedAt: new Date(),
    };

    this.persistInquiry(record);

    console.info('[ContactService] Inquiry received (simulated email dispatch)', {
      to: 'twistedthread45@gmail.com',
      from: record.email,
      subject: record.subject,
      id: record.id,
    });

    return record;
  }

  public getInquiries(): ContactInquiry[] {
    try {
      const raw = localStorage.getItem(INQUIRIES_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as ContactInquiry[];
      return parsed.map(item => ({
        ...item,
        submittedAt: new Date(item.submittedAt),
      }));
    } catch {
      return [];
    }
  }

  private persistInquiry(inquiry: ContactInquiry): void {
    const existing = this.getInquiries();
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify([inquiry, ...existing]));
  }

  private simulateNetworkDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 900));
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `inq-${Date.now()}`;
  }
}
