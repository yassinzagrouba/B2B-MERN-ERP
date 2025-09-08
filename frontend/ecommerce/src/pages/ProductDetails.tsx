import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button, Alert, Breadcrumb, Badge } from '../components/ui';
import { ProductGallery, RelatedProducts, PersonalizedRecommendations } from '../components/product';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchProductDetails, clearProductDetails } from '../redux/productSlice';
import { addToCart } from '../redux/cartSlice';
import { toastSuccess } from '../utils/toast';
import { useTrackProductView } from '../hooks/useTrackProductView';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { product, loading, error } = useAppSelector((state) => state.products);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Track this product view for recommendations
  useTrackProductView(product || undefined);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
    }
    
    // Cleanup
    return () => {
      dispatch(clearProductDetails());
    };
  }, [id, dispatch]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(
        addToCart({
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        })
      );
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
      toastSuccess(`${product.name} added to your cart`);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value));
  };

  // Prepare breadcrumb items
  const breadcrumbItems = product
    ? [
        { name: 'Products', path: '/products' },
        { name: product.category, path: `/products?category=${product.category}` },
        { name: product.name, path: `/products/${product._id}` },
      ]
    : [{ name: 'Products', path: '/products' }];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <Alert variant="error">{error}</Alert>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ProductGallery 
                images={[product.image]} 
                altText={product.name} 
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              {/* Stock badge */}
              <div className="mb-4">
                {product.stock <= 0 && (
                  <Badge variant="danger">Out of Stock</Badge>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <Badge variant="warning">Low Stock: Only {product.stock} left</Badge>
                )}
                {product.stock > 5 && (
                  <Badge variant="success">In Stock</Badge>
                )}
                {product.featured && (
                  <Badge variant="info" className="ml-2">Featured Product</Badge>
                )}
              </div>

              {product.rating && (
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <svg
                        key={index}
                        className={`w-5 h-5 ${
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
                  <span className="ml-2 text-gray-600">
                    {product.rating} ({product.numReviews} reviews)
                  </span>
                </div>
              )}

              <p className="text-2xl font-bold text-gray-900 mb-4">
                ${product.price.toFixed(2)}
              </p>

              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-gray-800">{product.description}</p>
              </div>

              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Category
                    </p>
                    <p className="font-normal">{product.category}</p>
                  </div>
                  {product.brand && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Brand
                      </p>
                      <p className="font-normal">{product.brand}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Availability
                    </p>
                    <p className={`font-normal ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                    </p>
                  </div>
                </div>
              </div>

              {product.stock > 0 && (
                <>
                  <div className="flex items-center mb-6">
                    <label htmlFor="quantity" className="mr-3 text-gray-700">
                      Quantity:
                    </label>
                    <select
                      id="quantity"
                      className="border border-gray-300 rounded-md p-2"
                      value={quantity}
                      onChange={handleQuantityChange}
                    >
                      {[...Array(Math.min(product.stock, 10)).keys()].map(
                        (x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={handleAddToCart} variant="primary">
                      Add to Cart
                    </Button>
                    <Button
                      onClick={() => {
                        handleAddToCart();
                        navigate('/cart');
                      }}
                      variant="outline"
                    >
                      Buy Now
                    </Button>
                  </div>
                </>
              )}

              {addedToCart && (
                <div className="mt-4">
                  <Alert variant="success" dismissible onDismiss={() => setAddedToCart(false)}>
                    Product added to cart! You can continue shopping or
                    <Button 
                      variant="link"
                      className="underline ml-1 font-medium" 
                      onClick={() => navigate('/cart')}
                    >
                      view your cart
                    </Button>
                  </Alert>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Alert variant="warning">Product not found</Alert>
        )}
        
        {/* Display Related Products */}
        {!loading && !error && product && (
          <>
            <RelatedProducts 
              currentProductId={product._id} 
              category={product.category} 
              limit={4} 
            />
            
            <PersonalizedRecommendations 
              currentProductId={product._id}
              maxItems={4}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
