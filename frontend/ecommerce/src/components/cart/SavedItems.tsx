import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { moveToCart, removeSavedItem } from '../../redux/cartSlice';
import { Button } from '../ui';
import { toastSuccess } from '../../utils/toast';

const SavedItems = () => {
  const { savedItems } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();

  // If there are no saved items, don't render this component
  if (savedItems.length === 0) {
    return null;
  }

  const handleMoveToCart = (id: string) => {
    dispatch(moveToCart(id));
    toastSuccess('Item moved to cart');
  };

  const handleRemove = (id: string) => {
    dispatch(removeSavedItem(id));
    toastSuccess('Item removed from saved items');
  };

  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-xl font-medium text-gray-900 mb-4">Saved for Later ({savedItems.length})</h2>
      
      <div className="space-y-5">
        {savedItems.map((item) => (
          <div key={item._id} className="flex flex-col sm:flex-row justify-between border-b pb-4">
            <div className="flex">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              <div className="ml-4 flex flex-col">
                <div>
                  <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="mt-auto text-sm font-medium text-gray-900">
                  ${item.price.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => handleMoveToCart(item._id)}
              >
                Move to Cart
              </Button>
              <Button 
                variant="link" 
                className="w-full sm:w-auto text-red-600 hover:text-red-800"
                onClick={() => handleRemove(item._id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedItems;
