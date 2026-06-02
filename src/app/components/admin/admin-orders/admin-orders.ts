import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface Order {
  id: string;
  customer: string;
  email: string;
  date: Date;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule, MatIconModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders {
  // Placeholder orders — will be replaced with Firestore data once connected
  orders: Order[] = [
    { id: '#ORD-0021', customer: 'Sarah Ahmed',    email: 'sarah@example.com',  date: new Date('2026-05-30'), items: 3, total: 467.00, status: 'delivered'  },
    { id: '#ORD-0020', customer: 'James Carter',   email: 'james@example.com',  date: new Date('2026-05-29'), items: 1, total: 189.00, status: 'shipped'    },
    { id: '#ORD-0019', customer: 'Noor Khalid',    email: 'noor@example.com',   date: new Date('2026-05-28'), items: 2, total: 740.00, status: 'processing' },
    { id: '#ORD-0018', customer: 'Emily Roberts',  email: 'emily@example.com',  date: new Date('2026-05-27'), items: 4, total: 315.00, status: 'pending'    },
    { id: '#ORD-0017', customer: 'Ali Hassan',     email: 'ali@example.com',    date: new Date('2026-05-26'), items: 1, total: 95.00,  status: 'cancelled'  },
    { id: '#ORD-0016', customer: 'Priya Sharma',   email: 'priya@example.com',  date: new Date('2026-05-25'), items: 2, total: 610.00, status: 'delivered'  },
    { id: '#ORD-0015', customer: 'Michael Lee',    email: 'mike@example.com',   date: new Date('2026-05-24'), items: 1, total: 280.00, status: 'shipped'    },
  ];

  get summary() {
    return {
      total:     this.orders.length,
      pending:   this.orders.filter(o => o.status === 'pending').length,
      shipped:   this.orders.filter(o => o.status === 'shipped').length,
      delivered: this.orders.filter(o => o.status === 'delivered').length,
    };
  }
}
