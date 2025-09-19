import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { Toaster } from "react-hot-toast";

// CRUD Management Pages
import OrdersManagement from "./pages/OrdersManagement";
import ProductsManagement from "./pages/ProductsManagement";
import ClientsManagement from "./pages/ClientsManagement";
import CompaniesManagement from "./pages/CompaniesManagement";
import Notifications from "./pages/Notifications";
import ApiTester from "./components/debug/ApiTester";
import SeedNotificationsButton from "./components/debug/SeedNotificationsButton";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        {import.meta.env.DEV && <SeedNotificationsButton />}
        <Routes>
          {/* Dashboard Layout - Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />

            {/* Core Pages */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />

            {/* CRUD Management Pages */}
            <Route path="/orders" element={<OrdersManagement />} />
            <Route path="/products" element={<ProductsManagement />} />
            <Route path="/clients" element={<ClientsManagement />} />
            <Route path="/companies" element={<CompaniesManagement />} />
            <Route path="/notifications" element={<Notifications />} />
            
            {/* Debug Tools */}
            <Route path="/debug" element={<ApiTester />} />
          </Route>

          {/* Auth Layout - Public Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
