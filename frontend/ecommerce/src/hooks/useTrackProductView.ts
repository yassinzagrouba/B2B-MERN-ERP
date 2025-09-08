import { useEffect } from 'react';
import { Product } from '../types';

// Define the maximum number of products to store in history
const MAX_HISTORY_ITEMS = 10;

/**
 * Utility to track recently viewed products
 */
export const useTrackProductView = (product?: Product) => {
  useEffect(() => {
    if (!product) return;

    // Get existing history from localStorage
    const recentlyViewed = localStorage.getItem('recentlyViewed')
      ? JSON.parse(localStorage.getItem('recentlyViewed')!)
      : [];
    
    // Remove the current product if it exists in the history
    const filteredHistory = recentlyViewed.filter((id: string) => id !== product._id);
    
    // Add the current product at the beginning
    const updatedHistory = [product._id, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    
    // Save back to localStorage
    localStorage.setItem('recentlyViewed', JSON.stringify(updatedHistory));
  }, [product]);
};

/**
 * Utility to get product view history 
 */
export const getProductViewHistory = (): string[] => {
  return localStorage.getItem('recentlyViewed')
    ? JSON.parse(localStorage.getItem('recentlyViewed')!)
    : [];
};

/**
 * Utility to clear product view history
 */
export const clearProductViewHistory = (): void => {
  localStorage.removeItem('recentlyViewed');
};
