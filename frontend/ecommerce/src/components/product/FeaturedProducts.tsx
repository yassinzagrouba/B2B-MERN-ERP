import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchFeaturedProducts } from '../../redux/productSlice';
import ProductCard from '../ui/ProductCard';

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  maxItems?: number;
}

const FeaturedProducts = ({
  title = 'Featured Products',
  subtitle = 'Check out our top picks for you',
  maxItems = 4
}: FeaturedProductsProps) => {
  const dispatch = useAppDispatch();
  const { featuredProducts, loading, error } = useAppSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-800 p-4 rounded">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, maxItems).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/products"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-md inline-block font-medium"
              >
                View All Products
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
