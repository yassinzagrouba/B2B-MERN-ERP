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

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: 1,
      })
    );
  };
  
  const openQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
        <Link to={`/products/${product._id}`}>
        <div className="h-48 overflow-hidden relative group">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          
          {/* Stock badges */}
          <div className="absolute top-2 right-2">
            {product.stock <= 0 && (
              <Badge variant="danger">Out of Stock</Badge>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <Badge variant="warning">Low Stock</Badge>
            )}
            {product.featured && (
              <div className="mt-1">
                <Badge variant="info">Featured</Badge>
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
      </Link>
      
      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-lg font-medium text-gray-800 mb-2 hover:text-indigo-600 truncate">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex justify-between items-center mb-3">
          <p className="text-gray-700 font-bold">${product.price.toFixed(2)}</p>
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Add to Cart
            </button>
          )}
        </div>
        
        {product.rating !== undefined && (
          <div className="flex items-center mt-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, index) => (
                <svg
                  key={index}
                  className={`w-4 h-4 ${
                    index < Math.floor(product.rating || 0)
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
              ({product.numReviews || 0})
            </span>
          </div>
        )}
        
        {product.brand && (
          <p className="text-xs text-gray-500 mt-2">
            Brand: {product.brand}
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
