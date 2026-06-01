import { Component, HostListener, signal, computed, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CartService } from '../../../services/cart.service';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  protected readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  // States
  isScrolled = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);
  isSearchExpanded = signal<boolean>(false);
  wishlistCount = signal<number>(3); // Initial mock count of wishlist items

  // Search autocomplete
  searchControl = new FormControl('');
  products = computed(() => this.productService.getProducts()());
  filteredProducts = signal<Product[]>([]);

  ngOnInit(): void {
    // Populate initial autocomplete options
    this.filteredProducts.set(this.products());

    // Listen to autocomplete search filter changes
    this.searchControl.valueChanges.subscribe(value => {
      const filterValue = (value || '').toLowerCase();
      if (!filterValue) {
        this.filteredProducts.set(this.products());
      } else {
        const filtered = this.products().filter(p =>
          p.name.toLowerCase().includes(filterValue) ||
          p.category.toLowerCase().includes(filterValue)
        );
        this.filteredProducts.set(filtered);
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Set sticky solid state after 50px of scroll
    this.isScrolled.set(window.scrollY > 50);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(prev => !prev);
  }

  toggleSearch() {
    this.isSearchExpanded.update(prev => !prev);
    if (!this.isSearchExpanded()) {
      this.searchControl.setValue('');
    }
  }

  selectProduct(product: Product) {
    this.router.navigate(['/product-detail', product.id]);
    this.isSearchExpanded.set(false);
    this.searchControl.setValue('');
  }

  onSearchSubmit(event: Event) {
    event.preventDefault();
    const query = this.searchControl.value?.trim();
    if (query) {
      this.router.navigate(['/products'], { queryParams: { search: query } });
      this.isSearchExpanded.set(false);
      this.searchControl.setValue('');
    }
  }
}
