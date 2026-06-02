import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdminAuthService } from '../../../services/admin-auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  private authService = inject(AdminAuthService);

  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Products',  icon: 'inventory_2', route: '/admin/products' },
    { label: 'Orders',    icon: 'receipt_long', route: '/admin/orders' },
  ];

  logout() {
    this.authService.logout();
  }
}
