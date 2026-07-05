import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

type CareSection = 'shipping' | 'returns' | 'sizing' | 'care' | 'custom';

@Component({
  selector: 'app-customer-care',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './customer-care.component.html',
  styleUrl: './customer-care.component.scss'
})
export class CustomerCareComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  
  public currentSection = signal<CareSection>('shipping');
  private sub?: Subscription;

  public readonly sections: { id: CareSection; label: string; icon: string }[] = [
    { id: 'shipping', label: 'Shipping & Delivery', icon: 'local_shipping' },
    { id: 'returns', label: 'Returns & Exchanges', icon: 'sync_alt' },
    { id: 'sizing', label: 'Jewelry Sizing Guide', icon: 'straighten' },
    { id: 'care', label: 'Jewelry Care Guide', icon: 'cleaning_services' },
    { id: 'custom', label: 'Custom Orders', icon: 'design_services' },
  ];

  public ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(params => {
      const sectionParam = params.get('section') as CareSection;
      
      const validSections = this.sections.map(s => s.id);
      if (sectionParam && validSections.includes(sectionParam)) {
        this.currentSection.set(sectionParam);
        // Optional: scroll to top smoothly when changing sections
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback or redirect
        this.router.navigate(['/customer-care/shipping'], { replaceUrl: true });
      }
    });
  }

  public ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  public get currentSectionTitle(): string {
    return this.sections.find(s => s.id === this.currentSection())?.label || 'Customer Care';
  }
}
