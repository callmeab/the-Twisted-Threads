import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // ── Public routes ──────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'search',
    loadComponent: () => import('./components/search-results/search-results.component').then(m => m.SearchResultsComponent),
  },
  {
    path: 'products',
    loadComponent: () => import('./components/products/products.component').then(m => m.ProductsComponent),
  },
  {
    path: 'gallery',
    loadComponent: () => import('./components/gallery/gallery').then(m => m.Gallery),
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./components/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
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
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/contact/contact.component').then(m => m.ContactComponent),
  },
  {
    path: 'faq',
    loadComponent: () => import('./components/faq/faq.component').then(m => m.FaqComponent),
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./components/wishlist/wishlist.component').then(m => m.WishlistComponent),
  },

  // ── Admin routes ───────────────────────────────────────────────────────
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./components/admin/admin-login/admin-login').then(m => m.AdminLogin),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin/admin-layout/admin-layout').then(m => m.AdminLayout),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/admin/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./components/admin/admin-products/admin-products').then(m => m.AdminProducts),
      },
      {
        path: 'products/add',
        loadComponent: () =>
          import('./components/admin/admin-product-form/admin-product-form').then(m => m.AdminProductForm),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./components/admin/admin-product-form/admin-product-form').then(m => m.AdminProductForm),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./components/admin/admin-orders/admin-orders').then(m => m.AdminOrders),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./components/admin/admin-order-detail/admin-order-detail').then(m => m.AdminOrderDetail),
      },
    ],
  },

  {
    path: 'customer-care',
    redirectTo: 'customer-care/shipping',
    pathMatch: 'full'
  },
  {
    path: 'customer-care/:section',
    loadComponent: () => import('./components/customer-care/customer-care.component').then(m => m.CustomerCareComponent),
  },

  // ── Fallback ───────────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: '',
  },
];


