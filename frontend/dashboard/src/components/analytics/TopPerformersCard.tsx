import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';

interface TopProduct {
  productId: string;
  productName: string;
  productPrice: number;
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate: string;
}

interface TopClient {
  clientId: string;
  clientName: string;
  clientEmail: string;
  companyName: string;
  totalOrders: number;
  lastOrderDate: string;
}

export default function TopPerformersCard() {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'clients'>('products');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopPerformers = async () => {
      try {
        setLoading(true);
        const [productsResponse, clientsResponse] = await Promise.all([
          analyticsAPI.getTopProducts(5),
          analyticsAPI.getTopClients(5)
        ]);
        
        setTopProducts(productsResponse.data.data);
        setTopClients(clientsResponse.data.data);
      } catch (error: any) {
        console.error('Error fetching top performers:', error);
        console.error('Error details:', error.response?.data || error.message);
        // Set default data on error
        setTopProducts([]);
        setTopClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPerformers();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top Performers
        </h3>
        <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
          Best selling products and most active clients
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Top Products
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'clients'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Top Clients
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'products' && (
          <>
            {topProducts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No product data available
              </p>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        #{index + 1}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.productName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ${product.productPrice} per unit
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.totalOrders} orders
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ${product.totalRevenue.toFixed(2)} revenue
                    </p>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'clients' && (
          <>
            {topClients.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No client data available
              </p>
            ) : (
              topClients.map((client, index) => (
                <div key={client.clientId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        #{index + 1}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {client.clientName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {client.companyName || 'No company'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {client.clientEmail}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {client.totalOrders} orders
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last: {new Date(client.lastOrderDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
