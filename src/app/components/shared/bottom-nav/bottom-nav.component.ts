import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { filter } from 'rxjs/operators';
import { BOTTOM_NAV_ITEMS, BottomNavItem } from '../../../data/mobile-nav.data';
import { MobileNavService } from '../../../services/mobile-nav.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatBadgeModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  private readonly router = inject(Router);
  private readonly mobileNav = inject(MobileNavService);
  protected readonly cartService = inject(CartService);

  protected readonly items = BOTTOM_NAV_ITEMS;
  protected readonly hidden = computed(() => this.mobileNav.isOpen());
  protected readonly currentUrl = signal(this.router.url);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.currentUrl.set(e.urlAfterRedirects));
  }

  protected onItemClick(item: BottomNavItem, event: Event): void {
    if (item.action === 'categories') {
      event.preventDefault();
      this.mobileNav.open();
      return;
    }

    if (item.action === 'search') {
      event.preventDefault();
      void this.router.navigate(['/search']);
    }
  }

  protected isCartItem(item: BottomNavItem): boolean {
    return item.route === '/cart';
  }

  protected cartCount(): number {
    return this.cartService.totalItems();
  }
}
