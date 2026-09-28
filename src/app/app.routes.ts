import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Customer Routes - Default Root Opening Page is Home Page (Eager for 0ms First Render)
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },

  // Major Pages - Lazy Loaded on Demand
  { 
    path: 'ethnics', 
    loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent),
    data: { department: 'ethnic' } 
  },
  { 
    path: 'ethnics/:category', 
    loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent),
    data: { department: 'ethnic' } 
  },
  { 
    path: 'jewellery', 
    loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent),
    data: { department: 'jewellery' } 
  },
  { 
    path: 'jewellery/:category', 
    loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent),
    data: { department: 'jewellery' } 
  },
  { path: 'shop/ethnics', redirectTo: 'ethnics', pathMatch: 'full' },
  { path: 'shop/jewellery', redirectTo: 'jewellery', pathMatch: 'full' },
  { path: 'shop', redirectTo: 'ethnics', pathMatch: 'full' },
  
  { 
    path: 'categories', 
    loadComponent: () => import('./pages/categories/category-discovery.component').then(m => m.CategoryDiscoveryComponent) 
  },
  { 
    path: 'product/:slug', 
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent) 
  },
  { 
    path: 'cart', 
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) 
  },
  { 
    path: 'wishlist', 
    loadComponent: () => import('./pages/wishlist/wishlist.component').then(m => m.WishlistComponent) 
  },
  { 
    path: 'checkout', 
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard] 
  },
  
  // Auth Routes - Lazy Loaded
  { 
    path: 'login', 
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'forgot-password', 
    loadComponent: () => import('./pages/auth/forgot-password.component').then(m => m.ForgotPasswordComponent) 
  },
  { 
    path: 'reset-password', 
    loadComponent: () => import('./pages/auth/reset-password.component').then(m => m.ResetPasswordComponent) 
  },
  { 
    path: 'account', 
    loadComponent: () => import('./pages/account/account.component').then(m => m.AccountComponent),
    canActivate: [authGuard] 
  },

  // Info Routes - Lazy Loaded
  { 
    path: 'about', 
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) 
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) 
  },

  // Admin Routes (Guarded - Lazy Loaded in completely separate admin chunk)
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent) 
      },
      { 
        path: 'products', 
        loadComponent: () => import('./admin/products/product-list.component').then(m => m.ProductListComponent) 
      },
      { 
        path: 'categories', 
        loadComponent: () => import('./admin/categories/category-list.component').then(m => m.CategoryListComponent) 
      },
      { 
        path: 'inventory', 
        loadComponent: () => import('./admin/inventory/inventory.component').then(m => m.InventoryComponent) 
      },
      { 
        path: 'orders', 
        loadComponent: () => import('./admin/orders/order-list.component').then(m => m.OrderListComponent) 
      }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
