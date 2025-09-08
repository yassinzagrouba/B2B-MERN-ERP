import { useEffect, useState } from 'react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import ProductCard from '../ui/ProductCard';

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
  limit?: number;
}

const RelatedProducts = ({ currentProductId, category, limit = 4 }: RelatedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        // Fetch products in the same category
        const response = await productService.getProducts('', 1, category, 'newest');
        // Filter out the current product and limit the number of results
        const relatedProducts = response.products
          .filter(product => product._id !== currentProductId)
          .slice(0, limit);
          
        setProducts(relatedProducts);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch related products');
        setLoading(false);
      }
    };

    if (category) {
      fetchRelatedProducts();
    }
  }, [currentProductId, category, limit]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return null; // Don't show error to user, just don't display the section
  }

  if (products.length === 0) {
    return null; // Don't display the section if there are no related products
  }

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
