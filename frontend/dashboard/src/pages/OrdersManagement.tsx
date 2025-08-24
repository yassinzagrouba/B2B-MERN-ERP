import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import Badge from "../components/ui/badge/Badge";
import { ordersAPI, clientsAPI, productsAPI } from "../services/api";
import OrderModal from "../components/modals/OrderModal";
import ConfirmModal from "../components/modals/ConfirmModal";

// Define the TypeScript interfaces
interface OrderData {
  _id: string;
  clientid: {
    _id: string;
    name: string;
    email: string;
    company?: {
      name: string;
    };
  };
  productid: {
    _id: string;
    name: string;
    price: number;
    description: string;
  };
  status: 'en_attente' | 'confirmee' | 'en_preparation' | 'expediee' | 'livree' | 'annulee';
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

interface Client {
  _id: string;
  name: string;
  email: string;
  company?: {
    name: string;
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'livree': return 'success';
    case 'expediee': return 'info'; 
    case 'en_preparation': return 'warning';
    case 'confirmee': return 'info';
    case 'en_attente': return 'warning';
    case 'annulee': return 'error';
    default: return 'warning';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'livree': return 'Delivered';
    case 'expediee': return 'Shipped';
    case 'en_preparation': return 'Preparing';
    case 'confirmee': return 'Confirmed';
    case 'en_attente': return 'Pending';
    case 'annulee': return 'Canceled';
    default: return status;
  }
};

export default function OrdersManagement() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<OrderData | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, clientsResponse, productsResponse] = await Promise.all([
        ordersAPI.getAll(),
        clientsAPI.getAll(),
        productsAPI.getAll()
      ]);
      
      // Backend returns { success: true, data: [...], pagination: {...} }
      const ordersData = ordersResponse.data?.data || ordersResponse.data;
      const clientsData = clientsResponse.data?.data || clientsResponse.data;
      const productsData = productsResponse.data?.data || productsResponse.data;
      
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
      // Set empty arrays on error
      setOrders([]);
      setClients([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditOrder = (order: OrderData) => {
    setSelectedOrder(order);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewOrder = (order: OrderData) => {
    setSelectedOrder(order);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteOrder = (order: OrderData) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    
    try {
      await ordersAPI.delete(orderToDelete._id);
      setOrders(orders.filter(order => order._id !== orderToDelete._id));
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleSaveOrder = async (orderData: any) => {
    try {
      if (modalMode === 'create') {
        await ordersAPI.create(orderData);
        await fetchData(); // Refresh to get populated data
      } else if (modalMode === 'edit' && selectedOrder) {
        await ordersAPI.update(selectedOrder._id, orderData);
        await fetchData(); // Refresh to get populated data
      }
      setIsModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.clientid?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.productid?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded dark:bg-gray-700"></div>
          <div className="h-64 bg-gray-200 rounded dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 text-center py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Orders Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your orders, track status and handle customer requests
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleCreateOrder}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Product
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Client
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredOrders.length === 0 ? (
              <TableRow>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No orders found matching your search.' : 'No orders found.'}
                </td>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                            {order.productid?.name?.charAt(0) || 'P'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.productid?.name || 'Unknown Product'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-48">
                          {order.productid?.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.clientid?.name || 'Unknown Client'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {order.clientid?.email || 'No email'}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    ${order.productid?.price?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge color={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Order"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title="Edit Order"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Modal */}
      {isModalOpen && (
        <OrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveOrder}
          order={selectedOrder}
          clients={clients}
          products={products}
          mode={modalMode}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Order"
          message={`Are you sure you want to delete this order for ${orderToDelete?.clientid?.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
}
