import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { CartService } from '../../../services/cart.service';
import { WishlistService } from '../../../services/wishlist.service';
import { MobileNavService } from '../../../services/mobile-nav.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { HamburgerButtonComponent } from '../hamburger-button/hamburger-button.component';
import { MobileMenuComponent } from '../mobile-menu/mobile-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    SearchBarComponent,
    HamburgerButtonComponent,
    MobileMenuComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly cartService = inject(CartService);
  protected readonly wishlistService = inject(WishlistService);
  protected readonly mobileNav = inject(MobileNavService);

  protected readonly isScrolled = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 50);
  }

  protected toggleMobileMenu(): void {
    this.mobileNav.toggle();
  }
}
