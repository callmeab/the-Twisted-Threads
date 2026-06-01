export interface MobileNavLink {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
  queryParams?: Record<string, string>;
}

export interface MegaMenuSubcategory {
  label: string;
  category: string;
  subCategory?: string;
}

export interface MegaMenuCategory {
  id: string;
  label: string;
  icon: string;
  subcategories: MegaMenuSubcategory[];
}

export const MOBILE_PRIMARY_LINKS: MobileNavLink[] = [
  { label: 'Home', route: '/', icon: 'home', exact: true },
  { label: 'Shop All', route: '/products', icon: 'storefront' },
  { label: 'About', route: '/about', icon: 'auto_awesome' },
  { label: 'Contact', route: '/contact', icon: 'mail_outline' },
  { label: 'FAQ', route: '/faq', icon: 'help_outline' },
  { label: 'Track Order', route: '/track-order', icon: 'local_shipping' },
];

export const MOBILE_MEGA_MENU: MegaMenuCategory[] = [
  {
    id: 'apparel',
    label: 'Apparel',
    icon: 'checkroom',
    subcategories: [
      { label: 'Cardigans', category: 'Apparel', subCategory: 'Cardigans' },
      { label: 'Coats', category: 'Apparel', subCategory: 'Coats' },
      { label: 'Sweaters', category: 'Apparel', subCategory: 'Sweaters' },
      { label: 'Loungewear', category: 'Apparel', subCategory: 'Loungewear' },
    ],
  },
  {
    id: 'home-decor',
    label: 'Home Decor',
    icon: 'home_work',
    subcategories: [
      { label: 'Throws', category: 'Home Decor', subCategory: 'Throws' },
      { label: 'Tapestries', category: 'Home Decor', subCategory: 'Tapestries' },
      { label: 'Blankets', category: 'Home Decor', subCategory: 'Blankets' },
      { label: 'Baskets', category: 'Home Decor', subCategory: 'Baskets' },
      { label: 'Tablecloths', category: 'Home Decor', subCategory: 'Tablecloths' },
      { label: 'Bedding', category: 'Home Decor', subCategory: 'Bedding' },
    ],
  },
  {
    id: 'accessories',
    label: 'Accessories',
    icon: 'watch',
    subcategories: [
      { label: 'Scarves', category: 'Accessories', subCategory: 'Scarves' },
      { label: 'Gift Sets', category: 'Accessories', subCategory: 'Sets' },
    ],
  },
  {
    id: 'jewelry',
    label: 'Jewelry',
    icon: 'diamond',
    subcategories: [
      { label: 'Rings', category: 'Jewelry', subCategory: 'Rings' },
      { label: 'Necklaces', category: 'Jewelry', subCategory: 'Necklaces' },
      { label: 'Bracelets', category: 'Jewelry', subCategory: 'Bracelets' },
      { label: 'Earrings', category: 'Jewelry', subCategory: 'Earrings' },
    ],
  },
];

export interface BottomNavItem {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
  action?: 'search' | 'categories';
}

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { label: 'Home', route: '/', icon: 'home', exact: true },
  { label: 'Categories', route: '/products', icon: 'category', action: 'categories' },
  { label: 'Search', route: '/search', icon: 'search', action: 'search' },
  { label: 'Cart', route: '/cart', icon: 'shopping_bag' },
  { label: 'Account', route: '/track-order', icon: 'person_outline' },
];
