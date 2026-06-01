import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminAuthGuard } from './guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    data: { title: 'Home — The Twisted Threads', description: 'Discover handmade, sustainable fashion and curated collections at The Twisted Threads.' }
  },
  {
    path: 'search',
    loadComponent: () => import('./components/search-results/search-results.component').then(m => m.SearchResultsComponent),
  },
  {
    path: 'products',
    loadComponent: () => import('./components/products/products.component').then(m => m.ProductsComponent),
    data: { title: 'Products — The Twisted Threads', description: 'Browse our full collection of handcrafted fashion and sustainable garments.' }
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./components/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    // Product page will update metadata at runtime with product-specific data
    data: { title: 'Product — The Twisted Threads', description: 'Product details and specifications.' }
  },
  {
    path: 'cart',
    loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard],
  },
  {
    path: 'order-confirmation',
    loadComponent: () => import('./components/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
  },
  {
    path: 'track-order',
    loadComponent: () => import('./components/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent),
    data: { title: 'About Us — The Twisted Threads', description: 'Learn about our story, craftsmanship, and commitment to sustainability.' }
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/contact/contact.component').then(m => m.ContactComponent),
    data: { title: 'Contact — The Twisted Threads', description: 'Contact our concierge team for orders, custom pieces, or enquiries.' }
  },
  {
    path: 'faq',
    loadComponent: () => import('./components/faq/faq.component').then(m => m.FaqComponent),
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./components/wishlist/wishlist.component').then(m => m.WishlistComponent),
  },
  {
    path: 'server-error',
    loadComponent: () => import('./components/server-error/server-error.component').then(m => m.ServerErrorComponent),
  },
  {
    path: 'not-found',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
  {
    path: 'admin',
    children: [
      { path: 'login', loadComponent: () => import('./components/admin/login.component').then(m => m.AdminLoginComponent) },
      { path: '', loadComponent: () => import('./components/admin/dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [adminAuthGuard] },
      { path: 'orders', loadComponent: () => import('./components/admin/orders.component').then(m => m.AdminOrdersComponent), canActivate: [adminAuthGuard] },
      { path: 'orders/:id', loadComponent: () => import('./components/admin/order-detail.component').then(m => m.AdminOrderDetailComponent), canActivate: [adminAuthGuard] },
    ]
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];

