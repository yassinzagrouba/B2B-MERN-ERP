import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { addToCart } from '../../redux/cartSlice';
import { Product } from '../../types';
import Badge from './Badge';
import QuickViewModal from '../product/QuickViewModal';

interface ProductCardProps {
  product: Product;
}

// Fallback image if product image is missing
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop";

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Safely handle null/undefined product
  if (!product || typeof product !== 'object' || !product._id) {
    console.warn('Invalid product passed to ProductCard');
    return null;
  }

  const handleAddToCart = () => {
    try {
      dispatch(
        addToCart({
          _id: product._id,
          name: product.name || 'Product',
          image: product.image || FALLBACK_IMAGE,
          price: typeof product.price === 'number' ? product.price : 0,
          quantity: 1,
        })
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };
  
  // Get values safely
  const stockLevel = typeof product.stock === 'number' ? product.stock : 0;
  const isFeatured = !!product.featured;
  const productName = product.name || 'Unnamed Product';
  const productPrice = typeof product.price === 'number' ? product.price : 0;
  const productCategory = product.category || 'Uncategorized';
  
  const openQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsQuickViewOpen(true);
  };



  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
        <div className="h-48 overflow-hidden relative group">
          <img
            src={imageError ? 
              FALLBACK_IMAGE : 
              (product.image ? 
                (product.image.startsWith('http') ? 
                  product.image : 
                  `http://localhost:5000${product.image}`
                ) : 
                FALLBACK_IMAGE
              )
            }
            alt={productName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          
          {/* Stock badges */}
          <div className="absolute top-2 right-2">
            {stockLevel <= 0 && (
              <Badge variant="danger">Out of Stock</Badge>
            )}
            {stockLevel > 0 && stockLevel <= 5 && (
              <Badge variant="warning">Low Stock</Badge>
            )}
            {isFeatured && (
              <div className="mt-1">
                <Badge variant="info">Featured</Badge>
              </div>
            )}
            {productCategory && (
              <div className="mt-1">
                <Badge variant="success">{productCategory}</Badge>
              </div>
            )}
          </div>
          
          {/* Quick View Button - only shows on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={openQuickView}
              className="bg-white text-gray-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
            >
              Quick View
            </button>
          </div>
        </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2 truncate">
          {productName}
        </h3>
        
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-gray-700 font-bold">${productPrice.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{productCategory}</p>
          </div>
          {stockLevel > 0 && (
            <button
              onClick={handleAddToCart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Add to Cart
            </button>
          )}
        </div>
        
        <div className="flex items-center mt-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <svg
                key={index}
                className={`w-4 h-4 ${
                  index < Math.floor(typeof product.rating === 'number' ? product.rating : 0)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({typeof product.numReviews === 'number' ? product.numReviews : 0})
          </span>
        </div>
        
        {product.brand && (
          <p className="text-xs text-gray-500 mt-2">
            Brand: {String(product.brand)}
          </p>
        )}
      </div>
      </div>
      
      <QuickViewModal 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
}
