import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { addToCart } from '../../redux/cartSlice';
import { Product } from '../../types';
import { Badge, Button } from '../ui';

interface ProductListItemProps {
  product: Product;
}

const ProductListItem = ({ product }: ProductListItemProps) => {
  const dispatch = useAppDispatch();

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

  return (
    <div className="flex flex-col sm:flex-row bg-white rounded-lg shadow-md overflow-hidden mb-4">
      <div className="sm:w-1/4 h-48 sm:h-auto">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </Link>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div>
          <div className="flex justify-between items-start">
            <Link to={`/products/${product._id}`}>
              <h3 className="text-lg font-medium text-gray-800 hover:text-indigo-600">
                {product.name}
              </h3>
            </Link>
            <p className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <div className="flex mt-1 mb-2">
            {/* Stock badges */}
            {product.stock <= 0 && <Badge variant="danger">Out of Stock</Badge>}
            {product.stock > 0 && product.stock <= 5 && (
              <Badge variant="warning">Low Stock: {product.stock} left</Badge>
            )}
            {product.featured && <Badge variant="info" className="ml-1">Featured</Badge>}
          </div>

          <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
          
          {product.brand && (
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-medium">Brand:</span> {product.brand}
            </p>
          )}
          
          {product.rating !== undefined && (
            <div className="flex items-center">
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
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-1 text-sm text-gray-500">
                ({product.numReviews || 0} reviews)
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          {product.stock > 0 ? (
            <>
              <Button onClick={handleAddToCart} variant="primary" className="sm:text-sm">
                Add to Cart
              </Button>
              <Link to={`/products/${product._id}`}>
                <Button variant="outline" className="sm:text-sm">View Details</Button>
              </Link>
            </>
          ) : (
            <Link to={`/products/${product._id}`}>
              <Button variant="primary" className="sm:text-sm">View Details</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListItem;
