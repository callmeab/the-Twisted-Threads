import { ProductModel } from './product.model';

export type SearchSuggestionType =
  | 'product'
  | 'category'
  | 'price-range'
  | 'recent'
  | 'popular'
  | 'view-all';

export interface SearchSuggestion {
  id: string;
  type: SearchSuggestionType;
  label: string;
  sublabel?: string;
  query: string;
  product?: ProductModel;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  imageUrl?: string;
}

export interface SearchAutocompleteResult {
  query: string;
  suggestions: SearchSuggestion[];
  productCount: number;
  isLoading: boolean;
}

export interface SearchPageResult {
  query: string;
  correctedQuery: string | null;
  products: ProductModel[];
  totalCount: number;
}
