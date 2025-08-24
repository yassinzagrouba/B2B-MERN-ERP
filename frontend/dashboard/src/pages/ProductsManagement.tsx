import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Search, Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { productsAPI, clientsAPI } from "../services/api";
import ProductModal from "../components/modals/ProductModal";
import ConfirmModal from "../components/modals/ConfirmModal";

// Define the TypeScript interface
interface ProductData {
  _id: string;
  name: string;
  price: number;
  description: string;
  clientid?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ClientData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: {
    _id: string;
    name: string;
  };
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductData | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  useEffect(() => {
    fetchProducts();
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      // Backend returns { success: true, data: clients, pagination: {...} }
      const clientsData = response.data?.data || response.data;
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (err: any) {
      console.error('Failed to fetch clients:', err);
      setClients([]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      
      // Backend returns { success: true, data: products, pagination: {...} }
      const productsData = response.data?.data || response.data;
      setProducts(Array.isArray(productsData) ? productsData : []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: ProductData) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewProduct = (product: ProductData) => {
    setSelectedProduct(product);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product: ProductData) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await productsAPI.delete(productToDelete._id);
      setProducts(products.filter(product => product._id !== productToDelete._id));
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      if (modalMode === 'create') {
        await productsAPI.create(productData);
        await fetchProducts(); // Refresh to get updated data
      } else if (modalMode === 'edit' && selectedProduct) {
        await productsAPI.update(selectedProduct._id, productData);
        await fetchProducts(); // Refresh to get updated data
      }
      setIsModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.clientid?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          Products Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your product catalog, pricing and inventory
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleCreateProduct}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Product
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Description
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Client
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date Added
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProducts.length === 0 ? (
              <TableRow>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No products found matching your search.' : 'No products found.'}
                </td>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <Package className="h-5 w-5 text-green-600 dark:text-green-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white truncate max-w-xs">
                      {product.description || 'No description'}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    ${product.price?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {product.clientid?.name || 'No client'}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Product"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title="Edit Product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Product"
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

      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
          product={selectedProduct}
          clients={clients}
          mode={modalMode}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Product"
          message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
}
