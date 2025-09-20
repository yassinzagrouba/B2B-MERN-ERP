import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { SavedItems } from '../components/cart';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { removeFromCart, updateCartItemQuantity, clearCart, saveForLater } from '../redux/cartSlice';
import { CartItem } from '../types';
import { toastSuccess, toastInfo } from '../utils/toast';

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: cartItems, totalAmount } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.user);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRemoveItem = (itemId: string, productName: string) => {
    dispatch(removeFromCart(itemId));
    toastInfo(`${productName} removed from cart`);
  };

  const handleSaveForLater = (itemId: string, productName: string) => {
    dispatch(saveForLater(itemId));
    toastSuccess(`${productName} saved for later`);
  };

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    dispatch(updateCartItemQuantity({ id: item._id, quantity: newQuantity }));
    toastInfo(`${item.name} quantity updated`);
  };

  const handleCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
      toastInfo('Please login to proceed to checkout');
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
      toastInfo('Your cart has been cleared');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h2>
            <p className="mt-1 text-sm text-gray-500">
              Looks like you haven't added anything to your cart yet.
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate('/products')} variant="primary">
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="border-t border-b border-gray-200 py-2 flex justify-between items-center mb-4 hidden md:flex">
                  <p className="text-sm font-medium text-gray-500 w-2/5">Product</p>
                  <p className="text-sm font-medium text-gray-500 w-1/5 text-center">Price</p>
                  <p className="text-sm font-medium text-gray-500 w-1/5 text-center">Quantity</p>
                  <p className="text-sm font-medium text-gray-500 w-1/5 text-center">Subtotal</p>
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="border-b border-gray-200 py-4 flex flex-col md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center w-full md:w-2/5">
                      <img
                        src={item.image ? 
                          (item.image.startsWith('http') ? 
                            item.image : 
                            `http://localhost:5000${item.image}`
                          ) : 
                          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
                        }
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="ml-4 flex-1">
                        <Link
                          to={`/products/${item._id}`}
                          className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(item._id, item.name)}
                          className="text-sm text-red-600 hover:text-red-800 mt-1 flex items-center"
                        >
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                        <button
                          onClick={() => handleSaveForLater(item._id, item.name)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 mt-1 flex items-center ml-4"
                        >
                          <svg 
                            className="h-4 w-4 mr-1"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Save for later
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 md:mt-0 md:w-3/5">
                      <div className="md:w-1/3 flex md:justify-center">
                        <span className="md:hidden text-sm font-medium text-gray-500 mr-2">
                          Price:
                        </span>
                        <span className="text-gray-900">${item.price.toFixed(2)}</span>
                      </div>

                      <div className="md:w-1/3 flex md:justify-center">
                        <span className="md:hidden text-sm font-medium text-gray-500 mr-2">
                          Quantity:
                        </span>
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item, parseInt(e.target.value))
                          }
                          className="border border-gray-300 rounded-md p-1"
                        >
                          {[...Array(10).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:w-1/3 flex md:justify-center">
                        <span className="md:hidden text-sm font-medium text-gray-500 mr-2">
                          Subtotal:
                        </span>
                        <span className="font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between mt-6">
                  <Button
                    onClick={() => navigate('/products')}
                    variant="outline"
                    className="text-sm"
                  >
                    Continue Shopping
                  </Button>
                  <Button onClick={handleClearCart} variant="danger" className="text-sm">
                    Clear Cart
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <p className="text-gray-600">Subtotal</p>
                      <p className="font-medium">${totalAmount.toFixed(2)}</p>
                    </div>

                    <div className="flex justify-between">
                      <p className="text-gray-600">Shipping</p>
                      <p className="font-medium">Calculated at checkout</p>
                    </div>

                    <div className="flex justify-between">
                      <p className="text-gray-600">Tax</p>
                      <p className="font-medium">Calculated at checkout</p>
                    </div>

                    <div className="border-t pt-4 flex justify-between">
                      <p className="text-lg font-medium text-gray-900">Estimated Total</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button onClick={handleCheckout} variant="primary" className="w-full">
                      Proceed to Checkout
                    </Button>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    <p>
                      We accept:{' '}
                      <span className="font-medium text-gray-700">
                        Credit Card, PayPal, Apple Pay
                      </span>
                    </p>
                    <p className="mt-1">
                      Need help? <a href="#" className="text-indigo-600 hover:text-indigo-800">Contact Support</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Saved Items Component */}
            <SavedItems />
          </>
        )}
      </div>
    </Layout>
  );
}
