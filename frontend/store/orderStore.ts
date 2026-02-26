import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurantId: string;
  restaurantName: string;
}

export interface DeliveryAddress {
  label: string;       // Home | Work | Other
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

interface OrderStore {
  cart: CartItem[];
  orderProgress: number;
  currentOrderId: string | null;
  // Delivery / contact details
  customerName: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
  // Actions
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setOrderProgress: (progress: number) => void;
  setCurrentOrderId: (orderId: string) => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setDeliveryAddress: (address: DeliveryAddress) => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

const emptyAddress: DeliveryAddress = {
  label: 'Home',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
};

export const useOrderStore = create<OrderStore>((set, get) => ({
  cart: [],
  orderProgress: 0,
  currentOrderId: null,
  customerName: '',
  customerPhone: '',
  deliveryAddress: { ...emptyAddress },

  addToCart: (item) => set((state) => {
    const existingItem = state.cart.find(i => i.id === item.id);
    if (existingItem) {
      return {
        cart: state.cart.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
        orderProgress: Math.min(state.orderProgress + 5, 30)
      };
    }
    return {
      cart: [...state.cart, { ...item, quantity: 1 }],
      orderProgress: Math.min(state.orderProgress + 5, 30)
    };
  }),

  removeFromCart: (itemId) => set((state) => ({
    cart: state.cart.filter(i => i.id !== itemId)
  })),

  updateQuantity: (itemId, quantity) => set((state) => ({
    cart: quantity > 0
      ? state.cart.map(i => i.id === itemId ? { ...i, quantity } : i)
      : state.cart.filter(i => i.id !== itemId)
  })),

  clearCart: () => set({ cart: [], orderProgress: 0 }),

  setOrderProgress: (progress) => set({ orderProgress: progress }),

  setCurrentOrderId: (orderId) => set({ currentOrderId: orderId }),

  setCustomerName: (name) => set({ customerName: name }),

  setCustomerPhone: (phone) => set({ customerPhone: phone }),

  setDeliveryAddress: (address) => set({ deliveryAddress: address }),

  getTotalAmount: () => {
    return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getTotalItems: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  }
}));