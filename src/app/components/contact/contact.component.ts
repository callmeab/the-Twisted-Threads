import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { ContactService } from '../../services/contact.service';
import { ContactSubject, ContactSubjectOption } from '../../models/contact.model';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface SocialLink {
  label: string;
  href: string;
  icon: 'instagram' | 'facebook' | 'pinterest' | 'youtube';
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  private readonly contactService = inject(ContactService);
  private readonly toastr = inject(ToastrService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject(ElementRef<HTMLElement>);

  private revealObserver?: IntersectionObserver;

  protected readonly isSubmitting = signal(false);
  protected readonly showSuccess = signal(false);
  protected readonly expandedFaqId = signal<string | null>('faq-1');

  protected contactData = {
    fullName: '',
    email: '',
    phone: '',
    subject: '' as ContactSubject | '',
    message: '',
  };

  protected readonly subjectOptions: ContactSubjectOption[] = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'order', label: 'Order Issue' },
    { value: 'custom', label: 'Custom Order' },
    { value: 'product', label: 'Product Question' },
    { value: 'returns', label: 'Returns & Exchanges' },
    { value: 'wholesale', label: 'Partnership / Wholesale' },
  ];

  protected readonly business = {
    name: 'The Twisted Threads Atelier',
    address: 'Haroonabad, Punjab Pakistan',
    phone: '03316903634',
    whatsapp: '923316903634',
    email: 'twistedthread45@gmail.com',
    hours: 'Monday - Friday: 10am - 6pm PKT\nSaturday - Sunday: Closed'
  };

  protected readonly mapEmbedUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://maps.google.com/maps?q=Haroonabad,+Punjab,+Pakistan&z=15&output=embed'
  );

  protected readonly directionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=Haroonabad,+Punjab,+Pakistan';

  protected readonly socialLinks: SocialLink[] = [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/the_twisted_threadsss?igsh=YjhxeGxvd2I0MDF0',
      icon: 'instagram',
    },
    {
      label: 'Facebook',
      href: 'https://facebook.com/thetwistedthreads',
      icon: 'facebook',
    },
    {
      label: 'Pinterest',
      href: 'https://pinterest.com/thetwistedthreads',
      icon: 'pinterest',
    },
    {
      label: 'YouTube',
      href: 'https://youtube.com/@thetwistedthreads',
      icon: 'youtube',
    },
  ];

  protected readonly faqs: FaqItem[] = [
    {
      id: 'faq-1',
      question: 'How long does shipping take?',
      answer:
        'Standard domestic orders arrive within 5–7 business days. Custom pieces may require 2–3 weeks for fabrication before shipping. You will receive tracking details by email once your order ships.',
    },
    {
      id: 'faq-2',
      question: 'Do you accept custom jewelry orders?',
      answer:
        'Yes. Select "Custom Order" in the contact form and share your inspiration, budget, and timeline. Our design team will schedule a consultation within 48 hours.',
    },
    {
      id: 'faq-3',
      question: 'What is your return policy?',
      answer:
        'Unworn items in original packaging may be returned within 14 days of delivery. Custom and engraved pieces are final sale unless there is a craftsmanship defect.',
    },
    {
      id: 'faq-4',
      question: 'How do I verify my bank transfer payment?',
      answer:
        'Upload your receipt at checkout or send it via WhatsApp. Verification typically completes within 24–48 business hours. Track status on our order tracking page.',
    },
    {
      id: 'faq-5',
      question: 'Can I visit the atelier in person?',
      answer:
        'Walk-ins are welcome during business hours, though appointments are recommended for custom consultations. Use the directions link below to find our Haroonabad studio.',
    },
  ];

  protected get whatsAppUrl(): string {
    const text = encodeURIComponent('Hi The Twisted Threads, I would like to get in touch.');
    return `https://wa.me/${this.business.whatsapp}?text=${text}`;
  }

  public ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.revealObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
    );

    const revealElements = Array.from(
      this.host.nativeElement.querySelectorAll('.reveal')
    ) as Element[];
    revealElements.forEach(el => this.revealObserver?.observe(el));
  }

  public ngOnDestroy(): void {
    this.revealObserver?.disconnect();
  }

  protected async onSubmit(form: NgForm): Promise<void> {
    if (!form.valid || this.isSubmitting()) {
      form.control.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.showSuccess.set(false);

    try {
      await this.contactService.submitInquiry({
        fullName: this.contactData.fullName.trim(),
        email: this.contactData.email.trim(),
        phone: this.contactData.phone.trim() || undefined,
        subject: this.contactData.subject as ContactSubject,
        message: this.contactData.message.trim(),
      });

      this.showSuccess.set(true);
      this.toastr.success(
        'Thank you! Our concierge team will respond within one business day.',
        'Message sent'
      );

      form.resetForm();
      this.contactData = {
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      };
    } catch {
      this.toastr.error('Something went wrong. Please try again or message us on WhatsApp.', 'Send failed');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected toggleFaq(id: string): void {
    this.expandedFaqId.update(current => (current === id ? null : id));
  }

  protected isFaqExpanded(id: string): boolean {
    return this.expandedFaqId() === id;
  }

  protected dismissSuccess(): void {
    this.showSuccess.set(false);
  }
}
