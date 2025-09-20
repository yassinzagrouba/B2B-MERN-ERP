import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, ShippingAddress, CartState } from '../types';

// Initialize cart and savedItems from localStorage if available
const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems')!)
  : [];

const savedItemsFromStorage = localStorage.getItem('savedItems')
  ? JSON.parse(localStorage.getItem('savedItems')!)
  : [];

// Calculate initial totals
const calcTotalItems = (items: CartItem[]) => 
  items.reduce((total, item) => total + item.quantity, 0);

const calcTotalAmount = (items: CartItem[]) => 
  items.reduce((total, item) => total + item.price * item.quantity, 0);

const initialState: CartState = {
  items: cartItemsFromStorage,
  savedItems: savedItemsFromStorage,
  totalItems: calcTotalItems(cartItemsFromStorage),
  totalAmount: calcTotalAmount(cartItemsFromStorage),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = {
        ...action.payload,
        // Ensure image path is properly handled
        image: action.payload.image ? 
          (action.payload.image.startsWith('http') ? 
            action.payload.image : 
            // Store the full path for backend-served images
            action.payload.image
          ) : 
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
      };
      
      const existItem = state.items.find((x) => x._id === item._id);

      if (existItem) {
        state.items = state.items.map((x) =>
          x._id === existItem._id ? item : x
        );
      } else {
        state.items.push(item);
      }

      // Update totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

      // Persist to localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((x) => x._id !== action.payload);

      // Update totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

      // Persist to localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    // Update item quantity
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existItem = state.items.find((x) => x._id === id);

      if (existItem) {
        state.items = state.items.map((x) =>
          x._id === id ? { ...x, quantity } : x
        );
      }

      // Update totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

      // Persist to localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    // Clear cart
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
      localStorage.removeItem('cartItems');
    },
    
    // Save item for later (move from cart to saved items)
    saveForLater: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const item = state.items.find((x) => x._id === itemId);
      
      if (item) {
        // Remove from cart
        state.items = state.items.filter((x) => x._id !== itemId);
        
        // Check if item already exists in saved items
        const existingInSaved = state.savedItems.find(x => x._id === itemId);
        
        // Add to saved items if not already there
        if (!existingInSaved) {
          state.savedItems.push(item);
        }
        
        // Update totals
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
        
        // Persist to localStorage
        localStorage.setItem('cartItems', JSON.stringify(state.items));
        localStorage.setItem('savedItems', JSON.stringify(state.savedItems));
      }
    },
    
    // Move item from saved to cart
    moveToCart: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const item = state.savedItems.find((x) => x._id === itemId);
      
      if (item) {
        // Remove from saved items
        state.savedItems = state.savedItems.filter((x) => x._id !== itemId);
        
        // Check if item already exists in cart
        const existingInCart = state.items.find(x => x._id === itemId);
        
        if (existingInCart) {
          // Update quantity if item already in cart
          state.items = state.items.map(x => 
            x._id === itemId ? { ...x, quantity: x.quantity + item.quantity } : x
          );
        } else {
          // Add to cart if not already there
          state.items.push(item);
        }
        
        // Update totals
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
        
        // Persist to localStorage
        localStorage.setItem('cartItems', JSON.stringify(state.items));
        localStorage.setItem('savedItems', JSON.stringify(state.savedItems));
      }
    },
    
    // Remove item from saved items
    removeSavedItem: (state, action: PayloadAction<string>) => {
      state.savedItems = state.savedItems.filter((x) => x._id !== action.payload);
      
      // Persist to localStorage
      localStorage.setItem('savedItems', JSON.stringify(state.savedItems));
    },
    
    // Clear saved items
    clearSavedItems: (state) => {
      state.savedItems = [];
      localStorage.removeItem('savedItems');
    }
  }
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  saveForLater,
  moveToCart,
  removeSavedItem,
  clearSavedItems,
} = cartSlice.actions;

export default cartSlice.reducer;
