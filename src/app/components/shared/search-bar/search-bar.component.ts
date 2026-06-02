import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject, Subscription } from 'rxjs';
import { SearchService } from '../../../services/search.service';
import { SearchSuggestion } from '../../../models/search.model';
import { HighlightSearchPipe } from '../../../pipes/highlight-search.pipe';
import { CustomCurrencyPipe } from '../../../pipes/custom-currency.pipe';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, HighlightSearchPipe, CustomCurrencyPipe],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;

  /** Always expanded (mobile bar) */
  public readonly alwaysVisible = input(false);

  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);

  protected readonly searchControl = new FormControl('');
  protected readonly isExpanded = signal(false);
  protected readonly isOpen = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly suggestions = signal<SearchSuggestion[]>([]);
  protected readonly activeIndex = signal(-1);
  protected readonly currentQuery = signal('');

  private readonly queryChanges$ = new Subject<string>();
  private subscription?: Subscription;

  public ngOnInit(): void {
    if (this.alwaysVisible()) {
      this.isExpanded.set(true);
    }

    this.subscription = this.searchService.autocompleteDebounced(this.queryChanges$).subscribe(result => {
      this.isLoading.set(false);
      this.suggestions.set(result.suggestions);
      this.currentQuery.set(result.query);
      this.activeIndex.set(result.suggestions.length > 0 ? 0 : -1);
    });

    this.searchControl.valueChanges.subscribe(value => {
      const query = (value ?? '').toString();
      this.isOpen.set(true);
      if (query.trim()) {
        this.isLoading.set(true);
      } else {
        this.isLoading.set(false);
      }
      this.queryChanges$.next(query);
    });
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.queryChanges$.complete();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-bar-root')) {
      this.isOpen.set(false);
      if (!this.alwaysVisible()) {
        this.isExpanded.set(false);
      }
    }
  }

  protected toggleExpand(): void {
    if (this.alwaysVisible()) {
      this.focusInput();
      return;
    }
    this.isExpanded.update(v => !v);
    if (this.isExpanded()) {
      this.focusInput();
      this.isOpen.set(true);
      this.queryChanges$.next(this.searchControl.value ?? '');
    } else {
      this.searchControl.setValue('');
      this.isOpen.set(false);
    }
  }

  protected onFocus(): void {
    this.isOpen.set(true);
    this.queryChanges$.next(this.searchControl.value ?? '');
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.navigateToSearch(this.getActiveQuery());
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.suggestions();
    if (!items.length) {
      if (event.key === 'Enter') {
        this.onSubmit(event);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update(i => (i + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update(i => (i <= 0 ? items.length - 1 : i - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const index = this.activeIndex();
      if (index >= 0 && index < items.length) {
        this.selectSuggestion(items[index]);
      } else {
        this.onSubmit(event);
      }
    } else if (event.key === 'Escape') {
      this.isOpen.set(false);
      if (!this.alwaysVisible()) {
        this.isExpanded.set(false);
      }
    }
  }

  protected selectSuggestion(suggestion: SearchSuggestion): void {
    if (suggestion.type === 'product' && suggestion.product) {
      void this.router.navigate(['/products', suggestion.product.id]);
      this.closeSearch();
      return;
    }

    if (suggestion.type === 'category' && suggestion.category) {
      void this.router.navigate(['/search'], {
        queryParams: { q: suggestion.category, category: suggestion.category },
      });
      this.closeSearch();
      return;
    }

    if (suggestion.type === 'view-all') {
      this.navigateToSearch(suggestion.query);
      return;
    }

    if (suggestion.type === 'price-range') {
      const params: Record<string, string> = { q: this.searchControl.value?.toString().trim() || ' ' };
      if (suggestion.minPrice !== undefined) {
        params['minPrice'] = String(suggestion.minPrice);
      }
      if (suggestion.maxPrice !== undefined) {
        params['maxPrice'] = String(suggestion.maxPrice);
      }
      void this.router.navigate(['/search'], { queryParams: params });
      this.closeSearch();
      return;
    }

    this.navigateToSearch(suggestion.query);
  }

  protected isActive(index: number): boolean {
    return this.activeIndex() === index;
  }

  protected sectionLabel(type: string): string {
    const labels: Record<string, string> = {
      recent: 'Recent searches',
      popular: 'Popular searches',
      product: 'Products',
      category: 'Categories',
      'price-range': 'Price ranges',
      'view-all': 'Search',
    };
    return labels[type] ?? '';
  }

  private getActiveQuery(): string {
    const index = this.activeIndex();
    const items = this.suggestions();
    if (index >= 0 && items[index]) {
      return items[index].query;
    }
    return this.searchControl.value?.toString().trim() ?? '';
  }

  private navigateToSearch(query: string): void {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }
    this.searchService.addRecentSearch(trimmed);
    void this.router.navigate(['/search'], { queryParams: { q: trimmed } });
    this.closeSearch();
  }

  private closeSearch(): void {
    this.isOpen.set(false);
    this.searchControl.setValue('');
    if (!this.alwaysVisible()) {
      this.isExpanded.set(false);
    }
  }

  private focusInput(): void {
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 50);
  }
}
