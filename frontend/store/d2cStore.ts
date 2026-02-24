/**
 * d2cStore — Dedicated Zustand store for the Authentic Originals D2C flow.
 *
 * ARCHITECTURE RESTRICTIONS (Part 21):
 *  • Completely separate from orderStore / local restaurant cart
 *  • No rider assignment logic
 *  • No instant delivery timers
 *  • No live GPS tracking (milestone-only tracking)
 *  • Region branding only – vendor identity is never exposed in state
 *  • Prepaid only (COD flag always false)
 *  • Pincode is mandatory – stored alongside delivery address
 */
import { create } from 'zustand';

// ── Types ──────────────────────────────────────────────────────────────────

export interface D2CProduct {
  id: string;
  /** Display name of the product */
  name: string;
  /** Region / town branding (e.g. "Kakinada") */
  region: string;
  /** State name (e.g. "Andhra Pradesh") */
  stateName: string;
  description: string;
  /** Numeric price in ₹ */
  price: number;
  /** Origin PIN (hidden from users – for backend vendor routing only) */
  originPin: string;
  deliveryDays: string;
}

export interface D2CAddress {
  fullName: string;
  mobile: string;
  /** Full detailed address line */
  address: string;
  city: string;
  state: string;
  /** Mandatory – checkout is blocked without this */
  pincode: string;
  /** Optional */
  landmark: string;
}

export interface D2CPricing {
  productPrice: number;
  premiumPackagingFee: number;
  /** Long-distance shipping charge – future API will compute from origin→dest PIN */
  longDistanceShipping: number;
  total: number;
}

// ── D2C Milestone definitions (7 stages, Part 14) ────────────────────────
export const D2C_MILESTONES = [
  {
    key: 'order_confirmed',
    label: 'Order Confirmed',
    sub: 'Your origin order is confirmed and being prepared.',
    icon: 'checkmark-circle',
  },
  {
    key: 'preparing_at_origin',
    label: 'Preparing at Origin',
    sub: 'Artisans at the origin town are preparing your item.',
    icon: 'restaurant-outline',
  },
  {
    key: 'packed_ready',
    label: 'Packed & Ready for Dispatch',
    sub: 'Item carefully packed and ready to ship.',
    icon: 'cube-outline',
  },
  {
    key: 'shipped_origin',
    label: 'Shipped from Origin Town',
    sub: 'Item handed to long-distance courier at origin.',
    icon: 'send-outline',
  },
  {
    key: 'in_transit',
    label: 'In Transit (Courier Partner)',
    sub: 'Package is travelling to your city via courier.',
    icon: 'train-outline',
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    sub: 'Your package is out for final delivery today.',
    icon: 'bicycle',
  },
  {
    key: 'delivered',
    label: 'Delivered Successfully',
    sub: 'Authentic origin item delivered to your door.',
    icon: 'home',
  },
] as const;

export type D2CMilestoneKey = (typeof D2C_MILESTONES)[number]['key'];

export interface D2COrder {
  orderId: string;
  product: D2CProduct;
  address: D2CAddress;
  pricing: D2CPricing;
  /** Always 'prepaid' – COD disabled by design */
  paymentMethod: string;
  placedAt: string;
  /**
   * Milestone index (0–6), corresponding to D2C_MILESTONES.
   *  0 = Order Confirmed
   *  1 = Preparing at Origin
   *  2 = Packed & Ready for Dispatch
   *  3 = Shipped from Origin Town
   *  4 = In Transit (Courier Partner)
   *  5 = Out for Delivery
   *  6 = Delivered Successfully
   *
   *  NOTE: NO live GPS tracking, NO rider assignment.
   *        Updates are milestone-only (outsourced logistics).
   */
  milestoneIndex: number;
  /** Optional courier name – future dynamic */
  courierPartner?: string;
}

// ── Pricing constants (MVP – future: compute via PIN-to-PIN API) ─────────
export const D2C_PACKAGING_FEE = 49;
export const D2C_SHIPPING_FEE = 99; // placeholder until PIN API is live

export function calcD2CPricing(productPrice: number): D2CPricing {
  const total = productPrice + D2C_PACKAGING_FEE + D2C_SHIPPING_FEE;
  return {
    productPrice,
    premiumPackagingFee: D2C_PACKAGING_FEE,
    longDistanceShipping: D2C_SHIPPING_FEE,
    total,
  };
}

// ── Store interface ────────────────────────────────────────────────────────

const EMPTY_ADDRESS: D2CAddress = {
  fullName: '',
  mobile: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
};

interface D2CStore {
  /** The product the user chose to order via D2C flow */
  d2cProduct: D2CProduct | null;
  d2cAddress: D2CAddress;
  /** Finalised order (set after payment confirmation) */
  d2cOrder: D2COrder | null;

  setD2cProduct: (product: D2CProduct) => void;
  updateD2cAddress: (fields: Partial<D2CAddress>) => void;
  placeD2cOrder: (paymentMethod: string) => void;
  /** Advance the milestone by 1 (dev / admin utility) */
  advanceMilestone: () => void;
  /** True when an order exists and has not been delivered yet */
  isD2COrderActive: () => boolean;
  resetD2cFlow: () => void;
}

// ── Store implementation ───────────────────────────────────────────────────

export const useD2CStore = create<D2CStore>((set, get) => ({
  d2cProduct: null,
  d2cAddress: { ...EMPTY_ADDRESS },
  d2cOrder: null,

  setD2cProduct: (product) => set({ d2cProduct: product }),

  updateD2cAddress: (fields) =>
    set((state) => ({ d2cAddress: { ...state.d2cAddress, ...fields } })),

  placeD2cOrder: (paymentMethod) => {
    const { d2cProduct, d2cAddress } = get();
    if (!d2cProduct) return;

    const pricing = calcD2CPricing(d2cProduct.price);
    const order: D2COrder = {
      // D2C- prefix makes it visually distinct from local order IDs
      orderId: `D2C-${Date.now().toString(36).toUpperCase()}`,
      product: d2cProduct,
      address: { ...d2cAddress },
      pricing,
      paymentMethod,
      placedAt: new Date().toISOString(),
      milestoneIndex: 0, // starts at "Order Confirmed"
      courierPartner: 'Delhivery', // placeholder; future: resolved from PIN API
    };
    set({ d2cOrder: order });
  },

  advanceMilestone: () =>
    set((state) => {
      if (!state.d2cOrder) return state;
      const next = Math.min(state.d2cOrder.milestoneIndex + 1, D2C_MILESTONES.length - 1);
      return { d2cOrder: { ...state.d2cOrder, milestoneIndex: next } };
    }),

  isD2COrderActive: () => {
    const { d2cOrder } = get();
    if (!d2cOrder) return false;
    return d2cOrder.milestoneIndex < D2C_MILESTONES.length - 1;
  },

  resetD2cFlow: () =>
    set({ d2cProduct: null, d2cAddress: { ...EMPTY_ADDRESS }, d2cOrder: null }),
}));
