import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../services/review.service';
import { ReviewModel, ReviewSortOption } from '../../models/review.model';
import { StarRatingComponent } from '../shared/star-rating/star-rating.component';
import { AddReviewFormComponent } from './add-review-form.component';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, StarRatingComponent, AddReviewFormComponent],
  templateUrl: './product-reviews.component.html',
  styleUrl: './product-reviews.component.scss',
})
export class ProductReviewsComponent {
  public readonly productId = input.required<string>();

  private readonly reviewService = inject(ReviewService);

  protected readonly ratingFilter = signal<number | null>(null);
  protected readonly sortBy = signal<ReviewSortOption>('recent');
  protected readonly lightboxImage = signal<string | null>(null);
  protected readonly refreshTick = signal(0);

  protected readonly stats = computed(() => {
    this.refreshTick();
    return this.reviewService.getReviewStats(this.productId());
  });

  protected readonly displayedReviews = computed(() => {
    this.refreshTick();
    let list = this.reviewService.getApprovedReviewsForProduct(this.productId());
    list = this.reviewService.filterByRating(list, this.ratingFilter());
    return this.reviewService.sortReviews(list, this.sortBy());
  });

  protected readonly breakdownStars = [5, 4, 3, 2, 1] as const;

  protected setRatingFilter(star: number | null): void {
    this.ratingFilter.set(this.ratingFilter() === star ? null : star);
  }

  protected onSortChange(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value as ReviewSortOption);
  }

  protected markHelpful(review: ReviewModel): void {
    const added = this.reviewService.markHelpful(review.reviewId);
    if (added) {
      this.refreshTick.update(n => n + 1);
    }
  }

  protected hasVotedHelpful(reviewId: string): boolean {
    return this.reviewService.hasVotedHelpful(reviewId);
  }

  protected openLightbox(url: string): void {
    this.lightboxImage.set(url);
  }

  protected closeLightbox(): void {
    this.lightboxImage.set(null);
  }

  protected onReviewSubmitted(): void {
    this.refreshTick.update(n => n + 1);
  }

  protected formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  protected roundedAverage(): number {
    return Math.round(this.stats().averageRating);
  }
}
