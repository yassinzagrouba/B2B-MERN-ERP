import api from './api';
import { LoginCredentials, SignupCredentials, User } from '../types';

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<User> => {
    const { data } = await api.post('/auth/login', credentials);
    
    // Store token and user info in localStorage
    localStorage.setItem('userToken', data.accessToken);
    
    // Create a user object from the response
    const user = {
      _id: data.user.id,
      name: data.user.username,
      email: data.user.email,
      isAdmin: data.user.role === 'admin',
      token: data.accessToken
    };
    
    localStorage.setItem('userInfo', JSON.stringify(user));
    
    return user;
  },
  
  // Register user
  register: async (credentials: SignupCredentials): Promise<User> => {
    // First register the user
    const { data: registerData } = await api.post('/auth/register', {
      username: credentials.name,
      email: credentials.email,
      password: credentials.password
    });
    
    // Then login to get the token
    return await authService.login({
      email: credentials.email,
      password: credentials.password
    });
  },
  
  // Logout user
  logout: (): void => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
  },
  
  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('userToken');
  },
};
