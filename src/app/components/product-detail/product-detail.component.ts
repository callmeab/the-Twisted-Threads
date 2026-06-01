import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CustomCurrencyPipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly toastr = inject(ToastrService);

  protected readonly product = signal<Product | undefined>(undefined);
  protected readonly activeImage = signal<string>('');
  protected readonly quantity = signal<number>(1);

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const prod = this.productService.getProductById(id);
      if (prod) {
        this.product.set(prod);
        this.activeImage.set(prod.images[0]);
      } else {
        this.router.navigate(['/products']);
      }
    }
  }

  protected increaseQty(): void {
    const limit = this.product()?.stockQuantity || 99;
    if (this.quantity() < limit) {
      this.quantity.update(q => q + 1);
    }
  }

  protected decreaseQty(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  protected addToCart(): void {
    const prod = this.product();
    if (prod) {
      this.cartService.addToCart(prod, this.quantity());
      this.toastr.success(`${this.quantity()}x ${prod.name} added to cart.`, 'Cart Updated');
    }
  }
}
