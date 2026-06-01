import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProductModel } from '../models/product.model';
import {
  ProductQuickViewDialogComponent,
  ProductQuickViewDialogResult,
} from '../components/product-quick-view/product-quick-view-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ProductQuickViewService {
  private readonly dialog = inject(MatDialog);

  public open(product: ProductModel): MatDialogRef<
    ProductQuickViewDialogComponent,
    ProductQuickViewDialogResult
  > {
    return this.dialog.open(ProductQuickViewDialogComponent, {
      data: { product },
      panelClass: 'quick-view-dialog-panel',
      backdropClass: 'quick-view-backdrop',
      width: '920px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
    });
  }
}
