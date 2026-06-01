import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, CustomCurrencyPipe, DatePipe],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss'
})
export class OrderConfirmationComponent implements OnDestroy {
  protected readonly orderService = inject(OrderService);

  public ngOnDestroy(): void {
    // Keep it persisted during viewing but we can clear it when they leave
  }

  protected clearOrderState(): void {
    this.orderService.clearCurrentOrder();
  }
}
