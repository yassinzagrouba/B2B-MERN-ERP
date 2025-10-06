import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppDispatch } from './redux/hooks';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Login from './pages/Login';
import SimpleLogin from './pages/SimpleLogin';
import BasicLogin from './pages/BasicLogin';
import ResetPassword from './pages/ResetPassword';
import Signup from './pages/Signup';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import NotFound from './pages/NotFound';
import SearchResults from './pages/SearchResults';
import ProductDetails from './pages/ProductDetails';
import TestProduct from './pages/TestProduct';
import UserOrders from './pages/UserOrders';
import AccountOrders from './pages/AccountOrders';
import PrivateRoute from './components/routing/PrivateRoute';
import { setUser } from './redux/userSlice';
import { authService } from './services/authService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if user is already logged in
    const user = authService.getCurrentUser();
    if (user) {
      dispatch(setUser(user));
    }
  }, [dispatch]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<BasicLogin />} />
        <Route path="/basic-login" element={<BasicLogin />} />
        <Route path="/simple-login" element={<SimpleLogin />} />
        <Route path="/original-login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/products" element={<SearchResults />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/test-product" element={<TestProduct />} />
        <Route 
          path="/checkout" 
          element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/checkout/success" 
          element={
            <PrivateRoute>
              <CheckoutSuccess />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/checkout/cancel" 
          element={
            <PrivateRoute>
              <CheckoutCancel />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/account/orders" 
          element={
            <PrivateRoute>
              <AccountOrders />
            </PrivateRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
