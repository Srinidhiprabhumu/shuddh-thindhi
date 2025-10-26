import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminRoute } from "@/components/AdminRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import MyOrders from "@/pages/MyOrders";
import About from "@/pages/About";

import AdminLogin from "@/pages/admin/Login";


import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import AdminOrders from "@/pages/admin/Orders";
import AdminReviews from "@/pages/admin/Reviews";
import AdminBanners from "@/pages/admin/Banners";
import AdminBrandContent from "@/pages/admin/BrandContent";
import AdminSubscribers from "@/pages/admin/Subscribers";
import AdminCoupons from "@/pages/admin/Coupons";
import AdminAnnouncements from "@/pages/admin/Announcements";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/products" component={Products} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/my-orders" component={MyOrders} />
      <Route path="/about" component={About} />

      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard">
        {() => <AdminRoute component={AdminDashboard} />}
      </Route>
      <Route path="/admin/products">
        {() => <AdminRoute component={AdminProducts} />}
      </Route>
      <Route path="/admin/orders">
        {() => <AdminRoute component={AdminOrders} />}
      </Route>
      <Route path="/admin/reviews">
        {() => <AdminRoute component={AdminReviews} />}
      </Route>
      <Route path="/admin/banners">
        {() => <AdminRoute component={AdminBanners} />}
      </Route>
      <Route path="/admin/brand-content">
        {() => <AdminRoute component={AdminBrandContent} />}
      </Route>
      <Route path="/admin/subscribers">
        {() => <AdminRoute component={AdminSubscribers} />}
      </Route>
      <Route path="/admin/coupons">
        {() => <AdminRoute component={AdminCoupons} />}
      </Route>
      <Route path="/admin/announcements">
        {() => <AdminRoute component={AdminAnnouncements} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
