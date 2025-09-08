export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  clientid?: string | {
    _id: string;
    name: string;
    email: string;
    company: string;
  };
  createdAt: string;
  updatedAt: string;
  image?: string;
  category?: string;
  stock?: number;
  rating?: number;
  numReviews?: number;
  brand?: string;
  featured?: boolean;
}

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  savedItems: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface RegisterData extends SignupCredentials {}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  orderItems: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  _id?: string;
  user?: string;
  paymentResult?: {
    id: string;
    status: string;
    updateTime: string;
    emailAddress: string;
  };
  isPaid?: boolean;
  paidAt?: string;
  isDelivered?: boolean;
  deliveredAt?: string;
  createdAt?: string;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Filter {
  search: string;
  category: string;
  priceRange: {
    min: number;
    max: number;
  };
  sortBy: 'newest' | 'price-low-high' | 'price-high-low' | 'rating';
}

export interface ProductsState {
  products: Product[];
  product: Product | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  filter: Filter;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  [key: string]: string;
}

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  company: string;
  website?: string;
  industry?: string;
  notes?: string;
  contactPerson?: {
    name: string;
    position: string;
    email: string;
    phone: string;
  };
  status: 'active' | 'inactive' | 'pending';
  totalSpent?: number;
  lastOrder?: Date;
  createdAt: Date;
  updatedAt: Date;
}
