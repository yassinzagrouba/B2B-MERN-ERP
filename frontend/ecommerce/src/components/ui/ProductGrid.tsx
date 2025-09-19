import { Product } from '../../types';
import ProductCard from './ProductCard';
import { useEffect, useState } from 'react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  className?: string;
}

const ProductGrid = ({
  products,
  loading = false,
  error = null,
  emptyMessage = 'No products found',
  className = '',
}: ProductGridProps) => {
  const [safeProducts, setSafeProducts] = useState<Product[]>([]);
  
  // Process products safely
  useEffect(() => {
    try {
      // Verify each product has required fields and valid structure
      const validProducts = (Array.isArray(products) ? products : [])
        .filter(product => {
          if (!product || typeof product !== 'object') return false;
          if (!product._id) return false;
          return true;
        })
        .map(product => {
          // Create a safe copy with all required fields
          return {
            _id: String(product._id),
            name: String(product.name || 'Unnamed Product'),
            description: String(product.description || 'No description available'),
            price: typeof product.price === 'number' ? product.price : 0,
            image: product.image || '',
            createdAt: product.createdAt || new Date().toISOString(),
            updatedAt: product.updatedAt || new Date().toISOString(),
          };
        });
      
      console.log('Valid products for rendering:', validProducts.length);
      setSafeProducts(validProducts);
    } catch (err) {
      console.error('Error preparing products for display:', err);
      setSafeProducts([]);
    }
  }, [products]);
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded text-center">
        {emptyMessage}
      </div>
    );
  }

  // Simple error display component
  const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="col-span-full text-center py-10">
      <p className="text-red-500">{message}</p>
    </div>
  );

  // Safe rendering function
  const renderSafeProducts = () => {
    try {
      if (!Array.isArray(safeProducts) || safeProducts.length === 0) {
        return <ErrorDisplay message="No products available" />;
      }

      return safeProducts.map(product => (
        <ProductCard 
          key={String(product._id)} 
          product={product} 
        />
      ));
    } catch (error) {
      console.error('Error rendering product grid:', error);
      return <ErrorDisplay message="Error displaying products" />;
    }
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {renderSafeProducts()}
    </div>
  );
};

export default ProductGrid;
