import { useAppSelector } from '../../redux/hooks';
import ProductCard from '../ui/ProductCard';
import { Product } from '../../types';

interface PersonalizedRecommendationsProps {
  currentProductId?: string;
  maxItems?: number;
  title?: string;
  subtitle?: string;
}

const PersonalizedRecommendations = ({ 
  currentProductId,
  maxItems = 4,
  title = "You Might Also Like",
  subtitle = "Recommendations based on your interests"
}: PersonalizedRecommendationsProps) => {
  const { user } = useAppSelector((state) => state.user);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { products } = useAppSelector((state) => state.products);
  
  // Simple recommendation logic based on cart items and browsing history
  const getRecommendations = (): Product[] => {
    if (products.length === 0) return [];
    
    // Categories of items in cart
    const cartCategories = cartItems.map(item => {
      const product = products.find(p => p._id === item._id);
      return product?.category || '';
    }).filter(Boolean);
    
    // Get unique categories
    const uniqueCategories = Array.from(new Set(cartCategories));
    
    // If we have categories, recommend products from those categories
    if (uniqueCategories.length > 0) {
      const recommendations = products.filter(product => 
        uniqueCategories.includes(product.category) && 
        product._id !== currentProductId &&
        !cartItems.some(item => item._id === product._id)
      ).slice(0, maxItems);
      
      if (recommendations.length >= maxItems) {
        return recommendations;
      }
      
      // If we don't have enough recommendations, add some random products
      const remainingCount = maxItems - recommendations.length;
      const randomProducts = products
        .filter(product => 
          !recommendations.some(rec => rec._id === product._id) && 
          product._id !== currentProductId &&
          !cartItems.some(item => item._id === product._id)
        )
        .sort(() => 0.5 - Math.random())
        .slice(0, remainingCount);
      
      return [...recommendations, ...randomProducts];
    }
    
    // If no cart items or categories, just return random products
    return products
      .filter(product => 
        product._id !== currentProductId && 
        !cartItems.some(item => item._id === product._id)
      )
      .sort(() => 0.5 - Math.random())
      .slice(0, maxItems);
  };
  
  const recommendedProducts = getRecommendations();
  
  // Don't render if no recommendations
  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-2">{subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonalizedRecommendations;
