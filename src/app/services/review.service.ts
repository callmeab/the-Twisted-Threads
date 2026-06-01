import { Injectable, inject, signal } from '@angular/core';
import {
  ReviewModel,
  ReviewSortOption,
  ReviewStats,
  SubmitReviewData,
} from '../models/review.model';
import { MOCK_REVIEWS } from '../data/reviews.mock.data';
import { OrderService } from './order.service';

const REVIEWS_STORAGE_KEY = 'twistedThreadsReviews';
const HELPFUL_VOTES_KEY = 'twistedThreadsReviewHelpfulVotes';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly orderService = inject(OrderService);
  private readonly reviewsSignal = signal<ReviewModel[]>(this.loadReviews());

  public readonly reviews = this.reviewsSignal.asReadonly();

  public getApprovedReviewsForProduct(productId: string): ReviewModel[] {
    return this.reviewsSignal()
      .filter(r => r.productId === productId && r.status === 'approved')
      .map(r => ({
        ...r,
        createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
      }));
  }

  public getReviewStats(productId: string): ReviewStats {
    const reviews = this.getApprovedReviewsForProduct(productId);
    const totalCount = reviews.length;

    const counts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[star]++;
    });

    const breakdown = {} as ReviewStats['breakdown'];
    ([1, 2, 3, 4, 5] as const).forEach(star => {
      breakdown[star] = {
        count: counts[star],
        percent: totalCount > 0 ? Math.round((counts[star] / totalCount) * 100) : 0,
      };
    });

    const averageRating =
      totalCount > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount) * 10) / 10
        : 0;

    return { averageRating, totalCount, breakdown };
  }

  public sortReviews(reviews: ReviewModel[], sort: ReviewSortOption): ReviewModel[] {
    const list = [...reviews];
    switch (sort) {
      case 'highest':
        return list.sort((a, b) => b.rating - a.rating || b.createdAt.getTime() - a.createdAt.getTime());
      case 'lowest':
        return list.sort((a, b) => a.rating - b.rating || b.createdAt.getTime() - a.createdAt.getTime());
      case 'helpful':
        return list.sort((a, b) => b.helpful - a.helpful || b.createdAt.getTime() - a.createdAt.getTime());
      case 'recent':
      default:
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  public filterByRating(reviews: ReviewModel[], rating: number | null): ReviewModel[] {
    if (!rating) {
      return reviews;
    }
    return reviews.filter(r => Math.round(r.rating) === rating);
  }

  public submitReview(data: SubmitReviewData): ReviewModel {
    const verified = this.hasCustomerPurchased(data.productId, data.customerEmail);
    const review: ReviewModel = {
      reviewId: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      productId: data.productId,
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      rating: data.rating,
      title: data.title.trim(),
      comment: data.comment.trim(),
      images: data.images,
      verified,
      helpful: 0,
      status: 'pending',
      createdAt: new Date(),
    };

    const updated = [review, ...this.reviewsSignal()];
    this.persistReviews(updated);
    return review;
  }

  public markHelpful(reviewId: string): boolean {
    if (this.hasVotedHelpful(reviewId)) {
      return false;
    }

    const updated = this.reviewsSignal().map(r =>
      r.reviewId === reviewId ? { ...r, helpful: r.helpful + 1 } : r
    );
    this.persistReviews(updated);
    this.recordHelpfulVote(reviewId);
    return true;
  }

  public hasVotedHelpful(reviewId: string): boolean {
    return this.getHelpfulVotes().includes(reviewId);
  }

  public hasCustomerPurchased(productId: string, email: string): boolean {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      return false;
    }

    return this.orderService.orders().some(order => {
      const orderEmail =
        order.customerInfo.email?.toLowerCase() ||
        order.shippingAddress.email?.toLowerCase() ||
        '';
      if (orderEmail !== normalized) {
        return false;
      }
      return order.items.some(item => item.product.id === productId);
    });
  }

  private loadReviews(): ReviewModel[] {
    try {
      const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (!raw) {
        this.persistReviews(MOCK_REVIEWS);
        return MOCK_REVIEWS.map(r => ({ ...r, createdAt: new Date(r.createdAt) }));
      }
      const parsed = JSON.parse(raw) as ReviewModel[];
      return parsed.map(r => ({
        ...r,
        createdAt: new Date(r.createdAt),
        images: r.images ?? [],
      }));
    } catch {
      return MOCK_REVIEWS.map(r => ({ ...r, createdAt: new Date(r.createdAt) }));
    }
  }

  private persistReviews(reviews: ReviewModel[]): void {
    this.reviewsSignal.set(reviews);
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      // ignore storage failures
    }
  }

  private getHelpfulVotes(): string[] {
    try {
      return JSON.parse(localStorage.getItem(HELPFUL_VOTES_KEY) || '[]') as string[];
    } catch {
      return [];
    }
  }

  private recordHelpfulVote(reviewId: string): void {
    const votes = [...this.getHelpfulVotes(), reviewId];
    try {
      localStorage.setItem(HELPFUL_VOTES_KEY, JSON.stringify(votes));
    } catch {
      // ignore
    }
  }
}
