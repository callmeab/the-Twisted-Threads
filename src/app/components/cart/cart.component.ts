import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CustomCurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  protected readonly cartService = inject(CartService);
  private readonly toastr = inject(ToastrService);

  protected removeItem(productId: string, productName: string): void {
    this.cartService.removeFromCart(productId);
    this.toastr.info(`${productName} has been removed.`, 'Item Removed');
  }

  protected increaseQty(productId: string, currentQty: number, stockLimit: number): void {
    if (currentQty < stockLimit) {
      this.cartService.updateQuantity(productId, currentQty + 1);
    }
  }

  protected decreaseQty(productId: string, currentQty: number): void {
    this.cartService.updateQuantity(productId, currentQty - 1);
  }

  protected clearCart(): void {
    this.cartService.clearCart();
    this.toastr.info('All items removed from your shopping bag.', 'Bag Cleared');
  }
}
