import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { GlobalLoaderComponent } from './components/shared/global-loader/global-loader.component';
import { BottomNavComponent } from './components/shared/bottom-nav/bottom-nav.component';
import { LoaderService } from './services/loader.service';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, GlobalLoaderComponent, BottomNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('the-Twisted-Threads');

  private readonly router = inject(Router);
  private readonly loader = inject(LoaderService);

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
  }
}
