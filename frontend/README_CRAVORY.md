# CRAVORY - Food Delivery Mobile App

## Overview
CRAVORY is a modern, feature-rich food delivery mobile application built with Expo and React Native. This is the **Customer App** with a beautiful UI, smooth animations, and complete ordering flow.

## Features Implemented

### 🎨 Authentication & Onboarding
- **Splash Screen** - Animated CRAVORY branding
- **Login Screen** - Two options: Mobile Number & Google Sign-In (both mocked)
- **OTP Verification** - 4-digit OTP input with auto-verification
- **Location Permission** - Mandatory location access with manual fallback

### 🏠 Home & Discovery
- **Home Screen** with:
  - Location-based restaurant display
  - Search functionality
  - Promotional offers banner
  - Food categories (scrollable)
  - Restaurant cards with ratings, cuisine, delivery time
  - Loading states
- **Search Screen** - Filter restaurants and dishes
- **Tab Navigation** - Home, Search, Orders, Profile

### 🍽️ Restaurant & Ordering
- **Restaurant Detail Page**:
  - Full restaurant information
  - Menu items with images
  - Veg/Non-veg indicators
  - Add to cart functionality
  - Quantity controls
  - Live cart preview
- **Cart Page**:
  - Item management (add/remove/update quantity)
  - Price breakdown (items, delivery, platform fee, GST)
  - Total calculation

### 💳 Checkout & Payment
- **Checkout Page**:
  - Delivery address confirmation
  - Order summary
  - Delivery instructions
  - Bill details
- **Payment Page**:
  - Multiple payment methods (UPI, Card, Wallet, Net Banking, COD)
  - Secure payment interface
  - Offer/coupon section

### 📦 Order Tracking & Post-Delivery
- **Order Confirmation** - Animated success screen with order details
- **Live Order Tracking**:
  - 5-stage tracking (Confirmed → Preparing → Ready → Out for Delivery → Delivered)
  - Animated progress timeline
  - Real-time status updates
  - Estimated delivery time
  - Support contact option
- **Rating & Review Screen**:
  - Food quality rating
  - Delivery experience rating
  - Written review option
  - Quick tags
  - Reorder functionality

### 🎯 Special Features
- **Animated Progress Bar** - Persistent across all screens, fills as order progresses
- **State Management** - Using Zustand for cart and order management
- **Smooth Transitions** - Native-feeling navigation
- **Loading States** - Throughout the app
- **Empty States** - Proper handling for empty cart/orders
- **Mock Data** - Complete with 5 restaurants, multiple menu items

## Tech Stack
- **Framework**: Expo / React Native
- **Routing**: Expo Router (file-based)
- **State Management**: Zustand
- **UI Components**: React Native core components
- **Icons**: @expo/vector-icons
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **Animations**: React Native Animated API

## Project Structure
```
app/
├── (tabs)/              # Tab navigation screens
│   ├── index.tsx        # Home screen
│   ├── search.tsx       # Search screen
│   ├── orders.tsx       # Orders history
│   └── profile.tsx      # User profile
├── restaurant/
│   └── [id].tsx        # Dynamic restaurant detail
├── index.tsx           # Splash screen
├── login.tsx           # Login screen
├── otp.tsx            # OTP verification
├── location.tsx       # Location permission
├── cart.tsx           # Cart screen
├── checkout.tsx       # Checkout screen
├── payment.tsx        # Payment screen
├── order-confirmation.tsx  # Order success
├── order-tracking.tsx      # Live tracking
└── rate-order.tsx          # Rating & review

components/
└── ProgressBar.tsx    # Global animated progress bar

store/
└── orderStore.ts      # Zustand store for cart & orders

data/
└── mockData.ts        # Mock restaurants & menu data
```

## How to Use

### Navigation Flow:
1. **Launch** → Splash Screen (auto-redirects)
2. **Login** → Choose Mobile/Google login
3. **OTP** → Enter verification code (any 4 digits work)
4. **Location** → Allow location access
5. **Home** → Browse restaurants
6. **Restaurant** → View menu, add items to cart
7. **Cart** → Review items, proceed to checkout
8. **Checkout** → Confirm details
9. **Payment** → Select payment method
10. **Order Confirmation** → View success message
11. **Order Tracking** → Live status updates (auto-progresses)
12. **Rating** → Rate food & delivery, write review

### Key Interactions:
- Tap restaurant cards to view menu
- Use +/- buttons to manage quantities
- Progress bar fills as you move through ordering
- View cart button appears when items added
- Order tracking auto-updates every few seconds
- All navigation has back buttons

## Mock Data
- **5 Restaurants** with different cuisines (Indian, Italian, Biryani, South Indian, Fast Food)
- **Menu items** for each restaurant with images, prices, descriptions
- **Offers** and promotional banners
- **Food categories** for quick browsing

## Design Principles
- **Mobile-First**: Designed specifically for mobile devices
- **Touch-Friendly**: Minimum 44px touch targets
- **Modern UI**: Clean, minimal design with CRAVORY orange (#FF6B35)
- **Smooth Animations**: Spring animations and transitions
- **Clear Hierarchy**: Easy to scan and navigate
- **Loading States**: Visual feedback for all actions
- **Empty States**: Helpful messages when no data

## Color Palette
- **Primary**: #FF6B35 (CRAVORY Orange)
- **Success**: #4CAF50
- **Warning**: #FFC107
- **Error**: #F44336
- **Text Primary**: #1A1A1A
- **Text Secondary**: #666666
- **Background**: #FFFFFF / #F5F5F5

## Notes
- This is a **frontend-only** implementation with mock data
- No backend integration required
- All authentication is mocked
- Payment is simulated (no real transactions)
- Order tracking is auto-simulated
- Images are loaded from Unsplash (requires internet)

## Future Enhancements (Backend Integration)
When connecting to backend:
- Real authentication (OTP via SMS, Google OAuth)
- Live restaurant data from database
- Real-time order tracking with WebSockets
- Payment gateway integration (Razorpay/Stripe)
- Push notifications for order updates
- Image upload for reviews
- GPS-based restaurant filtering
- Live location tracking for delivery

## Development
The app uses:
- TypeScript for type safety
- Expo Router for file-based routing
- Safe area handling for different devices
- Keyboard-aware views for forms
- Platform-specific code where needed

---

Built with ❤️ using Expo & React Native
