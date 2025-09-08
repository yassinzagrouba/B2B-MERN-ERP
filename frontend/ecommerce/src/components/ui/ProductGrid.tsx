import { Product } from '../../types';
import ProductCard from './ProductCard';

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

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
