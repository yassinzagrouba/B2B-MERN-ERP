import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { orderService } from '../services/orderService';
import { useAppSelector } from '../redux/hooks';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { toastError } from '../utils/toast';
import { formatImagePath } from '../utils/imageUtils';
import { Order, CartItem } from '../types';

export default function UserOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAppSelector(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user orders when component mounts
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const userOrders = await orderService.getUserOrders();
        setOrders(userOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        toastError('Failed to load your orders. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Format date to a more readable format
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Orders</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">No Orders Found</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Shop Now
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white shadow overflow-hidden rounded-lg">
                <div className="bg-gray-50 px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex flex-wrap justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Order #{order._id?.substring(0, 8)}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <p className="text-sm font-medium text-gray-900">
                        Total: ${order.totalPrice?.toFixed(2)}
                      </p>
                      <p className="mt-1 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${order.isDelivered ? 'bg-green-100 text-green-800' : 
                          order.isPaid ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'}
                        `}>
                          {order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <ul className="divide-y divide-gray-200">
                  {order.orderItems.map((item: CartItem) => (
                    <li key={item._id} className="p-4 flex items-center">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={formatImagePath(item.image)} 
                          alt={item.name}
                          className="w-full h-full object-center object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop';
                          }} 
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-700">
                      Payment Status: 
                      <span className={`ml-2 font-medium 
                        ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/`)}
                    >
                      Shop Again
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}