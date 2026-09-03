import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WishlistProvider } from "./context/WishlistContext";

import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import VendorRoute from "./components/VendorRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import OrderSuccess from "./pages/OrderSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAddProduct from "./pages/AdminAddProduct";
import AdminOrders from "./pages/AdminOrders";
import AdminVendors from "./pages/AdminVendors";
import AdminUsers from "./pages/AdminUsers";
import AdminProducts from "./pages/AdminProducts";
import AdminCoupons from "./pages/AdminCoupons";
import AdminAnalytics from "./pages/AdminAnalytics";
import BecomeABaker from "./pages/BecomeABaker";
import VendorDashboard from "./pages/VendorDashboard";
import VendorOrders from "./pages/VendorOrders";
import VendorProducts from "./pages/VendorProducts";
import VendorAddProduct from "./pages/VendorAddProduct";
import VendorEditProduct from "./pages/VendorEditProduct";
import Products from "./pages/Products";
import Bakeries from "./pages/Bakeries";
import BakeryPage from "./pages/BakeryPage";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";

import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <WishlistProvider>
        <Navbar />

        <Routes>
          {/* Public Customer Marketplace Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/bakeries" element={<Bakeries />} />
          <Route path="/bakery/:id" element={<BakeryPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/become-a-baker" element={<BecomeABaker />} />

          {/* User Routes */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          {/* Vendor Routes */}
          <Route
            path="/vendor/dashboard"
            element={
              <VendorRoute>
                <VendorDashboard />
              </VendorRoute>
            }
          />
          <Route
            path="/vendor/orders"
            element={
              <VendorRoute>
                <VendorOrders />
              </VendorRoute>
            }
          />
          <Route
            path="/vendor/products"
            element={
              <VendorRoute>
                <VendorProducts />
              </VendorRoute>
            }
          />
          <Route
            path="/vendor/products/add"
            element={
              <VendorRoute>
                <VendorAddProduct />
              </VendorRoute>
            }
          />
          <Route
            path="/vendor/products/:id/edit"
            element={
              <VendorRoute>
                <VendorEditProduct />
              </VendorRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/add-product"
            element={
              <AdminRoute>
                <AdminAddProduct />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/vendors"
            element={
              <AdminRoute>
                <AdminVendors />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <AdminRoute>
                <AdminCoupons />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <AdminAnalytics />
              </AdminRoute>
            }
          />
        </Routes>
        <Footer />
      </WishlistProvider>
    </BrowserRouter>
  );
}

export default App;
