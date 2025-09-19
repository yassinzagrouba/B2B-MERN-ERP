import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { Button, Badge } from '../ui';
import { useAppDispatch } from '../../redux/hooks';
import { addToCart } from '../../redux/cartSlice';
import { toastSuccess } from '../../utils/toast';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  
  if (!isOpen || !product) return null;
  
  // Get values safely
  const stockLevel = typeof product.stock === 'number' ? product.stock : 0;
  const productName = product.name || 'Unnamed Product';
  const productPrice = typeof product.price === 'number' ? product.price : 0;
  const productImage = product.image || '';
  const productDescription = product.description || 'No description available';
  const productRating = typeof product.rating === 'number' ? product.rating : 0;
  const productReviews = typeof product.numReviews === 'number' ? product.numReviews : 0;
  const isFeatured = !!product.featured;
  
  const handleAddToCart = () => {
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name || 'Product',
        image: product.image || '',
        price: typeof product.price === 'number' ? product.price : 0,
        quantity,
      })
    );
    
    toastSuccess(`${product.name || 'Product'} added to your cart`);
    onClose();
  };
  
  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="bg-white p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product image */}
              <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
                <img
                  src={productImage}
                  alt={productName}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              
              {/* Product info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{productName}</h2>
                
                <div className="mb-4">
                  {stockLevel <= 0 && <Badge variant="danger">Out of Stock</Badge>}
                  {stockLevel > 0 && stockLevel <= 5 && (
                    <Badge variant="warning">Low Stock: Only {stockLevel} left</Badge>
                  )}
                  {stockLevel > 5 && <Badge variant="success">In Stock</Badge>}
                  {isFeatured && <Badge variant="info" className="ml-2">Featured</Badge>}
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <svg
                        key={index}
                        className={`w-4 h-4 ${
                          index < Math.floor(productRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">
                    {productRating} ({productReviews} reviews)
                  </span>
                </div>
                
                <p className="text-xl font-bold text-gray-900 mb-4">
                  ${productPrice.toFixed(2)}
                </p>
                
                <p className="text-gray-600 mb-6 line-clamp-3">{productDescription}</p>
                
                {stockLevel > 0 ? (
                  <div>
                    <div className="flex items-center mb-4">
                      <label htmlFor="quick-quantity" className="mr-2 text-gray-700">
                        Quantity:
                      </label>
                      <select
                        id="quick-quantity"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="border border-gray-300 rounded-md p-1"
                      >
                        {[...Array(Math.min(stockLevel, 10)).keys()].map(
                          (x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <Button onClick={handleAddToCart} variant="primary" className="w-full sm:w-auto">
                        Add to Cart
                      </Button>
                      <Button onClick={handleViewDetails} variant="secondary" className="w-full sm:w-auto">
                        View Full Details
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={handleViewDetails} 
                    variant="primary"
                    className="w-full sm:w-auto"
                  >
                    View Full Details
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
