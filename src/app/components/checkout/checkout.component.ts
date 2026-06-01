import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { ToastrService } from 'ngx-toastr';
import { ShippingAddress } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, CustomCurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
  protected readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  protected address: ShippingAddress = {
    fullName: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
  };

  protected onSubmit(isValid: boolean | null): void {
    if (isValid && this.cartService.items().length > 0) {
      const total = this.cartService.totalPrice();
      const items = this.cartService.items();
      
      // Submit order
      const order = this.orderService.createOrder(items, this.address, total);
      
      // Clear shopping bag
      this.cartService.clearCart();
      
      this.toastr.success(`Order ${order.id} generated successfully!`, 'Transaction Authorized');
      this.router.navigate(['/order-confirmation']);
    }
  }
}
