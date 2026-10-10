import { BrowserRouter, Route, Routes } from 'react-router-dom'

// Layouts
import CustomerLayout from '../layouts/CustomerLayout'
import AdminLayout from '../layouts/AdminLayout'

// Customer pages
import Home from '../pages/customer/Home'
import Shop from '../pages/customer/Shop'
import ProductDetails from '../pages/customer/ProductDetails'
import Cart from '../pages/customer/Cart'
import Checkout from '../pages/customer/Checkout'
import Login from '../pages/customer/Login'
import Register from '../pages/customer/Register'
import Profile from '../pages/customer/Profile'
import MyOrders from '../pages/customer/MyOrders'
import About from '../pages/customer/About'
import Faq from '../pages/customer/Faq'

// Admin pages
import Dashboard from '../pages/admin/Dashboard'
import Products from '../pages/admin/Products'
import AddProduct from '../pages/admin/AddProduct'
import Orders from '../pages/admin/Orders'
import Customers from '../pages/admin/Customers'
import Inventory from '../pages/admin/Inventory'
import Payments from '../pages/admin/Payments'
import Settings from '../pages/admin/Settings'
import ProtectedAdminRoute from './ProtectedAdminRoute'
import PresenceHeartbeat from '../components/PresenceHeartbeat'

function AppRoutes() {
  return (
    <BrowserRouter>
      <PresenceHeartbeat />
      <Routes>
        {/* ==================================================
            CUSTOMER STOREFRONT ROUTES
        ================================================== */}

        <Route
          path="/"
          element={<CustomerLayout />}
        >
          {/* Home */}
          <Route
            index
            element={<Home />}
          />

          {/* Shop */}
          <Route
            path="shop"
            element={<Shop />}
          />

          <Route
            path="about"
            element={<About />}
          />

          <Route
            path="faq"
            element={<Faq />}
          />

          {/* Product Details */}
          <Route
            path="product/:id"
            element={<ProductDetails />}
          />

          {/* Cart */}
          <Route
            path="cart"
            element={<Cart />}
          />

          {/* Checkout */}
          <Route
            path="checkout"
            element={<Checkout />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />

          <Route
            path="orders"
            element={<MyOrders />}
          />
        </Route>

        {/* ==================================================
            CUSTOMER AUTHENTICATION ROUTES
        ================================================== */}

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* ==================================================
            ADMIN ROUTES
        ================================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          {/* ------------------------------------------------
              Dashboard
          ------------------------------------------------ */}
          <Route
            index
            element={<Dashboard />}
          />

          {/* ------------------------------------------------
              Products
          ------------------------------------------------ */}
          <Route
            path="products"
            element={<Products />}
          />

          <Route
            path="products/add"
            element={<AddProduct />}
          />

          {/* ------------------------------------------------
              Orders
          ------------------------------------------------ */}
          <Route
            path="orders"
            element={<Orders />}
          />

          {/* ------------------------------------------------
              Customers
          ------------------------------------------------ */}
          <Route
            path="customers"
            element={<Customers />}
          />

          {/* ------------------------------------------------
              Inventory
          ------------------------------------------------ */}
          <Route
            path="inventory"
            element={<Inventory />}
          />

          {/* ------------------------------------------------
              Payments
          ------------------------------------------------ */}
          <Route
            path="payments"
            element={<Payments />}
          />

          {/* ------------------------------------------------
              Settings
          ------------------------------------------------ */}
          <Route
            path="settings"
            element={<Settings />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes