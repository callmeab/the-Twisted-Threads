import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { ToastrService } from 'ngx-toastr';
import { ProductModel } from '../../models/product.model';
import { ProductQuickViewService } from '../../services/product-quick-view.service';
import { WishlistHeartButtonComponent } from '../shared/wishlist-heart-button/wishlist-heart-button.component';
import { listStaggerAnimation } from '../../animations/animations';
import { ProductCardSkeletonComponent } from '../shared/skeletons/product-card-skeleton.component';
import { BottomSheetComponent } from '../shared/bottom-sheet/bottom-sheet.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    MatExpansionModule,
    CustomCurrencyPipe,
    WishlistHeartButtonComponent,
    ProductCardSkeletonComponent,
    BottomSheetComponent,
  ],
  animations: [listStaggerAnimation],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly toastr = inject(ToastrService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quickViewService = inject(ProductQuickViewService);

  // Filter Selection Signals
  selectedCategories = signal<Set<string>>(new Set());
  selectedMaterials = signal<Set<string>>(new Set());
  selectedColors = signal<Set<string>>(new Set());
  selectedSizes = signal<Set<string>>(new Set());
  maxPrice = signal<number>(1000);
  inStockOnly = signal<boolean>(false);
  selectedSort = signal<string>('featured');
  isGridView = signal<boolean>(true);
  currentPage = signal<number>(1);
  pageSize = 8;
  isLoading = signal<boolean>(false);
  filterSheetOpen = signal<boolean>(false);

  // Unique filters lists dynamically compiled from database
  availableCategories = ['Apparel', 'Home Decor', 'Accessories', 'Jewelry'];
  availableMaterials = ['Wool', 'Linen', 'Cotton', 'Cashmere', 'Rose Gold', 'Gold', 'Amethyst', 'Pearl', 'Silver', 'Silk'];
  availableColors = ['Charcoal', 'Cream', 'Oatmeal', 'Sage', 'Terracotta', 'Indigo Blue', 'Purple', 'Gold', 'Pearl White', 'Rose Gold', 'White Gold', 'Beige', 'Slate Blue', 'Pink'];
  availableSizes = ['S', 'M', 'L', 'XL', 'Standard', 'One Size', '6', '7', '8', '9', '18" Chain', '30mm Diameter'];

  ngOnInit(): void {
    // Read category and search query parameters from router URL
    this.route.queryParams.subscribe(params => {
      this.isLoading.set(true);
      
      const categoryParam = params['category'];
      const searchParam = params['search'];

      if (searchParam) {
        void this.router.navigate(['/search'], { queryParams: { q: searchParam } });
        return;
      }

      this.clearAllFiltersSilently();

      if (categoryParam) {
        this.selectedCategories.update(set => new Set(set).add(categoryParam));
      }

      const delay = categoryParam ? 500 : 0;
      setTimeout(() => {
        this.isLoading.set(false);
      }, delay); // Short shimmer loader
    });
  }

  // Master Computed Signal filtering and sorting all products
  filteredProducts = computed(() => {
    // Pull full products array
    const allProducts = this.productService.getAllProducts();

    // Map selections to query parameters
    let result = [...allProducts];

    // 1. Categories
    if (this.selectedCategories().size > 0) {
      result = result.filter(p => this.selectedCategories().has(p.category));
    }

    // 2. Materials
    if (this.selectedMaterials().size > 0) {
      result = result.filter(p =>
        p.materials.some(m =>
          Array.from(this.selectedMaterials()).some(sel => m.toLowerCase().includes(sel.toLowerCase()))
        )
      );
    }

    // 3. Colors
    if (this.selectedColors().size > 0) {
      result = result.filter(p =>
        p.colors.some(c =>
          Array.from(this.selectedColors()).some(sel => c.toLowerCase().includes(sel.toLowerCase()))
        )
      );
    }

    // 4. Sizes
    if (this.selectedSizes().size > 0) {
      result = result.filter(p =>
        p.sizes.some(s =>
          Array.from(this.selectedSizes()).some(sel => s.toLowerCase() === sel.toLowerCase())
        )
      );
    }

    // 5. Max Price
    result = result.filter(p => p.price <= this.maxPrice());

    // 6. In Stock Only
    if (this.inStockOnly()) {
      result = result.filter(p => p.inStock);
    }

    // 7. Sort
    const sortOrder = this.selectedSort();
    if (sortOrder === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOrder === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortOrder === 'newest') {
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return result;
  });

  // Paginated visible products
  visibleProducts = computed(() => {
    const list = this.filteredProducts();
    const count = this.currentPage() * this.pageSize;
    return list.slice(0, count);
  });

  hasMoreProducts = computed(() => {
    return this.visibleProducts().length < this.filteredProducts().length;
  });

  // Filter Mutator helpers
  toggleCategory(category: string) {
    this.triggerShimmer();
    this.selectedCategories.update(set => {
      const next = new Set(set);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  toggleMaterial(material: string) {
    this.triggerShimmer();
    this.selectedMaterials.update(set => {
      const next = new Set(set);
      if (next.has(material)) next.delete(material);
      else next.add(material);
      return next;
    });
  }

  toggleColor(color: string) {
    this.triggerShimmer();
    this.selectedColors.update(set => {
      const next = new Set(set);
      if (next.has(color)) next.delete(color);
      else next.add(color);
      return next;
    });
  }

  toggleSize(size: string) {
    this.triggerShimmer();
    this.selectedSizes.update(set => {
      const next = new Set(set);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  }

  onPriceChange(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.maxPrice.set(val);
  }

  toggleStockOnly(checked: boolean) {
    this.triggerShimmer();
    this.inStockOnly.set(checked);
  }

  clearAllFilters() {
    this.triggerShimmer();
    this.clearAllFiltersSilently();
    this.toastr.info('Filters successfully cleared.');
  }

  private clearAllFiltersSilently() {
    this.selectedCategories.set(new Set());
    this.selectedMaterials.set(new Set());
    this.selectedColors.set(new Set());
    this.selectedSizes.set(new Set());
    this.maxPrice.set(1000);
    this.inStockOnly.set(false);
    this.currentPage.set(1);
  }

  loadMore() {
    this.currentPage.update(p => p + 1);
  }

  private triggerShimmer() {
    this.isLoading.set(true);
    this.currentPage.set(1);
    setTimeout(() => {
      this.isLoading.set(false);
    }, 450);
  }

  addToCart(product: ProductModel, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart(product);
  }

  openQuickView(product: ProductModel, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.quickViewService.open(product);
  }

  openFilterSheet(): void {
    this.filterSheetOpen.set(true);
  }

  closeFilterSheet(): void {
    this.filterSheetOpen.set(false);
  }
}
