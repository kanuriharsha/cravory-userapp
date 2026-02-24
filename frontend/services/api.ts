import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Type definitions
interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    profilePhoto?: string;
    authProvider?: string;
    role?: string;
  };
}

interface ProfileResponse {
  success: boolean;
  user: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    profilePhoto?: string;
    authProvider?: string;
    role?: string;
    isActive?: boolean;
  };
}

// Backend API URL - prioritizes environment variables for all environments
const getApiUrl = () => {
  // First, check for Expo environment variable (works in both dev and production)
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    console.log('[API] Using URL from environment variable:', envApiUrl);
    return envApiUrl;
  }

  // Development fallback: try to derive from Expo debugger host
  if (__DEV__) {
    try {
      const debuggerHost = (Constants.manifest && Constants.manifest.debuggerHost) || (Constants.manifest2 && Constants.manifest2.debuggerHost);
      if (debuggerHost) {
        const host = debuggerHost.split(':')[0];
        console.log('[API] Using Expo debugger host:', host);
        return `http://${host}:5000`;
      }
    } catch (e) {
      console.log('[API] Could not derive from debugger host:', e);
    }
    
    // Last resort for development
    console.log('[API] Platform:', Platform.OS);
    console.warn('[API] Falling back to localhost - consider setting EXPO_PUBLIC_API_URL');
    return 'http://localhost:5000';
  }

  // Production fallback 
  console.error('[API] No API_URL configured for production! Set EXPO_PUBLIC_API_URL environment variable');
  return 'https://your-backend-url.com';
};

// Get API URL using environment-first approach
export const API_URL = getApiUrl();

console.log('[API] Configured API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// ==========================
// Authentication Services
// ==========================

export const authService = {
  // Send OTP to phone number
  sendOTP: async (phone: string): Promise<any> => {
    return await api.post('/api/auth/send-otp', { phone });
  },

  // Verify OTP and login
  verifyOTP: async (phone: string, otp: string): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/verify-otp', { phone, otp }) as AuthResponse;
    if (response.token) {
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
    }
    return response;
  },

  // Google Sign-In
  googleSignIn: async (googleData: {
    googleId: string;
    email: string;
    name: string;
    profilePhoto?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/google', googleData) as AuthResponse;
    if (response.token) {
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
    }
    return response;
  },

  // Get current user profile
  getProfile: async (): Promise<ProfileResponse> => {
    return await api.get('/api/auth/me') as ProfileResponse;
  },

  // Update user profile
  updateProfile: async (data: { name?: string; email?: string }): Promise<ProfileResponse> => {
    const response = await api.put('/api/auth/update-profile', data) as ProfileResponse;
    if (response.user) {
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
    }
    return response;
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  },

  // Get stored user data
  getStoredUser: async () => {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
};

// ==========================
// Restaurant Services
// ==========================

export const restaurantService = {
  // Get all restaurants — pass lat/lng so the backend filters by 3.5 KM radius
  getRestaurants: async (params?: {
    cuisine?: string;
    minRating?: number;
    isOpen?: boolean;
    search?: string;
    limit?: number;
    page?: number;
    lat?: number;
    lng?: number;
  }) => {
    return await api.get('/api/restaurants', { params });
  },

  // Get restaurant by ID
  getRestaurantById: async (id: string) => {
    return await api.get(`/api/restaurants/${id}`);
  },

  // Get restaurant menu
  getRestaurantMenu: async (id: string, params?: {
    category?: string;
    isAvailable?: boolean;
  }) => {
    return await api.get(`/api/restaurants/${id}/menu`, { params });
  }
};

// ==========================
// Cart Services
// ==========================

export const cartService = {
  // Get user's cart
  getCart: async () => {
    return await api.get('/api/cart');
  },

  // Add item to cart
  addToCart: async (menuItemId: string, quantity: number = 1) => {
    return await api.post('/api/cart/items', { menuItemId, quantity });
  },

  // Update cart item quantity
  updateCartItem: async (menuItemId: string, quantity: number) => {
    return await api.put(`/api/cart/items/${menuItemId}`, { quantity });
  },

  // Remove item from cart
  removeFromCart: async (menuItemId: string) => {
    return await api.delete(`/api/cart/items/${menuItemId}`);
  },

  // Clear cart
  clearCart: async () => {
    return await api.delete('/api/cart');
  }
};

// ==========================
// Order Services
// ==========================

export const orderService = {
  // Create order from cart
  createOrder: async (data: {
    deliveryAddress: any;
    paymentMethod: string;
    items?: Array<{
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      image?: any;
      restaurantName?: string;
    }>;
    restaurantName?: string;
  }) => {
    return await api.post('/api/orders', data);
  },

  // Get user's orders
  getOrders: async (params?: {
    status?: string;
    limit?: number;
    page?: number;
  }) => {
    return await api.get('/api/orders', { params });
  },

  // Get order by ID
  getOrderById: async (id: string) => {
    return await api.get(`/api/orders/${id}`);
  },

  // Cancel order
  cancelOrder: async (id: string) => {
    return await api.put(`/api/orders/${id}/cancel`);
  },

  // Rate order
  rateOrder: async (id: string, rating: number, review?: string) => {
    return await api.post(`/api/orders/${id}/rate`, { rating, review });
  },

  // ── QR Delivery Verification (Part 17 & 18) ─────────────────────────────

  /** Generate a time-limited QR token for delivery verification */
  generateDeliveryQR: async (id: string): Promise<{
    success: boolean;
    data: {
      qrPayload: string;
      token: string;
      timestamp: number;
      expiry: string;
      orderId: string;
      verificationCode: string;
    };
  }> => {
    return await api.post(`/api/orders/${id}/generate-qr`, {}) as any;
  },

  /** Verify the scanned QR token and mark order as delivered */
  verifyDeliveryQR: async (id: string, token: string, timestamp: number): Promise<{
    success: boolean;
    message: string;
    data?: { status: string; qrVerifiedAt: string };
    deliveryVerificationStatus?: string;
  }> => {
    return await api.post(`/api/orders/${id}/verify-qr`, { token, timestamp }) as any;
  }
};

export default api;
