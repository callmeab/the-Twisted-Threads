export type ReviewStatus = 'approved' | 'pending';

export type ReviewSortOption = 'recent' | 'highest' | 'lowest' | 'helpful';

export interface ReviewModel {
  reviewId: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  verified: boolean;
  helpful: number;
  status: ReviewStatus;
  createdAt: Date;
}

export interface ReviewStats {
  averageRating: number;
  totalCount: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, { count: number; percent: number }>;
}

export interface SubmitReviewData {
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
}
