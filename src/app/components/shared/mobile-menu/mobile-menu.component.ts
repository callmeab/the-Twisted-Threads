import {
  Component,
  HostListener,
  inject,
  signal,
  ElementRef,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MobileNavService } from '../../../services/mobile-nav.service';
import { CartService } from '../../../services/cart.service';
import { WishlistService } from '../../../services/wishlist.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import {
  MOBILE_MEGA_MENU,
  MOBILE_PRIMARY_LINKS,
  MegaMenuCategory,
} from '../../../data/mobile-nav.data';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatBadgeModule,
    SearchBarComponent,
  ],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss',
})
export class MobileMenuComponent {
  private readonly mobileNav = inject(MobileNavService);
  private readonly router = inject(Router);
  protected readonly cartService = inject(CartService);
  protected readonly wishlistService = inject(WishlistService);

  private readonly drawerRef = viewChild<ElementRef<HTMLElement>>('drawer');

  protected readonly isOpen = this.mobileNav.isOpen;
  protected readonly primaryLinks = MOBILE_PRIMARY_LINKS;
  protected readonly megaMenu = MOBILE_MEGA_MENU;
  protected readonly expandedCategoryId = signal<string | null>(null);

  private touchStartX = 0;
  private touchStartY = 0;

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  protected close(): void {
    this.mobileNav.close();
    this.expandedCategoryId.set(null);
  }

  protected toggleCategory(category: MegaMenuCategory): void {
    this.expandedCategoryId.update(current =>
      current === category.id ? null : category.id
    );
  }

  protected isCategoryExpanded(categoryId: string): boolean {
    return this.expandedCategoryId() === categoryId;
  }

  protected onNavClick(): void {
    this.close();
  }

  protected openAccount(): void {
    this.close();
    void this.router.navigate(['/track-order']);
  }

  protected subcategoryQuery(sub: { category: string; subCategory?: string }): Record<string, string> {
    const params: Record<string, string> = { category: sub.category };
    if (sub.subCategory) {
      params['subCategory'] = sub.subCategory;
    }
    return params;
  }

  protected onOverlayClick(): void {
    this.close();
  }

  protected onDrawerTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  protected onDrawerTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    // Swipe right to close (drawer slides from right)
    if (deltaX > 72) {
      this.close();
    }
  }
}
