import { useState } from 'react';
import { Layout } from '../components/layout';
import { Button } from '../components/ui';
import { FeaturedProducts, RecentlyViewed, PersonalizedRecommendations } from '../components/product';
import { Hero, TestimonialsSection, Newsletter } from '../components/home';

export default function HomePage() {
  // State to track the selected category
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Handle category selection
  const handleCategorySelect = (category: string) => {
    // If already selected, deselect it
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };
  
  return (
    <Layout>
      {/* Hero Section */}
      <Hero />

      {/* Featured Products Section */}
      <FeaturedProducts 
        title={selectedCategory ? `${selectedCategory} Products` : "Featured Products"} 
        subtitle={selectedCategory ? `Browse our ${selectedCategory.toLowerCase()} collection` : "Check out our top picks for you"} 
        maxItems={8} 
        category={selectedCategory}
      />

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Categories</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {selectedCategory 
                ? `Currently browsing: ${selectedCategory}` 
                : 'Browse our curated collections'}
            </p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-4 text-indigo-600 hover:text-indigo-800 underline font-medium"
              >
                Clear filter
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Electronics', 'Clothing', 'Home & Garden', 'Sports'].map(
              (category) => (
                <div
                  key={category}
                  className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                    selectedCategory === category ? 'ring-2 ring-indigo-600' : ''
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="h-40 bg-gray-100 overflow-hidden">
                    <img
                      src={`/assets/categories/${category.toLowerCase()}.png`}
                      alt={category}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className={`font-medium text-lg ${
                      selectedCategory === category ? 'text-indigo-600' : 'text-gray-900'
                    }`}>
                      {category}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedCategory === category ? 'Selected' : 'Click to filter'}
                    </p>
                  </div>
                </div>
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
