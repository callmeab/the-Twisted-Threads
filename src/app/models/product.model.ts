export interface ProductModel {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice: number; // for sale items
  discount: number;
  category: string;
  subCategory: string;
  images: string[]; // download URLs from Firebase Storage
  imageStoragePaths: string[]; // Firebase Storage paths for deletion
  mainImage: string;
  tags: string[];
  inStock: boolean;
  stockQuantity: number;
  materials: string[];
  sizes: string[]; // if applicable
  colors: string[]; // if applicable
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean; // ← controls visibility on the public website
  slug: string;      // ← SEO-friendly URL slug
  createdAt: Date;
  updatedAt?: Date;
}

// Backward compatibility alias for the codebase
export type Product = ProductModel;
