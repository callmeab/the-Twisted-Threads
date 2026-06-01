import { Injectable, computed, inject, signal } from '@angular/core';
import { ProductModel } from '../models/product.model';
import { WishlistEntry, WishlistStorage } from '../models/wishlist.model';
import { ProductService } from './product.service';

const STORAGE_KEY = 'twistedThreadsWishlist';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly productService = inject(ProductService);
  private readonly entriesSignal = signal<WishlistEntry[]>(this.loadEntries());

  public readonly count = computed(() => this.entriesSignal().length);

  public readonly productIds = computed(() => this.entriesSignal().map(entry => entry.productId));

  public readonly items = computed(() =>
    this.entriesSignal()
      .map(entry => this.productService.getProductById(entry.productId))
      .filter((product): product is ProductModel => !!product)
  );

  public add(productId: string): boolean {
    if (this.isInWishlist(productId)) {
      return false;
    }

    const entries = [
      { productId, addedAt: new Date().toISOString() },
      ...this.entriesSignal(),
    ];
    this.persist(entries);
    return true;
  }

  public remove(productId: string): boolean {
    if (!this.isInWishlist(productId)) {
      return false;
    }

    const entries = this.entriesSignal().filter(entry => entry.productId !== productId);
    this.persist(entries);
    return true;
  }

  public toggle(productId: string): boolean {
    if (this.isInWishlist(productId)) {
      this.remove(productId);
      return false;
    }
    this.add(productId);
    return true;
  }

  public isInWishlist(productId: string): boolean {
    return this.entriesSignal().some(entry => entry.productId === productId);
  }

  public getAll(): ProductModel[] {
    return this.items();
  }

  public getAllIds(): string[] {
    return this.productIds();
  }

  public clear(): void {
    this.persist([]);
  }

  private loadEntries(): WishlistEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as WishlistStorage | string[];

      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (typeof item === 'string') {
            return { productId: item, addedAt: new Date().toISOString() };
          }
          return item as WishlistEntry;
        });
      }

      return parsed.entries ?? [];
    } catch {
      return [];
    }
  }

  private persist(entries: WishlistEntry[]): void {
    this.entriesSignal.set(entries);
    const payload: WishlistStorage = { entries };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }
}
