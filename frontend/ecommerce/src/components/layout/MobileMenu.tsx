import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/userSlice';
import { toastSuccess } from '../../utils/toast';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user } = useAppSelector((state) => state.user);
  const { items } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && target.classList.contains('mobile-menu-overlay')) {
        onClose();
      }
    };
    
    document.addEventListener('click', handleOutsideClick);
    
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen, onClose]);
  
  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleLogout = () => {
    dispatch(logout());
    toastSuccess('Logged out successfully');
    navigate('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 mobile-menu-overlay bg-black bg-opacity-50">
      <div 
        className={`fixed right-0 top-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold text-gray-800">Menu</span>
            <button 
              onClick={onClose} 
              className="p-1 rounded-full hover:bg-gray-200"
              aria-label="Close menu"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="block px-3 py-2 rounded hover:bg-gray-100"
                  onClick={onClose}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className="block px-3 py-2 rounded hover:bg-gray-100"
                  onClick={onClose}
                >
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  to="/cart" 
                  className="block px-3 py-2 rounded hover:bg-gray-100 flex justify-between"
                  onClick={onClose}
                >
                  <span>Cart</span>
                  {items.length > 0 && (
                    <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-xs">
                      {items.length}
                    </span>
                  )}
                </Link>
              </li>
            </ul>
            
            <div className="border-t border-gray-200 my-4"></div>
            
            {user ? (
              <>
                <div className="px-3 py-2 text-gray-600">
                  Signed in as: <span className="font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-red-50"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded hover:bg-gray-100"
                  onClick={onClose}
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="block px-3 py-2 rounded hover:bg-gray-100"
                  onClick={onClose}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
