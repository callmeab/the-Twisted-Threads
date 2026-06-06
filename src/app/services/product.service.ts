import { Injectable, signal, computed, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  DocumentReference,
} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductModel } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private firestore = inject(Firestore);
  private productsCol = collection(this.firestore, 'products');

  /** Loading / error state */
  public isLoading = signal(true);
  public error     = signal<string | null>(null);

  // ── Public-facing stream: only ACTIVE products ───────────────────────────
  // The Firestore rule enforces this server-side; we also filter client-side
  // so the signal is always consistent even during guard transitions.
  private _activeQuery = query(
    this.productsCol,
    where('isActive', '==', true),
    orderBy('createdAt', 'desc'),
  );

  private _activeProducts$ = (collectionData(this._activeQuery, { idField: 'id' }) as Observable<ProductModel[]>).pipe(
    map(docs => {
      this.isLoading.set(false);
      return docs.map(d => this._toModel(d));
    }),
    catchError(err => {
      this.isLoading.set(false);
      this.error.set('Failed to load products. Please try again.');
      console.error('[ProductService] Firestore read error:', err);
      return of([] as ProductModel[]);
    }),
  );

  private _productSignal = toSignal(this._activeProducts$, { initialValue: [] as ProductModel[] });

  // ── Admin stream: ALL products (active + inactive) ───────────────────────
  private _allQuery = query(this.productsCol, orderBy('createdAt', 'desc'));

  private _allProducts$ = (collectionData(this._allQuery, { idField: 'id' }) as Observable<ProductModel[]>).pipe(
    map(docs => docs.map(d => this._toModel(d))),
    catchError(err => {
      console.error('[ProductService] Admin Firestore read error:', err);
      return of([] as ProductModel[]);
    }),
  );

  public allProductsSignal = toSignal(this._allProducts$, { initialValue: [] as ProductModel[] });

  // ── Public API (backward-compatible) ─────────────────────────────────────

  /** Signal of active products — used by public-facing components */
  public getProducts() {
    return this._productSignal;
  }

  /** Synchronous snapshot of active products */
  public getAllProducts(): ProductModel[] {
    return this._productSignal();
  }

  public getProductById(id: string): ProductModel | undefined {
    return this._productSignal().find(p => p.id === id);
  }

  public getProductsByCategory(category: string): ProductModel[] {
    return this._productSignal().filter(
      p => p.category.toLowerCase() === category.toLowerCase(),
    );
  }

  public getFeaturedProducts(): ProductModel[] {
    return this._productSignal().filter(p => p.isFeatured);
  }

  public searchProducts(query: string): ProductModel[] {
    const q = (query || '').toLowerCase().trim();
    if (!q) return this._productSignal();
    return this._productSignal().filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subCategory.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.materials.some(m => m.toLowerCase().includes(q)),
    );
  }

  public filterProducts(filters: any): ProductModel[] {
    let result = [...this._productSignal()];

    if (filters.category) {
      result = result.filter(
        p => p.category.toLowerCase() === filters.category.toLowerCase(),
      );
    }
    if (filters.subCategory) {
      result = result.filter(
        p => p.subCategory.toLowerCase() === filters.subCategory.toLowerCase(),
      );
    }
    if (filters.minPrice != null) result = result.filter(p => p.price >= filters.minPrice);
    if (filters.maxPrice != null) result = result.filter(p => p.price <= filters.maxPrice);
    if (filters.rating   != null) result = result.filter(p => p.rating >= filters.rating);
    if (filters.inStock  != null) result = result.filter(p => p.inStock === filters.inStock);
    if (filters.material)
      result = result.filter(p =>
        p.materials.some(m => m.toLowerCase().includes(filters.material.toLowerCase())),
      );
    if (filters.size)
      result = result.filter(p =>
        p.sizes.some(s => s.toLowerCase() === filters.size.toLowerCase()),
      );
    if (filters.color)
      result = result.filter(p =>
        p.colors.some(c => c.toLowerCase().includes(filters.color.toLowerCase())),
      );

    if (filters.sort === 'price-low')  result.sort((a, b) => a.price - b.price);
    if (filters.sort === 'price-high') result.sort((a, b) => b.price - a.price);
    if (filters.sort === 'rating')     result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (filters.sort === 'newest')
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }

  // ── Admin CRUD ────────────────────────────────────────────────────────────

  /** Fetch a single product by ID directly from Firestore (admin use) */
  async getProductByIdAsync(id: string): Promise<ProductModel | null> {
    try {
      const snap = await getDoc(doc(this.firestore, 'products', id));
      return snap.exists() ? this._toModel({ id: snap.id, ...snap.data() } as any) : null;
    } catch (err) {
      console.error('[ProductService] getProductByIdAsync error:', err);
      return null;
    }
  }

  /** Create a new product document in Firestore */
  async createProduct(data: Omit<ProductModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const newRef = doc(this.productsCol) as DocumentReference;
    const id = newRef.id;
    await setDoc(newRef, {
      ...data,
      id,
      slug: data.slug || this._slugify(data.name),
      rating: 0,
      reviewCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  }

  /** Update an existing product */
  async updateProduct(id: string, data: Partial<ProductModel>): Promise<void> {
    const ref = doc(this.firestore, 'products', id);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  }

  /** Toggle isActive flag */
  async toggleActive(id: string, isActive: boolean): Promise<void> {
    await this.updateProduct(id, { isActive });
  }

  /** Delete a product document */
  async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'products', id));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _toModel(raw: any): ProductModel {
    return {
      ...raw,
      isActive: raw.isActive ?? true,
      slug: raw.slug ?? this._slugify(raw.name ?? ''),
      images: raw.images ?? [],
      imageStoragePaths: raw.imageStoragePaths ?? [],
      tags: raw.tags ?? [],
      materials: raw.materials ?? [],
      sizes: raw.sizes ?? [],
      colors: raw.colors ?? [],
      rating: raw.rating ?? 0,
      reviewCount: raw.reviewCount ?? 0,
      stockQuantity: raw.stockQuantity ?? 0,
      createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate() : new Date(raw.createdAt ?? Date.now()),
      updatedAt: raw.updatedAt?.toDate ? raw.updatedAt.toDate() : undefined,
    } as ProductModel;
  }

  private _slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
