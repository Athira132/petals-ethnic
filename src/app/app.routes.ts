import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ShopComponent } from './pages/shop/shop.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password.component';
import { AccountComponent } from './pages/account/account.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';

import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { ProductListComponent } from './admin/products/product-list.component';
import { CategoryListComponent } from './admin/categories/category-list.component';
import { InventoryComponent } from './admin/inventory/inventory.component';
import { OrderListComponent } from './admin/orders/order-list.component';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

import { CategoryDiscoveryComponent } from './pages/categories/category-discovery.component';

export const routes: Routes = [
  // Customer Routes - Default Root Opening Page is Home Page
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'ethnics', component: ShopComponent, data: { department: 'ethnic' } },
  { path: 'jewellery', component: ShopComponent, data: { department: 'jewellery' } },
  { path: 'shop/ethnics', redirectTo: 'ethnics', pathMatch: 'full' },
  { path: 'shop/jewellery', redirectTo: 'jewellery', pathMatch: 'full' },
  { path: 'shop', redirectTo: 'ethnics', pathMatch: 'full' },
  { path: 'categories', component: CategoryDiscoveryComponent },
  { path: 'product/:slug', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  
  // Auth Routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'account', component: AccountComponent, canActivate: [authGuard] },

  // Info Routes
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },

  // Admin Routes (Guarded)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'categories', component: CategoryListComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'orders', component: OrderListComponent }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
