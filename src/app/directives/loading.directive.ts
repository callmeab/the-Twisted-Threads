import {
  ComponentRef,
  Directive,
  TemplateRef,
  Type,
  ViewContainerRef,
  effect,
  inject,
  input,
} from '@angular/core';
import { ProductCardSkeletonComponent } from '../components/shared/skeletons/product-card-skeleton.component';
import { ProductDetailSkeletonComponent } from '../components/shared/skeletons/product-detail-skeleton.component';
import { CartSkeletonComponent } from '../components/shared/skeletons/cart-skeleton.component';

export type LoadingSkeletonType = 'product-card' | 'product-detail' | 'cart';

const SKELETON_COMPONENTS: Record<LoadingSkeletonType, Type<unknown>> = {
  'product-card': ProductCardSkeletonComponent,
  'product-detail': ProductDetailSkeletonComponent,
  cart: CartSkeletonComponent,
};

/**
 * Structural loading directive.
 *
 * @example
 * <ng-container *appLoading="isLoading(); skeleton: 'product-card'; count: 6">
 *   ...content when not loading
 * </ng-container>
 */
@Directive({
  selector: '[appLoading]',
  standalone: true,
})
export class LoadingDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);

  /** When true, shows skeleton instead of projected content. */
  public readonly appLoading = input(false);

  /** Skeleton layout to display while loading. */
  public readonly appLoadingSkeleton = input<LoadingSkeletonType | null>(null, { alias: 'skeleton' });

  /** Number of product cards or cart rows (product-card / cart only). */
  public readonly appLoadingCount = input(1, { alias: 'count' });

  /** Grid vs list layout for product-card skeleton. */
  public readonly appLoadingLayout = input<'grid' | 'list'>('grid', { alias: 'layout' });

  private skeletonRef: ComponentRef<unknown> | null = null;

  constructor() {
    effect(() => {
      this.render();
    });
  }

  private render(): void {
    this.vcr.clear();
    this.skeletonRef = null;

    if (this.appLoading()) {
      const skeletonType = this.appLoadingSkeleton();
      if (skeletonType) {
        const componentType = SKELETON_COMPONENTS[skeletonType];
        this.skeletonRef = this.vcr.createComponent(componentType);
        this.applySkeletonInputs();
      }
      return;
    }

    this.vcr.createEmbeddedView(this.templateRef);
  }

  private applySkeletonInputs(): void {
    const ref = this.skeletonRef;
    const type = this.appLoadingSkeleton();
    if (!ref) {
      return;
    }

    if (type === 'product-card') {
      const instance = ref.instance as ProductCardSkeletonComponent;
      ref.setInput('count', this.appLoadingCount());
      ref.setInput('layout', this.appLoadingLayout());
    } else if (type === 'cart') {
      ref.setInput('rowCount', this.appLoadingCount());
    }
  }
}
