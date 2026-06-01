import { ReviewModel } from '../models/review.model';

const daysAgo = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

export const MOCK_REVIEWS: ReviewModel[] = [
  {
    reviewId: 'rev-1',
    productId: 'prod-1',
    customerName: 'Avery M.',
    customerEmail: 'avery@example.com',
    rating: 5,
    title: 'Absolutely stunning craftsmanship',
    comment:
      'Impeccable craftsmanship and beautiful finish. The wool is soft, the knit is even, and it fits true to size. I have received countless compliments wearing this cardigan.',
    images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=400'],
    verified: true,
    helpful: 24,
    status: 'approved',
    createdAt: daysAgo(12),
  },
  {
    reviewId: 'rev-2',
    productId: 'prod-1',
    customerName: 'Zara K.',
    customerEmail: 'zara@example.com',
    rating: 4,
    title: 'Premium feel, slightly roomy',
    comment:
      'Feels premium and fits wonderfully. Slightly larger than expected in the shoulders, but the drape is gorgeous. Would still highly recommend for cooler evenings.',
    images: [],
    verified: true,
    helpful: 11,
    status: 'approved',
    createdAt: daysAgo(21),
  },
  {
    reviewId: 'rev-3',
    productId: 'prod-1',
    customerName: 'James L.',
    customerEmail: 'james@example.com',
    rating: 5,
    title: 'Worth every penny',
    comment:
      'You can tell this was made with care. The buttons are solid, the stitching is flawless, and it keeps me warm without feeling bulky.',
    images: [],
    verified: false,
    helpful: 7,
    status: 'approved',
    createdAt: daysAgo(45),
  },
  {
    reviewId: 'rev-4',
    productId: 'prod-1',
    customerName: 'Priya S.',
    customerEmail: 'priya@example.com',
    rating: 3,
    title: 'Beautiful but slow shipping',
    comment:
      'The product itself is lovely — rich color and soft texture. Shipping took longer than expected, which is why I am giving three stars.',
    images: [],
    verified: true,
    helpful: 3,
    status: 'approved',
    createdAt: daysAgo(60),
  },
  {
    reviewId: 'rev-5',
    productId: 'prod-1',
    customerName: 'Elena R.',
    customerEmail: 'elena@example.com',
    rating: 5,
    title: 'My new favorite layer',
    comment:
      'Perfect weight for transitional weather. The cream color is exactly as pictured. Already planning to buy another for a gift.',
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=400'],
    verified: true,
    helpful: 18,
    status: 'approved',
    createdAt: daysAgo(8),
  },
  {
    reviewId: 'rev-6',
    productId: 'prod-2',
    customerName: 'Morgan T.',
    customerEmail: 'morgan@example.com',
    rating: 5,
    title: 'Elegant and timeless',
    comment:
      'This piece exceeded my expectations. The detailing is delicate yet durable — exactly what I wanted for a special occasion.',
    images: [],
    verified: true,
    helpful: 9,
    status: 'approved',
    createdAt: daysAgo(14),
  },
  {
    reviewId: 'rev-7',
    productId: 'prod-2',
    customerName: 'Hana Y.',
    customerEmail: 'hana@example.com',
    rating: 4,
    title: 'Lovely artisan quality',
    comment:
      'Beautiful work overall. Arrived well packaged. One minor thread needed trimming but otherwise perfect.',
    images: [],
    verified: false,
    helpful: 4,
    status: 'approved',
    createdAt: daysAgo(30),
  },
  {
    reviewId: 'rev-8',
    productId: 'prod-3',
    customerName: 'Oliver P.',
    customerEmail: 'oliver@example.com',
    rating: 5,
    title: 'Gift that wowed everyone',
    comment:
      'Bought this as a housewarming gift and the recipients were thrilled. The texture and color are even better in person.',
    images: [],
    verified: true,
    helpful: 15,
    status: 'approved',
    createdAt: daysAgo(5),
  },
];
