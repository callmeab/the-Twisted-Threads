import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ProductModel } from '../models/product.model';
import { ProductService } from './product.service';
import {
  SearchAutocompleteResult,
  SearchPageResult,
  SearchSuggestion,
} from '../models/search.model';

const RECENT_SEARCHES_KEY = 'twistedThreadsRecentSearches';
const MAX_RECENT = 8;

const POPULAR_SEARCHES = [
  'Gold jewelry',
  'Handwoven scarf',
  'Home decor',
  'Rose gold',
  'Custom necklace',
  'Silk accessories',
  'Pearl earrings',
  'Linen throw',
];

const PRICE_RANGES: Array<{ label: string; min?: number; max?: number }> = [
  { label: 'Under PKR 50', max: 50 },
  { label: 'PKR 50 – 150', min: 50, max: 150 },
  { label: 'PKR 150 – 300', min: 150, max: 300 },
  { label: 'Over PKR 300', min: 300 },
];

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly productService = inject(ProductService);

  public readonly popularSearches = POPULAR_SEARCHES;

  public searchProducts(query: string): ProductModel[] {
    return this.productService.searchProducts(query);
  }

  public searchPage(query: string): SearchPageResult {
    const trimmed = query.trim();
    const products = this.searchProducts(trimmed);
    let correctedQuery: string | null = null;

    if (trimmed && products.length === 0) {
      correctedQuery = this.suggestCorrection(trimmed);
    }

    return {
      query: trimmed,
      correctedQuery,
      products,
      totalCount: products.length,
    };
  }

  public autocomplete(query: string): SearchAutocompleteResult {
    const trimmed = query.trim();
    const suggestions: SearchSuggestion[] = [];

    if (!trimmed) {
      return {
        query: trimmed,
        suggestions: this.buildEmptyQuerySuggestions(),
        productCount: 0,
        isLoading: false,
      };
    }

    const products = this.searchProducts(trimmed).slice(0, 5);
    products.forEach(product => {
      suggestions.push({
        id: `product-${product.id}`,
        type: 'product',
        label: product.name,
        sublabel: `${product.category} · PKR ${product.price.toLocaleString('en-PK')}`,
        query: product.name,
        product,
        imageUrl: product.images[0] || product.mainImage,
      });
    });

    const categories = this.matchingCategories(trimmed);
    categories.slice(0, 3).forEach(category => {
      suggestions.push({
        id: `category-${category}`,
        type: 'category',
        label: category,
        sublabel: 'Browse category',
        query: category,
        category,
      });
    });

    this.matchingPriceRanges(trimmed).forEach((range, index) => {
      suggestions.push({
        id: `price-${index}`,
        type: 'price-range',
        label: range.label,
        sublabel: 'Filter by price',
        query: trimmed,
        minPrice: range.min,
        maxPrice: range.max,
      });
    });

    if (products.length > 0) {
      suggestions.push({
        id: 'view-all',
        type: 'view-all',
        label: `View all results for "${trimmed}"`,
        sublabel: `${products.length} item${products.length === 1 ? '' : 's'}`,
        query: trimmed,
      });
    }

    return {
      query: trimmed,
      suggestions,
      productCount: this.searchProducts(trimmed).length,
      isLoading: false,
    };
  }

  public autocompleteDebounced(query$: Observable<string>): Observable<SearchAutocompleteResult> {
    return query$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(q => this.autocomplete(q))
    );
  }

  public createDebouncedSearch(query$: Observable<string>): Observable<SearchPageResult> {
    return query$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(q => this.searchPage(q))
    );
  }

  public getRecentSearches(): string[] {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!raw) {
        return [];
      }
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }

  public addRecentSearch(query: string): void {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const recent = [trimmed, ...this.getRecentSearches().filter(item => item !== trimmed)].slice(
      0,
      MAX_RECENT
    );
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
  }

  public clearRecentSearches(): void {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }

  public suggestCorrection(query: string): string | null {
    const q = query.toLowerCase().trim();
    if (!q) {
      return null;
    }

    const candidates = new Set<string>([
      ...POPULAR_SEARCHES,
      ...this.productService.getAllProducts().map(p => p.name),
      ...this.productService.getAllProducts().map(p => p.category),
      ...this.productService.getAllProducts().flatMap(p => p.tags),
    ]);

    let bestMatch = '';
    let bestDistance = Infinity;

    candidates.forEach(candidate => {
      const distance = this.levenshtein(q, candidate.toLowerCase());
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = candidate;
      }
    });

    if (bestDistance > 0 && bestDistance <= 2 && bestMatch.toLowerCase() !== q) {
      return bestMatch;
    }

    return null;
  }

  private buildEmptyQuerySuggestions(): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];

    this.getRecentSearches().forEach((term, index) => {
      suggestions.push({
        id: `recent-${index}`,
        type: 'recent',
        label: term,
        sublabel: 'Recent search',
        query: term,
      });
    });

    POPULAR_SEARCHES.forEach((term, index) => {
      suggestions.push({
        id: `popular-${index}`,
        type: 'popular',
        label: term,
        sublabel: 'Popular',
        query: term,
      });
    });

    return suggestions;
  }

  private matchingCategories(query: string): string[] {
    const q = query.toLowerCase();
    const categories = new Set(
      this.productService.getAllProducts().map(p => p.category)
    );
    return [...categories].filter(cat => cat.toLowerCase().includes(q));
  }

  private matchingPriceRanges(query: string): typeof PRICE_RANGES {
    const q = query.toLowerCase();
    if (
      q.includes('under') ||
      q.includes('cheap') ||
      q.includes('budget') ||
      q.includes('price') ||
      q.includes('$') ||
      q.includes('pkr')
    ) {
      return PRICE_RANGES;
    }
    return [];
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = Array.from({ length: b.length + 1 }, () =>
      Array(a.length + 1).fill(0)
    );

    for (let i = 0; i <= b.length; i++) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[b.length][a.length];
  }
}
