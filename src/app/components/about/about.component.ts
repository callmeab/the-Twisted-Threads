import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { register } from 'swiper/element/bundle';

register();

export interface AboutValue {
  icon: string;
  title: string;
  description: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  image: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface Testimonial {
  name: string;
  location: string;
  rating: number;
  quote: string;
  image: string;
  product: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject(ElementRef<HTMLElement>);
  private revealObserver?: IntersectionObserver;

  protected readonly scrollY = signal(0);

  protected readonly heroImage =
    'https://images.unsplash.com/photo-1611591434851-0fefb849605e?q=80&w=1920&auto=format&fit=crop';

  protected readonly founderImage =
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop';

  protected readonly values: AboutValue[] = [
    {
      icon: 'quality',
      title: 'Uncompromising Quality',
      description:
        'Every clasp, stone, and strand is inspected by hand so each piece meets our atelier standard before it reaches you.',
    },
    {
      icon: 'authenticity',
      title: 'Authentic Craft',
      description:
        'We celebrate honest materials and traditional techniques—no mass production, only pieces with a maker\'s signature.',
    },
    {
      icon: 'sustainability',
      title: 'Mindful Sourcing',
      description:
        'Recycled precious metals, ethically sourced gemstones, and minimal-waste packaging guide every collection we release.',
    },
    {
      icon: 'heritage',
      title: 'Heritage & Story',
      description:
        'Each design draws from generations of textile and metalwork heritage, twisted into jewelry made for modern life.',
    },
    {
      icon: 'community',
      title: 'Community First',
      description:
        'We partner with local artisans and invest in fair wages, keeping craftsmanship alive in the communities that inspire us.',
    },
    {
      icon: 'timeless',
      title: 'Timeless Design',
      description:
        'Pieces meant to be worn for years—not seasons—balancing contemporary silhouettes with enduring elegance.',
    },
  ];

  protected readonly processSteps: ProcessStep[] = [
    {
      step: 1,
      title: 'Inspiration & Sketch',
      description:
        'Every collection begins at the drafting table, where texture, proportion, and movement are mapped in pencil and gold leaf studies.',
      image:
        'https://images.unsplash.com/photo-1452860606248-7aee3229b791?q=80&w=600&auto=format&fit=crop',
    },
    {
      step: 2,
      title: 'Material Selection',
      description:
        'We hand-select gemstones, threads, and metals for color harmony, durability, and responsible provenance.',
      image:
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
    },
    {
      step: 3,
      title: 'Hand Fabrication',
      description:
        'Artisans twist, solder, weave, and polish each component in our workshop—often using techniques passed down through families.',
      image:
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop',
    },
    {
      step: 4,
      title: 'Final Inspection',
      description:
        'Pieces are weighed, fitted, and photographed before receiving our hallmark and your personal care guide.',
      image:
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
    },
  ];

  protected readonly workshopGallery = [
    'https://images.unsplash.com/photo-1617038260897-41a608fafc66?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611591434851-0fefb849605e?q=80&w=500&auto=format&fit=crop',
  ];

  protected readonly team: TeamMember[] = [
    {
      name: 'Amara Elahi',
      role: 'Founder & Creative Director',
      bio: 'Trained in textile arts in Lahore and Florence, Amara founded The Twisted Threads to merge woven heritage with wearable gold.',
      image:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
    },
    {
      name: 'James Okonkwo',
      role: 'Master Goldsmith',
      bio: 'With twenty years at the bench, James leads our metalwork studio and mentors apprentice jewelers.',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    },
    {
      name: 'Sofia Mendez',
      role: 'Head of Design',
      bio: 'Sofia translates mood boards into sculptural forms, balancing bold statements with everyday wearability.',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    },
    {
      name: 'Lina Hassan',
      role: 'Client Experience Lead',
      bio: 'Lina ensures every custom order and repair receives the white-glove care our patrons deserve.',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop',
    },
  ];

  protected readonly testimonials: Testimonial[] = [
    {
      name: 'Eleanor Vance',
      location: 'Portland, OR',
      rating: 5,
      quote:
        'The twisted rope bracelet feels substantial yet delicate. I receive compliments every time I wear it—and the packaging was museum-worthy.',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
      product: 'Twisted Rope Bracelet',
    },
    {
      name: 'Priya Sharma',
      location: 'Toronto, CA',
      rating: 5,
      quote:
        'I commissioned a custom necklace for my wedding. The team kept me updated at every stage, and the final piece exceeded my dreams.',
      image:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      product: 'Custom Bridal Necklace',
    },
    {
      name: 'Marcus Chen',
      location: 'San Francisco, CA',
      rating: 5,
      quote:
        'Finally, jewelry with a story. Knowing each piece is handmade makes gifting from The Twisted Threads feel truly special.',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
      product: 'Heritage Signet Ring',
    },
    {
      name: 'Isabelle Laurent',
      location: 'Paris, FR',
      rating: 5,
      quote:
        'The craftsmanship is extraordinary. The gold has a warmth you simply do not find in mass-produced pieces.',
      image:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
      product: 'Luminous Drop Earrings',
    },
  ];

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scrollY.set(window.scrollY);
    }
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
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const revealElements = Array.from(
      this.host.nativeElement.querySelectorAll('.reveal')
    ) as Element[];
    revealElements.forEach(el => {
      this.revealObserver?.observe(el);
    });
  }

  public ngOnDestroy(): void {
    this.revealObserver?.disconnect();
  }

  protected starsArray(rating: number): number[] {
    return Array.from({ length: rating }, (_, i) => i);
  }

  protected scrollToStory(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.host.nativeElement.querySelector('#brand-story')?.scrollIntoView({ behavior: 'smooth' });
  }
}
