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
  images: string[]; // multiple images
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
  createdAt: Date;
}

// Backward compatibility alias for the codebase
export type Product = ProductModel;
