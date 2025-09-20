import api from './api';
import { Product } from '../types';
import { enrichProduct, enrichProducts } from '../utils/productEnricher';

export const productService = {
  // Get all products with optional filters
  getProducts: async (
    keyword: string = '',
    pageNumber: number = 1,
    category?: string,
    sortBy: string = 'newest'
  ): Promise<{ products: Product[]; pages: number; page: number }> => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (keyword) params.append('search', keyword);
      if (pageNumber) params.append('page', pageNumber.toString());
      // We'll handle category using search as backend might not have categories
      if (category) params.append('search', category);
      
      // Sort handling
      if (sortBy === 'newest') {
        params.append('sort', '-createdAt');
      } else if (sortBy === 'price-low-high') {
        params.append('sort', 'price');
      } else if (sortBy === 'price-high-low') {
        params.append('sort', '-price');
      }

      const { data } = await api.get(`/products?${params.toString()}`);
      
      // Map backend data structure to our frontend structure
      const rawProducts = data.data || [];
      const products = enrichProducts(rawProducts);
      
      return {
        products,
        pages: data.pagination?.totalPages || 1,
        page: data.pagination?.currentPage || pageNumber
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return empty data on error
      return { products: [], pages: 0, page: 1 };
    }
  },

  // Get a single product by ID
  getProductById: async (id: string): Promise<Product> => {
    try {
      const { data } = await api.get(`/products/${id}`);
      
      // Format the product to match frontend expectations
      const product = data.data;
      return enrichProduct(product);
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async (): Promise<Product[]> => {
    try {
      // Since backend might not have featured flag, we'll get the most recent products
      const { data } = await api.get('/products?limit=12');
      
      // Format the products to match frontend expectations
      let rawProducts = data.data || [];
      
      // Define our standard categories
      const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports'];
      
      // Create demo products for each category to ensure we have products in each
      const demoProducts = categories.flatMap(category => [
        {
          _id: `demo-${category.toLowerCase()}-1`,
          name: `${category} Product 1`,
          description: `This is a demo ${category} product.`,
          price: Math.floor(Math.random() * 100) + 20,
          category: category,
          stock: Math.floor(Math.random() * 50),
          image: `https://source.unsplash.com/random/400x400/?${category.toLowerCase().replace(/ & /g, ',')}`,
          rating: (Math.random() * 2) + 3, // 3-5 star rating
          numReviews: Math.floor(Math.random() * 100),
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: `demo-${category.toLowerCase()}-2`,
          name: `${category} Product 2`,
          description: `This is another demo ${category} product.`,
          price: Math.floor(Math.random() * 100) + 20,
          category: category,
          stock: Math.floor(Math.random() * 50),
          image: `https://source.unsplash.com/random/400x400/?${category.toLowerCase().replace(/ & /g, ',')}`,
          rating: (Math.random() * 2) + 3,
          numReviews: Math.floor(Math.random() * 100),
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
      
      // Combine real and demo products
      rawProducts = [...rawProducts, ...demoProducts];
      
      // Ensure each product has a category assigned from our standard categories
      rawProducts = rawProducts.map((product: any, index: number) => {
        if (!product.category) {
          // Assign a category if none exists
          product.category = categories[index % categories.length];
        }
        return {
          ...product,
          featured: true // Mark as featured since these are the ones we're showing
        };
      });
      
      const products = enrichProducts(rawProducts);
      
      return products;
    } catch (error) {
      console.log('Error getting featured products:', error);
      
      // Return demo products on error
      const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports'];
      const demoProducts = categories.flatMap(category => [
        {
          _id: `demo-${category.toLowerCase()}-1`,
          name: `${category} Product 1`,
          description: `This is a demo ${category} product.`,
          price: Math.floor(Math.random() * 100) + 20,
          category: category,
          stock: Math.floor(Math.random() * 50),
          image: `https://source.unsplash.com/random/400x400/?${category.toLowerCase().replace(/ & /g, ',')}`,
          rating: (Math.random() * 2) + 3,
          numReviews: Math.floor(Math.random() * 100),
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: `demo-${category.toLowerCase()}-2`,
          name: `${category} Product 2`,
          description: `This is another demo ${category} product.`,
          price: Math.floor(Math.random() * 100) + 20,
          category: category,
          stock: Math.floor(Math.random() * 50),
          image: `https://source.unsplash.com/random/400x400/?${category.toLowerCase().replace(/ & /g, ',')}`,
          rating: (Math.random() * 2) + 3,
          numReviews: Math.floor(Math.random() * 100),
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
      
      return enrichProducts(demoProducts);
    }
  },

  // Get product categories
  getCategories: async (): Promise<string[]> => {
    try {
      // Since backend might not have categories, we'll use client names as categories
      const { data } = await api.get('/products');
      
      // Extract client companies/names and use them as categories
      const products = data.data || [];
      const categories = new Set<string>();
      
      products.forEach((product: any) => {
        if (product.clientid && typeof product.clientid === 'object') {
          if (product.clientid.company) {
            categories.add(product.clientid.company);
          } else if (product.clientid.name) {
            categories.add(product.clientid.name);
          }
        }
      });
      
      // Add a default "All" category
      categories.add('All Products');
      
      return Array.from(categories);
    } catch (error) {
      console.log('Error getting categories:', error);
      return ['All Products'];
    }
  },

  // Get related products by client
  getRelatedProducts: async (productId: string, category: string): Promise<Product[]> => {
    try {
      // Get the product first to find its client
      const product = await productService.getProductById(productId);
      let clientId = '';
      
      // Extract clientId if available
      if (product.clientid) {
        try {
          if (typeof product.clientid === 'string') {
            clientId = product.clientid;
          } else if (typeof product.clientid === 'object') {
            // Check for both _id and id properties
            const clientObj = product.clientid as any;
            clientId = String(clientObj._id || clientObj.id || '');
          }
        } catch (error) {
          console.error('Error extracting client ID:', error);
          clientId = '';
        }
      }
      
      // If we have a clientId, get products from same client
      if (clientId) {
        const { data } = await api.get(`/products?clientid=${clientId}&limit=4`);
        const products = data.data || [];
        
        // Format products and filter out current product
        return enrichProducts(
          products
            .filter((p: any) => p._id !== productId)
            .slice(0, 4)
        );
      } else {
        // Fallback: get some recent products
        const { data } = await api.get(`/products?limit=4`);
        const products = data.data || [];
        
        return enrichProducts(
          products
            .filter((p: any) => p._id !== productId)
            .slice(0, 4)
        );
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
      return [];
    }
  }
};
