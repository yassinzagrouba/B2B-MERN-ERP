// API Service for B2B ERP Backend
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration and auto-refresh
API.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshResponse = await axios.post('http://localhost:5000/api/auth/refresh', {}, {
          withCredentials: true
        });
        
        const { accessToken } = refreshResponse.data;
        localStorage.setItem('token', accessToken);
        
        // Update the failed request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        // Retry the original request
        return API(originalRequest);
      } catch (refreshError) {
        // Refresh failed, user needs to login again
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    API.post('/auth/login', credentials),
  
  register: (userData: { username: string; email: string; password: string; role?: string }) =>
    API.post('/auth/register-admin', userData),
  
  logout: () => API.post('/auth/logout'),
  
  getProfile: () => API.get('/auth/profile'),
};

// Users API
export const usersAPI = {
  getAll: () => API.get('/users'),
  getById: (id: string) => API.get(`/users/${id}`),
  create: (userData: any) => API.post('/users', userData),
  update: (id: string, userData: any) => API.put(`/users/${id}`, userData),
  delete: (id: string) => API.delete(`/users/${id}`),
};

// Companies API
export const companiesAPI = {
  getAll: () => API.get('/companies'),
  getById: (id: string) => API.get(`/companies/${id}`),
  create: (companyData: any) => API.post('/companies', companyData),
  update: (id: string, companyData: any) => API.put(`/companies/${id}`, companyData),
  delete: (id: string) => API.delete(`/companies/${id}`),
};

// Clients API
export const clientsAPI = {
  getAll: () => API.get('/clients'),
  getById: (id: string) => API.get(`/clients/${id}`),
  create: (clientData: any) => API.post('/clients', clientData),
  update: (id: string, clientData: any) => API.put(`/clients/${id}`, clientData),
  delete: (id: string) => API.delete(`/clients/${id}`),
};

// Products API
export const productsAPI = {
  getAll: () => API.get('/products'),
  getById: (id: string) => API.get(`/products/${id}`),
  create: (productData: any) => {
    // If productData is FormData, set correct content type header
    const headers = productData instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' } 
      : { 'Content-Type': 'application/json' };
    
    return API.post('/products', productData, { headers });
  },
  update: (id: string, productData: any) => {
    // If productData is FormData, set correct content type header
    const headers = productData instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' } 
      : { 'Content-Type': 'application/json' };
    
    return API.put(`/products/${id}`, productData, { headers });
  },
  delete: (id: string) => API.delete(`/products/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: () => API.get('/orders'),
  getById: (id: string) => API.get(`/orders/${id}`),
  create: (orderData: any) => API.post('/orders', orderData),
  update: (id: string, orderData: any) => API.put(`/orders/${id}`, orderData),
  delete: (id: string) => API.delete(`/orders/${id}`),
  updateStatus: (id: string, status: string) => API.patch(`/orders/${id}/status`, { status }),
};

// Analytics API
export const analyticsAPI = {
  // Sales Analytics
  getSalesReport: (period: 'day' | 'week' | 'month' | 'year') => 
    API.get(`/analytics/sales?period=${period}`),
  getRevenueReport: (startDate: string, endDate: string) => 
    API.get(`/analytics/revenue?start=${startDate}&end=${endDate}`),
  
  // Performance Metrics
  getTopProducts: (limit?: number) => API.get(`/analytics/top-products?limit=${limit || 10}`),
  getTopClients: (limit?: number) => API.get(`/analytics/top-clients?limit=${limit || 10}`),
  
  // Growth Analytics
  getGrowthMetrics: () => API.get('/analytics/growth'),
  getConversionRates: () => API.get('/analytics/conversion'),
  
  // Monthly Target Analytics
  getMonthlyTarget: () => API.get('/analytics/monthly-target'),
};

// Dashboard API - for getting statistics
export const dashboardAPI = {
  getStats: async () => {
    try {
      const [companies, clients, products, orders] = await Promise.all([
        companiesAPI.getAll(),
        clientsAPI.getAll(),
        productsAPI.getAll(),
        ordersAPI.getAll(),
      ]);

      // Handle backend response format: { success: true, data: [...], pagination: {...} }
      const companiesData = companies.data?.data || companies.data || [];
      const clientsData = clients.data?.data || clients.data || [];
      const productsData = products.data?.data || products.data || [];
      const ordersData = orders.data?.data || orders.data || [];

      return {
        totalUsers: 0, // Remove user count for now - requires admin access
        totalCompanies: Array.isArray(companiesData) ? companiesData.length : 0,
        totalClients: Array.isArray(clientsData) ? clientsData.length : 0,
        totalProducts: Array.isArray(productsData) ? productsData.length : 0,
        totalOrders: Array.isArray(ordersData) ? ordersData.length : 0,
        users: [], // Remove users data - requires admin access
        companies: Array.isArray(companiesData) ? companiesData : [],
        clients: Array.isArray(clientsData) ? clientsData : [],
        products: Array.isArray(productsData) ? productsData : [],
        orders: Array.isArray(ordersData) ? ordersData : [],
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalUsers: 0,
        totalCompanies: 0,
        totalClients: 0,
        totalProducts: 0,
        totalOrders: 0,
        users: [],
        companies: [],
        clients: [],
        products: [],
        orders: [],
      };
    }
  },
};

export default API;
