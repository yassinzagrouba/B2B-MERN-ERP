import { useState, useEffect } from "react";
import { X } from "lucide-react";

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

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: any) => Promise<void>;
  order?: OrderData | null;
  clients: Client[];
  products: Product[];
  mode: 'create' | 'edit' | 'view';
}

const statusOptions = [
  { value: 'en_attente', label: 'Pending' },
  { value: 'confirmee', label: 'Confirmed' },
  { value: 'en_preparation', label: 'Preparing' },
  { value: 'expediee', label: 'Shipped' },
  { value: 'livree', label: 'Delivered' },
  { value: 'annulee', label: 'Canceled' },
];

export default function OrderModal({
  isOpen,
  onClose,
  onSave,
  order,
  clients,
  products,
  mode
}: OrderModalProps) {
  const [formData, setFormData] = useState({
    clientid: '',
    productid: '',
    status: 'en_attente',
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && order) {
      setFormData({
        clientid: order.clientid._id,
        productid: order.productid._id,
        status: order.status,
        comment: order.comment || ''
      });
    } else if (mode === 'create') {
      setFormData({
        clientid: '',
        productid: '',
        status: 'en_attente',
        comment: ''
      });
    }
  }, [mode, order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;
    
    setLoading(true);
    setError(null);
    
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save order');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Create New Order' : mode === 'edit' ? 'Edit Order' : 'Order Details';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Client
            </label>
            <select
              name="clientid"
              value={formData.clientid}
              onChange={handleInputChange}
              required
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
            >
              <option value="">Select a client...</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product
            </label>
            <select
              name="productid"
              value={formData.productid}
              onChange={handleInputChange}
              required
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
            >
              <option value="">Select a product...</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name} - ${product.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comment
            </label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              rows={3}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              placeholder="Optional comment..."
            />
          </div>

          {/* Read-only fields for view/edit mode */}
          {order && (mode === 'view' || mode === 'edit') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Created
                  </label>
                  <input
                    type="text"
                    value={new Date(order.createdAt).toLocaleDateString()}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Updated
                  </label>
                  <input
                    type="text"
                    value={new Date(order.updatedAt).toLocaleDateString()}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-300"
                  />
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Order' : 'Update Order'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
