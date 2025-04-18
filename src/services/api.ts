
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:8085";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Types for API data
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  seller_id: string;
  category_id: string;
  images: string[];
  rating_avg: number;
  status: string;
}

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  dob: string;
  gender: string;
  role: "customer" | "seller" | "admin";
  status: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  _id: string;
  customer_id: string;
  items: CartItem[];
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export interface Review {
  _id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Category {
  _id: string;
  name: string;
  parent?: string;
}

// Auth interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  dob: string;
  gender: string;
  role: "customer" | "seller" | "admin";
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Helper for getting the authentication token
const getToken = (): string | null => {
  return localStorage.getItem("token");
};

// Helper for setting the authentication token
export const setAuthToken = (token: string): void => {
  localStorage.setItem("token", token);
};

// Helper for removing the authentication token (logout)
export const removeAuthToken = (): void => {
  localStorage.removeItem("token");
};

// Base API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const token = getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An error occurred");
    }

    return { success: true, data: data.data || data };
  } catch (error: any) {
    toast.error(error.message || "An error occurred");
    return { success: false, error: error.message };
  }
};

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  signup: (userData: SignupData) =>
    apiRequest<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getProfile: () => apiRequest<User>("/customer/profile"),
};

// Products API
export const productsAPI = {
  getAll: () => apiRequest<Product[]>("/products"),
  
  getById: (id: string) => apiRequest<Product>(`/products/${id}`),
  
  // Seller operations
  create: (productData: Partial<Product>) =>
    apiRequest<Product>("/seller/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),
    
  update: (id: string, productData: Partial<Product>) =>
    apiRequest<Product>(`/seller/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),
    
  delete: (id: string) =>
    apiRequest(`/seller/products/${id}`, { method: "DELETE" }),
    
  getSellerProducts: () => apiRequest<Product[]>("/seller/products/my"),
  
  // Admin operations
  getAllForAdmin: () => apiRequest<Product[]>("/admin/products"),
  
  updateStatus: (id: string, status: string) =>
    apiRequest(`/admin/products/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Cart API
export const cartAPI = {
  getCart: () => apiRequest<CartItem[]>("/cart"),
  
  addToCart: (productId: string, quantity: number = 1) =>
    apiRequest(`/cart/${productId}`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    }),
    
  removeFromCart: (productId: string) =>
    apiRequest(`/cart/${productId}`, { method: "DELETE" }),
    
  updateQuantity: (productId: string, quantity: number) =>
    apiRequest(`/cart/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => apiRequest<Product[]>("/wishlist"),
  
  addToWishlist: (productId: string) =>
    apiRequest(`/wishlist/${productId}`, { method: "POST" }),
    
  removeFromWishlist: (productId: string) =>
    apiRequest(`/wishlist/${productId}`, { method: "DELETE" }),
};

// Orders API
export const ordersAPI = {
  // Customer operations
  placeOrder: (paymentMethod: string) =>
    apiRequest<Order>("/orders", {
      method: "POST",
      body: JSON.stringify({ payment_method: paymentMethod }),
    }),
    
  getCustomerOrders: () => apiRequest<Order[]>("/orders"),
  
  getOrderById: (id: string) => apiRequest<Order>(`/orders/${id}`),
  
  // Seller operations
  getSellerOrders: () => apiRequest<Order[]>("/seller/orders"),
  
  updateOrderStatus: (id: string, status: string) =>
    apiRequest(`/seller/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
    
  // Admin operations
  getAllOrders: () => apiRequest<Order[]>("/admin/orders"),
};

// Reviews API
export const reviewsAPI = {
  getProductReviews: (productId: string) =>
    apiRequest<Review[]>(`/reviews/${productId}`),
    
  createReview: (reviewData: { product_id: string; rating: number; comment: string }) =>
    apiRequest<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiRequest<Category[]>("/categories"),
  
  // Admin operations
  create: (categoryData: { name: string; parent?: string }) =>
    apiRequest<Category>("/admin/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    }),
    
  update: (id: string, categoryData: { name: string; parent?: string }) =>
    apiRequest<Category>(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    }),
    
  delete: (id: string) =>
    apiRequest(`/admin/categories/${id}`, { method: "DELETE" }),
    
  bulkUpload: (formData: FormData) =>
    apiRequest("/admin/categories/bulk-upload", {
      method: "POST",
      body: formData,
      headers: {},
    }),
};

// User management (admin only)
export const usersAPI = {
  getAll: () => apiRequest<User[]>("/admin/users"),
  
  updateStatus: (id: string, status: string) =>
    apiRequest(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Analytics API
export const analyticsAPI = {
  // Seller analytics
  getSellerSales: () => apiRequest("/seller/analytics/sales"),
  
  // Admin analytics
  getAdminSales: () => apiRequest("/admin/analytics/sales"),
  getUserGrowth: () => apiRequest("/admin/analytics/users"),
};

export default {
  auth: authAPI,
  products: productsAPI,
  cart: cartAPI,
  wishlist: wishlistAPI,
  orders: ordersAPI,
  reviews: reviewsAPI,
  categories: categoriesAPI,
  users: usersAPI,
  analytics: analyticsAPI,
};
