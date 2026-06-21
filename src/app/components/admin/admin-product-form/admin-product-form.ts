import {
  Component, inject, signal, computed, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, Validators, FormArray, AbstractControl
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';

import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-admin-product-form',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, RouterLink],
  templateUrl: './admin-product-form.html',
  styleUrl: './admin-product-form.css',
})
export class AdminProductForm implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private products = inject(ProductService);
  private toastr = inject(ToastrService);

  // ── Mode ────────────────────────────────────────────────────────────────
  editId = signal<string | null>(null);
  isEdit = computed(() => !!this.editId());
  isSaving = signal(false);
  isLoadingProduct = signal(false);

  // ── Image state ─────────────────────────────────────────────────────────
  existingImages = signal<string[]>([]);
  imageInput = signal('');

  // ── Chip helpers ─────────────────────────────────────────────────────────
  tagInput = signal('');
  materialInput = signal('');
  sizeInput = signal('');
  colorInput = signal('');

  readonly CATEGORIES = ['Apparel', 'Home Decor', 'Accessories', 'Jewelry', 'Footwear', 'Bags'];
  readonly SORT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  // ── Form ─────────────────────────────────────────────────────────────────
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    longDescription: [''],
    category: ['', Validators.required],
    subCategory: [''],
    price: [0, [Validators.required, Validators.min(1)]],
    originalPrice: [0],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    inStock: [true],
    isFeatured: [false],
    isNew: [false],
    isActive: [true],
    tags: this.fb.array([] as string[]),
    materials: this.fb.array([] as string[]),
    sizes: this.fb.array([] as string[]),
    colors: this.fb.array([] as string[]),
  });

  // Typed array getters
  get tagsArray() { return this.form.get('tags') as FormArray; }
  get materialsArray() { return this.form.get('materials') as FormArray; }
  get sizesArray() { return this.form.get('sizes') as FormArray; }
  get colorsArray() { return this.form.get('colors') as FormArray; }

  discount = computed(() => {
    const p = this.form.get('price')?.value ?? 0;
    const o = this.form.get('originalPrice')?.value ?? 0;
    if (!o || o <= p) return 0;
    return Math.round(((o - p) / o) * 100);
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────
  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      await this.loadProduct(id);
    }
  }

  ngOnDestroy() {
    // No cleanup needed for URLs
  }

  private async loadProduct(id: string) {
    this.isLoadingProduct.set(true);
    const p = await this.products.getProductByIdAsync(id);
    if (!p) {
      this.toastr.error('Product not found.', 'Error');
      this.router.navigate(['/admin/products']);
      return;
    }

    this.form.patchValue({
      name: p.name,
      description: p.description,
      longDescription: p.longDescription,
      category: p.category,
      subCategory: p.subCategory,
      price: p.price,
      originalPrice: p.originalPrice,
      stockQuantity: p.stockQuantity,
      inStock: p.inStock,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      isActive: p.isActive,
    });

    // Populate arrays
    p.tags.forEach(t => this.tagsArray.push(this.fb.control(t)));
    p.materials.forEach(m => this.materialsArray.push(this.fb.control(m)));
    p.sizes.forEach(s => this.sizesArray.push(this.fb.control(s)));
    p.colors.forEach(c => this.colorsArray.push(this.fb.control(c)));

    // Existing images
    this.existingImages.set(p.images || []);
    this.isLoadingProduct.set(false);
  }

  // ── Image handling ────────────────────────────────────────────────────────
  addImageUrl() {
    const url = this.imageInput().trim();
    if (!url) return;

    // Basic URL validation
    try {
      new URL(url);
      this.existingImages.update(cur => [...cur, url]);
      this.imageInput.set('');
    } catch {
      this.toastr.error('Please enter a valid HTTP/HTTPS URL', 'Invalid URL');
    }
  }

  addImageUrlOnEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addImageUrl();
    }
  }

  removeImage(index: number) {
    this.existingImages.update(cur => cur.filter((_, i) => i !== index));
  }

  // ── Chip management ───────────────────────────────────────────────────────
  addChip(array: FormArray, inputSignal: any, rawValue: string) {
    const val = rawValue.trim();
    if (!val) return;
    const exists = array.controls.some((c: AbstractControl) => c.value === val);
    if (!exists) array.push(this.fb.control(val));
    inputSignal.set('');
  }

  addChipOnEnter(event: KeyboardEvent, array: FormArray, inputSignal: any, current: string) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addChip(array, inputSignal, current);
    }
  }

  removeChip(array: FormArray, index: number) {
    array.removeAt(index);
  }

  addQuickSize(size: string) {
    const exists = this.sizesArray.controls.some((c: AbstractControl) => c.value === size);
    if (!exists) this.sizesArray.push(this.fb.control(size));
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Please fix the form errors before saving.', 'Validation');
      return;
    }
    if (this.existingImages().length === 0) {
      this.toastr.warning('Please add at least one product image URL.', 'Image Required');
      return;
    }

    this.isSaving.set(true);
    try {
      const productId = this.editId() ?? crypto.randomUUID();
      const name = this.form.get('name')!.value!;

      const imageUrls = this.existingImages();
      const price = this.form.get('price')!.value ?? 0;
      const originalPrice = this.form.get('originalPrice')!.value ?? 0;
      const discountPct = originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

      const payload = {
        name,
        description: this.form.get('description')!.value ?? '',
        longDescription: this.form.get('longDescription')!.value ?? '',
        category: this.form.get('category')!.value ?? '',
        subCategory: this.form.get('subCategory')!.value ?? '',
        price,
        originalPrice,
        discount: discountPct,
        stockQuantity: this.form.get('stockQuantity')!.value ?? 0,
        inStock: this.form.get('inStock')!.value ?? true,
        isFeatured: this.form.get('isFeatured')!.value ?? false,
        isNew: this.form.get('isNew')!.value ?? false,
        isActive: this.form.get('isActive')!.value ?? true,
        tags: this.tagsArray.value as string[],
        materials: this.materialsArray.value as string[],
        sizes: this.sizesArray.value as string[],
        colors: this.colorsArray.value as string[],
        images: imageUrls,
        imageStoragePaths: [], // No longer used
        mainImage: imageUrls[0] ?? '',
        slug: this._slugify(name),
        rating: 0,
        reviewCount: 0,
      };

      if (this.isEdit()) {
        await this.products.updateProduct(this.editId()!, payload);
        this.toastr.success('Product updated successfully!', 'Saved');
      } else {
        await this.products.createProduct(payload as any);
        this.toastr.success('Product created and published!', 'Created');
      }

      this.router.navigate(['/admin/products']);
    } catch (err: any) {
      console.error('[AdminProductForm] save error:', err);
      this.toastr.error(err?.message ?? 'Failed to save product.', 'Error');
    } finally {
      this.isSaving.set(false);
    }
  }

  private _slugify(text: string): string {
    return text.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  ctrl(name: string) { return this.form.get(name)!; }
  isInvalid(name: string) {
    const c = this.ctrl(name);
    return c.invalid && c.touched;
  }
}
