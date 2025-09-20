/**
 * Utility to enhance product data with UI-friendly defaults and images
 */

import { Product } from '../types';

// Collection of product image placeholders by category
const categoryImages: Record<string, string[]> = {
  'General': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f',
  ],
  'Electronics': [
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12',
    'https://images.unsplash.com/photo-1498049794561-7780e7231661',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
  ],
  'Office': [
    'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc',
    'https://images.unsplash.com/photo-1583396618422-597b2755de83',
    'https://images.unsplash.com/photo-1611791484670-ce19b801d192',
  ],
  'Clothing': [
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
    'https://images.unsplash.com/photo-1542272604-787c3835535d',
  ],
  'Food': [
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90',
    'https://images.unsplash.com/photo-1559742811-822873691df8',
    'https://images.unsplash.com/photo-1559181567-c3190ca9959b',
  ]
};

// Default category to use when no matching category is found
const defaultCategory = 'General';

/**
 * Enriches a product with realistic UI data like images if missing
 */
export const enrichProduct = (product: Product): Product => {
  // Make a copy of the product to avoid mutation
  const enrichedProduct = { ...product };

  // Ensure product has a string _id
  if (!enrichedProduct._id || typeof enrichedProduct._id !== 'string') {
    console.warn('Product missing valid ID:', enrichedProduct);
    enrichedProduct._id = String(enrichedProduct._id || Math.random().toString(36).substring(2, 15));
  }
  
  // Ensure clientid is properly formatted
  if (enrichedProduct.clientid) {
    try {
      if (typeof enrichedProduct.clientid === 'object') {
        // If it's an object, make sure it has the required fields
        const clientObj = enrichedProduct.clientid as any;
        
        // Check if the client object has an id property instead of _id (common backend API variance)
        const id = clientObj._id || clientObj.id || '';
        
        enrichedProduct.clientid = {
          _id: String(id),
          name: String(clientObj.name || 'Unknown Client'),
          email: String(clientObj.email || ''),
          company: String(clientObj.company || '')
        };
      } else {
        // If it's a string or anything else, convert to a proper client object
        enrichedProduct.clientid = {
          _id: String(enrichedProduct.clientid),
          name: 'Unknown Client',
          email: '',
          company: ''
        };
      }
    } catch (error) {
      // If there's any error processing the clientid, set it to null
      console.error('Error processing client data:', error);
      enrichedProduct.clientid = undefined;
    }
  }
  
  // Process image paths
  if (enrichedProduct.image) {
    // If it's a backend path, keep it as is
    if (enrichedProduct.image.startsWith('/uploads/') || enrichedProduct.image.startsWith('/images/')) {
      // Image path will be processed in the component
    }
    // If it's an external URL, keep it as is
    else if (enrichedProduct.image.startsWith('http')) {
      // No changes needed
    }
    // If it's something else, use a fallback
    else {
      const category = enrichedProduct.category || defaultCategory;
      const images = categoryImages[category] || categoryImages[defaultCategory];
      const hashCode = enrichedProduct._id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const imageIndex = Math.abs(hashCode) % images.length;
      enrichedProduct.image = `${images[imageIndex]}?w=400&h=400&fit=crop`;
    }
  }
  // Add image if missing
  else {
    const category = enrichedProduct.category || defaultCategory;
    const images = categoryImages[category] || categoryImages[defaultCategory];
    // Create a consistent image selection based on product ID to keep it consistent
    const hashCode = enrichedProduct._id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const imageIndex = Math.abs(hashCode) % images.length;
    enrichedProduct.image = `${images[imageIndex]}?w=400&h=400&fit=crop`;
  }
  
  // Add stock if missing
  if (!enrichedProduct.stock) {
    // Generate semi-random stock between 0-50 based on product ID
    const hashCode = enrichedProduct._id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    enrichedProduct.stock = Math.abs(hashCode % 51);
  }
  
  // Add rating if missing (1-5 stars)
  if (!enrichedProduct.rating) {
    const hashCode = enrichedProduct._id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    // Calculate a weighted rating that favors higher ratings
    const base = Math.abs(hashCode % 100);
    if (base < 5) enrichedProduct.rating = 1;
    else if (base < 15) enrichedProduct.rating = 2;
    else if (base < 35) enrichedProduct.rating = 3;
    else if (base < 75) enrichedProduct.rating = 4;
    else enrichedProduct.rating = 5;
  }
  
  // Add number of reviews if missing
  if (!enrichedProduct.numReviews) {
    const hashCode = enrichedProduct._id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    enrichedProduct.numReviews = Math.abs(hashCode % 100);
  }
  
  // Add a category if missing
  if (!enrichedProduct.category) {
    enrichedProduct.category = 'General';
  }
  
  return enrichedProduct;
};

/**
 * Enrich an array of products
 */
export const enrichProducts = (products: Product[]): Product[] => {
  return products.map(product => enrichProduct(product));
};
