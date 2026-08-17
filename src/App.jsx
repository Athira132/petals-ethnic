import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Core Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Storefront Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import CategoryProducts from './pages/CategoryProducts';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';

// Customer Auth & Settings Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Account from './pages/Account';
import CheckoutPayment from './pages/CheckoutPayment';

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminUpiSettings from './pages/admin/AdminUpiSettings';
import AdminRazorpaySettings from './pages/admin/AdminRazorpaySettings';

// Route guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <Routes>
              
              {/* 1. Admin Dashboard Cluster (Sidebar Navigation layout, No Storefront Header/Footer) */}
              <Route path="/admin/*" element={
                <AdminRoute>
                  <Routes>
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="upi-settings" element={<AdminUpiSettings />} />
                    <Route path="razorpay-settings" element={<AdminRazorpaySettings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AdminRoute>
              } />

              {/* 2. Customer Storefront Cluster (Standard Navbar, Content, and Footer layout) */}
              <Route path="/*" element={
                <div className="app-layout">
                  <Navbar />
                  
                  <main className="main-viewport-content">
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="shop" element={<Shop />} />
                      <Route path="category/:slug" element={<CategoryProducts />} />
                      <Route path="product/:id" element={<ProductDetail />} />
                      <Route path="about" element={<About />} />
                      <Route path="contact" element={<Contact />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="checkout-payment" element={<CheckoutPayment />} />
                      <Route path="wishlist" element={<Wishlist />} />
                      <Route path="search" element={<SearchResults />} />
                      
                      {/* Auth routes */}
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
                      <Route path="forgot-password" element={<ForgotPassword />} />
                      <Route path="reset-password" element={<ResetPassword />} />
                      
                      {/* Customer Settings dashboard (Auth protected) */}
                      <Route path="account" element={
                        <ProtectedRoute>
                          <Account />
                        </ProtectedRoute>
                      } />
                      
                      {/* Catch-all */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>

                  <Footer />
                </div>
              } />

            </Routes>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
