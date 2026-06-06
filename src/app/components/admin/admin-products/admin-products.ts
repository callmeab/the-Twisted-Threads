import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../../../services/product.service';
import { ProductImageUploadService } from '../../../services/product-image-upload.service';
import { ProductModel } from '../../../models/product.model';

@Component({
  selector: 'app-admin-products',
  imports: [CommonModule, RouterLink, MatIconModule, FormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class AdminProducts {
  private productService  = inject(ProductService);
  private imageUpload     = inject(ProductImageUploadService);
  private toastr          = inject(ToastrService);

  search          = signal('');
  filterCategory  = signal('All');
  filterStatus    = signal('All'); // 'All' | 'Active' | 'Inactive'
  deleting        = signal<string | null>(null);
  toggling        = signal<string | null>(null);
  confirmDeleteId = signal<string | null>(null);

  // Admin sees ALL products (active + inactive)
  allProducts = this.productService.allProductsSignal;

  categories = computed(() => [
    'All',
    ...new Set(this.allProducts().map(p => p.category)),
  ]);

  filtered = computed(() => {
    const q      = this.search().toLowerCase();
    const cat    = this.filterCategory();
    const status = this.filterStatus();

    return this.allProducts().filter(p => {
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      const matchCat    = cat === 'All' || p.category === cat;
      const matchStatus =
        status === 'All' ||
        (status === 'Active'   &&  p.isActive) ||
        (status === 'Inactive' && !p.isActive);
      return matchSearch && matchCat && matchStatus;
    });
  });

  stats = computed(() => {
    const all = this.allProducts();
    return {
      total:    all.length,
      active:   all.filter(p =>  p.isActive).length,
      inactive: all.filter(p => !p.isActive).length,
      outOfStock: all.filter(p => !p.inStock).length,
    };
  });

  onSearch(e: Event) {
    this.search.set((e.target as HTMLInputElement).value);
  }

  requestDelete(id: string) {
    this.confirmDeleteId.set(id);
  }

  cancelDelete() {
    this.confirmDeleteId.set(null);
  }

  async confirmDelete(product: ProductModel) {
    this.deleting.set(product.id);
    this.confirmDeleteId.set(null);
    try {
      await this.productService.deleteProduct(product.id);
      this.toastr.success(`"${product.name}" deleted.`, 'Deleted');
    } catch {
      this.toastr.error('Failed to delete product.', 'Error');
    } finally {
      this.deleting.set(null);
    }
  }

  async toggleActive(product: ProductModel) {
    this.toggling.set(product.id);
    try {
      await this.productService.toggleActive(product.id, !product.isActive);
      const state = !product.isActive ? 'published' : 'hidden';
      this.toastr.success(`"${product.name}" is now ${state}.`, 'Updated');
    } catch {
      this.toastr.error('Failed to update visibility.', 'Error');
    } finally {
      this.toggling.set(null);
    }
  }
}
