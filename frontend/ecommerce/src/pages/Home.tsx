import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Button } from '../components/ui';
import { FeaturedProducts, RecentlyViewed, PersonalizedRecommendations } from '../components/product';
import { Hero, TestimonialsSection, Newsletter } from '../components/home';

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <Hero />

      {/* Featured Products Section */}
      <FeaturedProducts 
        title="Featured Products" 
        subtitle="Check out our top picks for you" 
        maxItems={8} 
      />

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Browse our curated collections organized by category
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Electronics', 'Clothing', 'Home & Garden', 'Sports'].map(
              (category) => (
                <Link
                  key={category}
                  to={`/products?category=${category.toLowerCase()}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="h-40 bg-gray-100 overflow-hidden">
                    <img
                      src={`/assets/categories/${category.toLowerCase()}.png`}
                      alt={category}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-medium text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {category}
                    </h3>
                    <Button 
                      variant="link" 
                      className="mt-2 text-sm inline-flex items-center"
                      onClick={(e) => e.preventDefault()}
                    >
                      Shop Now
                      <svg 
                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7" 
                        />
                      </svg>
                    </Button>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Recently Viewed Products */}
      <RecentlyViewed maxItems={4} />
      
      {/* Personalized Recommendations */}
      <PersonalizedRecommendations 
        title="Recommended For You" 
        subtitle="Products we think you'll love" 
        maxItems={4} 
      />

      {/* Newsletter Section */}
      <Newsletter />
    </Layout>
  );
}
