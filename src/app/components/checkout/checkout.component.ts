import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { WhatsAppService } from '../../services/whatsapp.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { ToastrService } from 'ngx-toastr';
import { CustomerInfo, PaymentProof, ShippingAddress } from '../../models/order.model';
import { HttpClient } from '@angular/common/http';
import { HostListener, OnInit } from '@angular/core';
import { EmailNotificationService } from '../../services/email-notification.service';

export const GIFT_WRAP_FEE = 200;
export const COD_FEE = 150;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  protected readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly whatsappService = inject(WhatsAppService);
  private readonly http = inject(HttpClient);
  private readonly emailNotificationService = inject(EmailNotificationService);

  protected currentStep = 1;
  protected paymentMethod: 'COD' | 'BankTransfer' | '' = '';
  protected receiptFile: string | null = null;
  protected receiptFileName: string | null = null;
  protected receiptFileType: string | null = null;
  protected isDragging = false;

  // Step 3 state
  protected orderNotes = '';
  protected isGift = false;
  protected giftMessage = '';
  protected giftWrap = false;
  protected agreeToTerms = false;
  protected agreeToPrivacy = false;
  protected isProcessing = false;
  protected isSuccess = false;
  protected showTermsModal = false;

  protected get codFee(): number { return this.paymentMethod === 'COD' ? COD_FEE : 0; }
  protected get giftWrapFee(): number { return this.giftWrap ? GIFT_WRAP_FEE : 0; }
  protected get grandTotal(): number { return this.cartService.totalPrice() + this.codFee + this.giftWrapFee; }

  protected address: ShippingAddress = {
    fullName: '',
    email: '',
    whatsappNumber: '',
    phone: '',
    alternativePhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: 'Pakistan'
  };

  protected billingSameAsShipping = true;
  protected provinces = ['Sindh', 'Punjab', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Azad Kashmir', 'Islamabad Capital Territory'];
  
  protected citySearchQuery = '';
  protected allCities: string[] = [];
  protected filteredCities: string[] = [];
  protected showCityDropdown = false;
  protected isLoadingCities = false;

  protected readonly phonePattern = '^(?:\\+92|0)[\\s-]?3\\d{2}[\\s-]?\\d{7}$';
  protected readonly addressStorageKey = 'checkoutShippingAddress';

  protected readonly bankDetails = {
    bankName: 'Habib Bank Limited (HBL)',
    accountTitle: 'The Twisted Threads',
    accountNumber: '1234-5678-9012-34',
    iban: 'PK00HABB0012345678901234',
    branchCode: '0123'
  };

  constructor() {
    this.loadAddressFromStorage();
  }

  ngOnInit(): void {
    this.fetchCities();
  }

  private fetchCities(): void {
    this.isLoadingCities = true;
    this.http.post<{ error: boolean, data: string[] }>('https://countriesnow.space/api/v0.1/countries/cities', { country: 'Pakistan' })
      .subscribe({
        next: (response) => {
          if (!response.error && response.data) {
            this.allCities = response.data;
          }
          this.isLoadingCities = false;
        },
        error: (err) => {
          console.error('Failed to load cities', err);
          this.isLoadingCities = false;
          // Fallback to a small list if API fails
          this.allCities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];
        }
      });
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.city-autocomplete-wrapper')) {
      this.showCityDropdown = false;
    }
  }

  protected filterCities(): void {
    if (!this.citySearchQuery.trim()) {
      this.filteredCities = this.allCities.slice(0, 100); // Limit default list for performance
      this.showCityDropdown = true;
      return;
    }
    const query = this.citySearchQuery.toLowerCase();
    this.filteredCities = this.allCities.filter(c => c.toLowerCase().includes(query)).slice(0, 100);
    this.showCityDropdown = true;
  }

  protected selectCity(city: string): void {
    this.address.city = city;
    this.citySearchQuery = city;
    this.showCityDropdown = false;
    this.persistChanges();
  }

  protected onCityFocus(): void {
    this.filterCities();
  }

  protected onCityInput(): void {
    this.address.city = this.citySearchQuery;
    this.filterCities();
    this.persistChanges();
  }

  protected onNext(checkoutForm: NgForm): void {
    if (this.currentStep === 1) {
      if (!checkoutForm.valid) {
        checkoutForm.control.markAllAsTouched();
        return;
      }
      this.saveAddressToStorage();
      this.currentStep = 2;
      this.toastr.success('Customer details saved.', 'Step 1 Complete');
    } else if (this.currentStep === 2) {
      if (!this.paymentMethod) {
        this.toastr.warning('Please select a payment method.', 'Selection Required');
        return;
      }
      if (this.paymentMethod === 'BankTransfer' && !this.receiptFile) {
        this.toastr.warning('Please upload a bank receipt to proceed.', 'Receipt Required');
        return;
      }
      this.saveAddressToStorage();
      this.currentStep = 3;
      this.toastr.success('Payment method saved.', 'Step 2 Complete');
    }
  }

  protected onBack(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.saveAddressToStorage();
    }
  }

  protected async onPlaceOrder(): Promise<void> {
    if (!this.agreeToTerms || !this.agreeToPrivacy) {
      this.toastr.warning('Please accept the Terms & Conditions and Privacy Policy.', 'Consent Required');
      document.getElementById('terms-consent-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const items = this.cartService.items();
    if (items.length === 0) {
      this.toastr.error('Your cart is empty.', 'Order Failed');
      return;
    }

    this.isProcessing = true;

    try {
      const customerInfo: CustomerInfo = {
        fullName: this.address.fullName,
        email: this.address.email,
        whatsappNumber: this.address.whatsappNumber,
        phone: this.address.phone,
        alternativePhone: this.address.alternativePhone,
      };

      const paymentMethod =
        this.paymentMethod === 'COD' ? 'COD' as const : 'BANK_TRANSFER' as const;

      let paymentProof: PaymentProof | undefined;
      if (paymentMethod === 'BANK_TRANSFER' && this.receiptFile && this.receiptFileName) {
        paymentProof = {
          fileName: this.receiptFileName,
          fileData: this.receiptFile,
          uploadedAt: new Date(),
          uploadMethod: 'WEBSITE',
        };
      }

      const order = await this.orderService.createOrder({
        email: this.address.email,
        customerInfo,
        items,
        shippingAddress: { ...this.address },
        paymentMethod,
        paymentProof,
        orderNotes: this.buildOrderNotes(),
        subtotal: this.cartService.subtotal(),
        shippingCost: this.cartService.shipping() + this.codFee + this.giftWrapFee,
        total: this.grandTotal,
      });

      // Send professional email notifications via Google Apps Script (in the background)
      try {
        this.emailNotificationService.sendOrderEmails(order).subscribe({
          next: () => console.info('[Checkout] Email notifications successfully dispatched.'),
          error: (err) => console.error('[Checkout] Failed to dispatch email notifications:', err)
        });
      } catch (e) {
        console.error('[Checkout] Error calling email notification service:', e);
      }

      // Automatically launch the Click-to-WhatsApp URL
      // try {
      //   const whatsappUrl = this.whatsappService.getOrderWhatsAppUrl(order);
      //   window.open(whatsappUrl, '_blank');
      // } catch (err) {
      //   console.warn('[Checkout] Failed to auto-open WhatsApp link:', err);
      // }

      this.isProcessing = false;
      this.isSuccess = true;

      setTimeout(() => {
        this.cartService.clearCart();
        window.localStorage.removeItem(this.addressStorageKey);
        this.toastr.success(`Order ${order.orderNumber} placed successfully!`, 'Order Complete');
        this.router.navigate(['/order-confirmation']);
      }, 1500);
    } catch (err) {
      console.error('[Checkout] Order placement failed:', err);
      this.isProcessing = false;
      this.toastr.error('Failed to place your order. Please try again.', 'Order Failed');
    }
  }

  protected persistChanges(): void {
    this.saveAddressToStorage();
  }

  protected copyBankDetail(text: string, fieldLabel: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.toastr.success(`${fieldLabel} copied to clipboard!`, 'Copied');
    }).catch(() => {
      this.toastr.error('Failed to copy to clipboard.', 'Error');
    });
  }

  protected onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.processFile(target.files[0]);
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  protected removeReceipt(): void {
    this.receiptFile = null;
    this.receiptFileName = null;
    this.receiptFileType = null;
    this.persistChanges();
    this.toastr.info('Receipt removed.', 'Upload Reset');
  }

  protected sendReceiptViaWhatsApp(): void {
    const orderTotal = this.cartService.totalPrice();
    const customerName = this.address.fullName || 'Valued Customer';
    const message = `Hi The Twisted Threads, this is ${customerName}. Here is the bank transfer receipt for my order total of ${orderTotal} PKR.`;
    const whatsappUrl = `https://wa.me/923316903634?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  protected processFile(file: File): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      this.toastr.error('Invalid format. Please upload JPG, PNG or PDF.', 'Upload Error');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastr.error('File size exceeds the 5MB limit.', 'Upload Error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.receiptFile = reader.result as string;
      this.receiptFileName = file.name;
      this.receiptFileType = file.type;
      this.persistChanges();
      this.toastr.success('Receipt uploaded successfully!', 'Upload Complete');
    };
    reader.onerror = () => {
      this.toastr.error('Failed to read file.', 'Upload Error');
    };
    reader.readAsDataURL(file);
  }

  private buildOrderNotes(): string {
    const parts: string[] = [];
    if (this.orderNotes.trim()) {
      parts.push(this.orderNotes.trim());
    }
    if (this.isGift) {
      parts.push('Gift order');
      if (this.giftMessage.trim()) {
        parts.push(`Gift message: ${this.giftMessage.trim()}`);
      }
    }
    if (this.giftWrap) {
      parts.push('Gift wrap requested');
    }
    return parts.join(' | ');
  }

  private saveAddressToStorage(): void {
    const payload = {
      address: this.address,
      billingSameAsShipping: this.billingSameAsShipping,
      currentStep: this.currentStep,
      paymentMethod: this.paymentMethod,
      receiptFile: this.receiptFile,
      receiptFileName: this.receiptFileName,
      receiptFileType: this.receiptFileType,
      orderNotes: this.orderNotes,
      isGift: this.isGift,
      giftMessage: this.giftMessage,
      giftWrap: this.giftWrap
    };

    window.localStorage.setItem(this.addressStorageKey, JSON.stringify(payload));
  }

  private loadAddressFromStorage(): void {
    const saved = window.localStorage.getItem(this.addressStorageKey);

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as {
        address?: Partial<ShippingAddress>;
        billingSameAsShipping?: boolean;
        currentStep?: number;
        paymentMethod?: 'COD' | 'BankTransfer' | '';
        receiptFile?: string | null;
        receiptFileName?: string | null;
        receiptFileType?: string | null;
        orderNotes?: string;
        isGift?: boolean;
        giftMessage?: string;
        giftWrap?: boolean;
      };
      this.address = {
        ...this.address,
        ...parsed.address
      } as ShippingAddress;
      this.billingSameAsShipping = parsed.billingSameAsShipping ?? true;
      this.currentStep = parsed.currentStep ?? 1;
      this.paymentMethod = parsed.paymentMethod ?? '';
      this.citySearchQuery = this.address.city; // Restore query from loaded city
      this.receiptFile = parsed.receiptFile ?? null;
      this.receiptFileName = parsed.receiptFileName ?? null;
      this.receiptFileType = parsed.receiptFileType ?? null;
      this.orderNotes = parsed.orderNotes ?? '';
      this.isGift = parsed.isGift ?? false;
      this.giftMessage = parsed.giftMessage ?? '';
      this.giftWrap = parsed.giftWrap ?? false;
    } catch {
      // Invalid stored payload is skipped.
    }
  }
}
