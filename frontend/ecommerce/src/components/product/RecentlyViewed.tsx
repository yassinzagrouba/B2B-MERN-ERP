import { useState, useEffect } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { Product } from '../../types';
import ProductCard from '../ui/ProductCard';

interface RecentlyViewedProps {
  maxItems?: number;
}

const RecentlyViewed = ({ maxItems = 4 }: RecentlyViewedProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const { products: allProducts } = useAppSelector((state) => state.products);

  useEffect(() => {
    // Get recently viewed product IDs from localStorage
    const recentlyViewedIds = localStorage.getItem('recentlyViewed')
      ? JSON.parse(localStorage.getItem('recentlyViewed')!)
      : [];

    if (recentlyViewedIds.length === 0) {
      return;
    }

    // Match IDs with actual product data
    const recentProducts = recentlyViewedIds
      .map((id: string) => allProducts.find((p) => p._id === id))
      .filter((p: Product | undefined) => p !== undefined)
      .slice(0, maxItems);

    setProducts(recentProducts as Product[]);
  }, [allProducts, maxItems]);

  // Don't render if no recently viewed products
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
          <p className="text-gray-600 mt-2">Products you've checked out recently</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
