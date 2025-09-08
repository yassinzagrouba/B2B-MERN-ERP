import api from './api';
import { Order, ShippingAddress } from '../types';

export const orderService = {
  // Create a new order
  createOrder: async (order: {
    orderItems: { _id: string; quantity: number }[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
  }): Promise<{ _id: string }> => {
    try {
      // Format the order data to match the backend's expected structure
      const formattedOrder = {
        ...order,
        // Transform order items to match backend format if needed
        orderItems: order.orderItems.map(item => ({
          product: item._id,
          quantity: item.quantity
        }))
      };
      
      const { data } = await api.post('/orders', formattedOrder);
      return { _id: data._id || data.id };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  // Get order by ID
  getOrderById: async (id: string): Promise<Order> => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },
  
  // Get user's orders
  getUserOrders: async (): Promise<Order[]> => {
    try {
      // Try the myorders endpoint first
      try {
        const { data } = await api.get('/orders/myorders');
        return data;
      } catch (endpointError) {
        // Fallback to getting all orders if myorders endpoint doesn't exist
        // This assumes the backend will filter orders by the authenticated user
        console.log('Falling back to main orders endpoint');
        const { data } = await api.get('/orders');
        return Array.isArray(data) ? data : data.orders || [];
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },
  
  // Track order status
  trackOrder: async (orderId: string): Promise<{ status: string; updatedAt: string }> => {
    try {
      const { data } = await api.get(`/orders/${orderId}/track`);
      return data;
    } catch (error) {
      console.error('Error tracking order:', error);
      // Return a default status if endpoint not available
      return { 
        status: 'Processing', 
        updatedAt: new Date().toISOString() 
      };
    }
  }
};
