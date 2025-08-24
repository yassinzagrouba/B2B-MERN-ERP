import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { ordersAPI } from "../../services/api";

// Define the TypeScript interface matching backend Order model
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

export default function RecentOrders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getAll();
        // Get recent 5 orders
        const recentOrders = response.data.slice(0, 5);
        setOrders(recentOrders);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
          <div className="text-red-500 text-center py-4">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Product
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Client
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Price
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.length === 0 ? (
              <TableRow>
                <TableCell className="py-8 text-center text-gray-500">
                  No recent orders found
                </TableCell>
                <TableCell className="py-8">&nbsp;</TableCell>
                <TableCell className="py-8">&nbsp;</TableCell>
                <TableCell className="py-8">&nbsp;</TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id} className="">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {order.productid?.name?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {order.productid?.name || 'Unknown Product'}
                        </p>
                        <p className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {order.productid?.description?.substring(0, 30) || 'No description'}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {order.clientid?.name || 'Unknown Client'}
                      </p>
                      <p className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {order.clientid?.email || 'No email'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    ${order.productid?.price?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge color={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
