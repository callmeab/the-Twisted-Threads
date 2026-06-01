import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { GlobalLoaderComponent } from './components/shared/global-loader/global-loader.component';
import { BottomNavComponent } from './components/shared/bottom-nav/bottom-nav.component';
import { WhatsappFloatingComponent } from './components/shared/whatsapp-floating/whatsapp-floating.component';
import { LoaderService } from './services/loader.service';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SeoService } from './services/seo.service';
import { organizationSchema, localBusinessSchema } from './services/seo-schemas';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, GlobalLoaderComponent, BottomNavComponent, WhatsappFloatingComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('the-Twisted-Threads');

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly loader = inject(LoaderService);
  private readonly seo = inject(SeoService);

  public ngOnInit(): void {
    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        ),
        takeUntilDestroyed(this)
      )
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this.loader.show('Loading...');
        } else {
          this.loader.hide(200);
        }
      });

    // Update SEO meta on navigation end using route data
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(this)).subscribe(() => {
      let rt = this.route.firstChild;
      while (rt && rt.firstChild) {
        rt = rt.firstChild;
      }
      const data = rt?.snapshot?.data || {};
      this.seo.setMeta({
        title: data['title'] || 'The Twisted Threads',
        description: data['description'] || 'Handmade, sustainable fashion from The Twisted Threads',
        image: data['image'],
        url: window.location.href,
        canonical: data['canonical'] || window.location.href,
      });
    });

    // Add global Organization / LocalBusiness JSON-LD
    const org = {
      name: 'The Twisted Threads',
      url: 'https://www.twistedthreads.example',
      logo: 'https://www.twistedthreads.example/assets/logo.png',
      sameAs: ['https://www.facebook.com/twistedthreads', 'https://instagram.com/twistedthreads']
    };
    this.seo.addJsonLd(organizationSchema(org));

    const local = {
      name: org.name,
      image: 'https://www.twistedthreads.example/assets/store-front.jpg',
      url: org.url,
      phone: '+92-300-1234567',
      street: '123 Fashion Ave',
      city: 'Karachi',
      region: 'Sindh',
      postalCode: '74200',
      country: 'PK',
      openingHours: [ { '@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], 'opens': '10:00', 'closes': '18:00' }]
    };
    this.seo.addJsonLd(localBusinessSchema(local));
  }
}
