import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchFeaturedProducts } from '../../redux/productSlice';
import ProductCard from '../ui/ProductCard';

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  maxItems?: number;
  category?: string | null;
}

const FeaturedProducts = ({
  title = 'Featured Products',
  subtitle = 'Check out our top picks for you',
  maxItems = 4,
  category = null
}: FeaturedProductsProps) => {
  const dispatch = useAppDispatch();
  const { featuredProducts, loading, error } = useAppSelector(
    (state) => state.products
  );
  
  // Get unique categories from products
  const categories = [...new Set(featuredProducts.map(product => product.category))].filter(Boolean);

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
            {featuredProducts
              .filter(product => 
                !category || 
                product.category?.toLowerCase() === category.toLowerCase() || 
                product.name?.toLowerCase().includes(category.toLowerCase())
              ).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts
                  .filter(product => 
                    !category || 
                    product.category?.toLowerCase() === category.toLowerCase() || 
                    product.name?.toLowerCase().includes(category.toLowerCase())
                  )
                  .slice(0, maxItems)
                  .map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No products found in this category. Try selecting another category.</p>
              </div>
            )}
            
            {/* Show product count by category */}
            {!category && categories.length > 0 && (
              <div className="mt-10 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Products by Category</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map(cat => {
                    if (!cat) return null;
                    const count = featuredProducts.filter(p => p.category === cat).length;
                    return (
                      <div key={cat} className="bg-white p-4 rounded shadow-sm">
                        <h4 className="font-medium text-indigo-600">{cat}</h4>
                        <p className="text-gray-700">{count} products</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
