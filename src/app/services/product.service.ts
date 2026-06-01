import { Injectable, signal } from '@angular/core';
import { ProductModel } from '../models/product.model';
import { MOCK_PRODUCTS } from './product-mock.data';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly productsList = signal<ProductModel[]>(MOCK_PRODUCTS);

  // Backward compatibility alias for components using getProducts() Signal
  public getProducts() {
    return this.productsList.asReadonly();
  }

  // 1. getAllProducts: Returns the complete list of products directly
  public getAllProducts(): ProductModel[] {
    return this.productsList();
  }

  // 2. getProductById
  public getProductById(id: string): ProductModel | undefined {
    return this.productsList().find(p => p.id === id);
  }

  // 3. getProductsByCategory
  public getProductsByCategory(category: string): ProductModel[] {
    return this.productsList().filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // 4. getFeaturedProducts
  public getFeaturedProducts(): ProductModel[] {
    return this.productsList().filter(p => p.isFeatured);
  }

  // 5. searchProducts
  public searchProducts(query: string): ProductModel[] {
    const q = (query || '').toLowerCase().trim();
    if (!q) return this.productsList();
    return this.productsList().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subCategory.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.materials.some(m => m.toLowerCase().includes(q))
    );
  }

  // 6. filterProducts
  // Supported filters: category, subCategory, minPrice, maxPrice, rating, inStock, size, color, material, sort
  public filterProducts(filters: any): ProductModel[] {
    let result = [...this.productsList()];

    if (filters.category) {
      result = result.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.subCategory) {
      result = result.filter(p => p.subCategory.toLowerCase() === filters.subCategory.toLowerCase());
    }

    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      result = result.filter(p => p.price >= filters.minPrice);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      result = result.filter(p => p.price <= filters.maxPrice);
    }

    if (filters.rating !== undefined && filters.rating !== null) {
      result = result.filter(p => p.rating >= filters.rating);
    }

    if (filters.inStock !== undefined && filters.inStock !== null) {
      result = result.filter(p => p.inStock === filters.inStock);
    }

    if (filters.material) {
      result = result.filter(p => p.materials.some(m => m.toLowerCase().includes(filters.material.toLowerCase())));
    }

    if (filters.size) {
      result = result.filter(p => p.sizes.some(s => s.toLowerCase() === filters.size.toLowerCase()));
    }

    if (filters.color) {
      result = result.filter(p => p.colors.some(c => c.toLowerCase().includes(filters.color.toLowerCase())));
    }

    // Sort order
    if (filters.sort) {
      if (filters.sort === 'price-low') {
        result.sort((a, b) => a.price - b.price);
      } else if (filters.sort === 'price-high') {
        result.sort((a, b) => b.price - a.price);
      } else if (filters.sort === 'rating') {
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (filters.sort === 'newest') {
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      }
    }

    return result;
  }
}
