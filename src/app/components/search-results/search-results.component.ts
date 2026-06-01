import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SearchService } from '../../services/search.service';
import { CartService } from '../../services/cart.service';
import { ProductModel } from '../../models/product.model';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { ProductQuickViewService } from '../../services/product-quick-view.service';
import { WishlistHeartButtonComponent } from '../shared/wishlist-heart-button/wishlist-heart-button.component';
import { listStaggerAnimation } from '../../animations/animations';
import { ProductCardSkeletonComponent } from '../shared/skeletons/product-card-skeleton.component';
import { ToastrService } from 'ngx-toastr';
import { OptimizedImageComponent } from '../shared/optimized-image/optimized-image.component';

@Component({
  selector: 'app-search-results',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    ScrollingModule,
    CustomCurrencyPipe,
    WishlistHeartButtonComponent,
    ProductCardSkeletonComponent,
    OptimizedImageComponent,
  ],
  animations: [listStaggerAnimation],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',
})
export class SearchResultsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);
  private readonly cartService = inject(CartService);
  private readonly quickViewService = inject(ProductQuickViewService);
  private readonly toastr = inject(ToastrService);

  protected readonly searchQuery = signal('');
  protected readonly correctedQuery = signal<string | null>(null);
  protected readonly baseResults = signal<ProductModel[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isMobileFilterOpen = signal(false);

  protected readonly selectedCategories = signal<Set<string>>(new Set());
  protected readonly selectedMaterials = signal<Set<string>>(new Set());
  protected readonly selectedColors = signal<Set<string>>(new Set());
  protected readonly selectedSizes = signal<Set<string>>(new Set());
  protected readonly minPrice = signal<number>(0);
  protected readonly maxPrice = signal<number>(1000);
  protected readonly inStockOnly = signal(false);
  protected readonly selectedSort = signal('featured');
  protected readonly isGridView = signal(true);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 8;

  protected readonly availableCategories = ['Apparel', 'Home Decor', 'Accessories', 'Jewelry'];
  protected readonly availableMaterials = [
    'Wool',
    'Linen',
    'Cotton',
    'Cashmere',
    'Rose Gold',
    'Gold',
    'Amethyst',
    'Pearl',
    'Silver',
    'Silk',
  ];
  protected readonly availableColors = [
    'Charcoal',
    'Cream',
    'Oatmeal',
    'Sage',
    'Terracotta',
    'Indigo Blue',
    'Purple',
    'Gold',
    'Pearl White',
    'Rose Gold',
    'White Gold',
    'Beige',
    'Slate Blue',
    'Pink',
  ];
  protected readonly availableSizes = [
    'S',
    'M',
    'L',
    'XL',
    'Standard',
    'One Size',
    '6',
    '7',
    '8',
    '9',
    '18" Chain',
    '30mm Diameter',
  ];

  protected readonly popularSearches = this.searchService.popularSearches;
  protected readonly filteredProducts = computed(() => {
    let result = [...this.baseResults()];

    if (this.selectedCategories().size > 0) {
      result = result.filter(p => this.selectedCategories().has(p.category));
    }

    if (this.selectedMaterials().size > 0) {
      result = result.filter(p =>
        p.materials.some(m =>
          Array.from(this.selectedMaterials()).some(sel => m.toLowerCase().includes(sel.toLowerCase()))
        )
      );
    }

    if (this.selectedColors().size > 0) {
      result = result.filter(p =>
        p.colors.some(c =>
          Array.from(this.selectedColors()).some(sel => c.toLowerCase().includes(sel.toLowerCase()))
        )
      );
    }

    if (this.selectedSizes().size > 0) {
      result = result.filter(p =>
        p.sizes.some(s =>
          Array.from(this.selectedSizes()).some(sel => s.toLowerCase() === sel.toLowerCase())
        )
      );
    }

    result = result.filter(p => p.price >= this.minPrice() && p.price <= this.maxPrice());

    if (this.inStockOnly()) {
      result = result.filter(p => p.inStock);
    }

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

  protected readonly visibleProducts = computed(() => {
    const list = this.filteredProducts();
    return list.slice(0, this.currentPage() * this.pageSize);
  });

  protected readonly hasMoreProducts = computed(
    () => this.visibleProducts().length < this.filteredProducts().length
  );

  protected readonly hasActiveFilters = computed(
    () =>
      this.selectedCategories().size > 0 ||
      this.selectedMaterials().size > 0 ||
      this.selectedColors().size > 0 ||
      this.selectedSizes().size > 0 ||
      this.minPrice() > 0 ||
      this.maxPrice() < 1000 ||
      this.inStockOnly()
  );

  public ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this)).subscribe(params => {
      const q = (params.get('q') ?? '').trim();
      const category = params.get('category');
      const min = params.get('minPrice');
      const max = params.get('maxPrice');

      this.isLoading.set(true);
      this.searchQuery.set(q);
      this.currentPage.set(1);

      if (q) {
        this.searchService.addRecentSearch(q);
      }

      const pageResult = this.searchService.searchPage(q);
      this.correctedQuery.set(pageResult.correctedQuery);
      this.baseResults.set(pageResult.products);

      this.clearFiltersSilently();
      if (category) {
        this.selectedCategories.update(set => new Set(set).add(category));
      }
      if (min) {
        this.minPrice.set(Number(min));
      }
      if (max) {
        this.maxPrice.set(Number(max));
      }

      setTimeout(() => this.isLoading.set(false), q ? 400 : 0);
    });
  }

  protected applyDidYouMean(): void {
    const correction = this.correctedQuery();
    if (!correction) {
      return;
    }
    void this.router.navigate(['/search'], { queryParams: { q: correction } });
  }

  protected searchPopular(term: string): void {
    void this.router.navigate(['/search'], { queryParams: { q: term } });
  }

  protected trackByProductId(index: number, product: ProductModel): string {
    return product.id;
  }

  protected toggleCategory(category: string): void {
    this.triggerShimmer();
    this.selectedCategories.update(set => {
      const next = new Set(set);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  protected toggleMaterial(material: string): void {
    this.triggerShimmer();
    this.selectedMaterials.update(set => {
      const next = new Set(set);
      if (next.has(material)) {
        next.delete(material);
      } else {
        next.add(material);
      }
      return next;
    });
  }

  protected toggleColor(color: string): void {
    this.triggerShimmer();
    this.selectedColors.update(set => {
      const next = new Set(set);
      if (next.has(color)) {
        next.delete(color);
      } else {
        next.add(color);
      }
      return next;
    });
  }

  protected toggleSize(size: string): void {
    this.triggerShimmer();
    this.selectedSizes.update(set => {
      const next = new Set(set);
      if (next.has(size)) {
        next.delete(size);
      } else {
        next.add(size);
      }
      return next;
    });
  }

  protected onMinPriceChange(event: Event): void {
    this.minPrice.set(parseInt((event.target as HTMLInputElement).value, 10));
    this.triggerShimmer();
  }

  protected onMaxPriceChange(event: Event): void {
    this.maxPrice.set(parseInt((event.target as HTMLInputElement).value, 10));
    this.triggerShimmer();
  }

  protected toggleStockOnly(checked: boolean): void {
    this.triggerShimmer();
    this.inStockOnly.set(checked);
  }

  protected clearAllFilters(): void {
    this.triggerShimmer();
    this.clearFiltersSilently();
    this.toastr.info('Filters cleared.');
  }

  protected toggleMobileFilter(): void {
    this.isMobileFilterOpen.update(v => !v);
  }

  protected loadMore(): void {
    this.currentPage.update(p => p + 1);
  }

  protected addToCart(product: ProductModel, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart(product);
  }

  protected openQuickView(product: ProductModel, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.quickViewService.open(product);
  }

  private clearFiltersSilently(): void {
    this.selectedCategories.set(new Set());
    this.selectedMaterials.set(new Set());
    this.selectedColors.set(new Set());
    this.selectedSizes.set(new Set());
    this.minPrice.set(0);
    this.maxPrice.set(1000);
    this.inStockOnly.set(false);
    this.currentPage.set(1);
  }

  private triggerShimmer(): void {
    this.isLoading.set(true);
    this.currentPage.set(1);
    setTimeout(() => this.isLoading.set(false), 350);
  }
}
