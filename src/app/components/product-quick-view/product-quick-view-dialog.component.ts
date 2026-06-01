import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { animate, style, transition, trigger } from '@angular/animations';
import { ProductModel } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';

export interface ProductQuickViewData {
  product: ProductModel;
}

export interface ProductQuickViewDialogResult {
  addedToCart?: boolean;
}

@Component({
  selector: 'app-product-quick-view-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatButtonModule, CustomCurrencyPipe],
  templateUrl: './product-quick-view-dialog.component.html',
  styleUrl: './product-quick-view-dialog.component.scss',
  animations: [
    trigger('dialogEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.92)' }),
        animate('320ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('flyToCart', [
      transition(':enter', [
        style({ opacity: 1, transform: 'translate(0, 0) scale(1)' }),
        animate(
          '650ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 0, transform: 'translate(42vw, -38vh) scale(0.15)' })
        ),
      ]),
    ]),
  ],
})
export class ProductQuickViewDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<ProductQuickViewDialogComponent, ProductQuickViewDialogResult>);
  private readonly data = inject<ProductQuickViewData>(MAT_DIALOG_DATA);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  protected readonly product = this.data.product;
  protected readonly activeImageIndex = signal(0);
  protected readonly selectedSize = signal('');
  protected readonly selectedColor = signal('');
  protected readonly quantity = signal(1);
  protected readonly isZoomed = signal(false);
  protected readonly zoomOrigin = signal('50% 50%');
  protected readonly isAdding = signal(false);
  protected readonly showFlyAnimation = signal(false);
  protected readonly addSuccess = signal(false);

  protected get images(): string[] {
    const imgs = this.product.images?.length ? this.product.images : [this.product.mainImage];
    return imgs.filter(Boolean);
  }

  protected get activeImage(): string {
    return this.images[this.activeImageIndex()] ?? this.product.mainImage;
  }

  protected get hasSizes(): boolean {
    return (this.product.sizes?.length ?? 0) > 0;
  }

  protected get hasColors(): boolean {
    return (this.product.colors?.length ?? 0) > 0;
  }

  protected get roundedRating(): number {
    return Math.round(this.product.rating || 0);
  }

  public ngOnInit(): void {
    this.selectedSize.set(this.product.sizes?.[0] ?? '');
    this.selectedColor.set(this.product.colors?.[0] ?? '');
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected selectImage(index: number): void {
    this.activeImageIndex.set(index);
    this.isZoomed.set(false);
  }

  protected toggleZoom(): void {
    this.isZoomed.update(v => !v);
  }

  protected onImageMouseMove(event: MouseEvent): void {
    if (!this.isZoomed()) {
      return;
    }
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.zoomOrigin.set(`${x}% ${y}%`);
  }

  protected onImageMouseLeave(): void {
    if (this.isZoomed()) {
      this.zoomOrigin.set('50% 50%');
    }
  }

  protected decreaseQty(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  protected increaseQty(): void {
    const max = this.product.stockQuantity || 99;
    if (this.quantity() < max) {
      this.quantity.update(q => q + 1);
    }
  }

  protected addToCart(): void {
    if (!this.product.inStock || this.isAdding()) {
      return;
    }

    if (this.hasSizes && !this.selectedSize()) {
      return;
    }

    this.isAdding.set(true);
    this.showFlyAnimation.set(true);

    this.cartService.addToCart(this.product, this.quantity(), {
      selectedSize: this.selectedSize(),
      selectedColor: this.selectedColor(),
    });

    this.addSuccess.set(true);

    setTimeout(() => {
      this.isAdding.set(false);
      this.dialogRef.close({ addedToCart: true });
    }, 720);
  }

  protected viewFullDetails(): void {
    void this.router.navigate(['/products', this.product.id]);
    this.dialogRef.close();
  }
}
