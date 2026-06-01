export interface WishlistEntry {
  productId: string;
  addedAt: string;
}

export interface WishlistStorage {
  entries: WishlistEntry[];
}
