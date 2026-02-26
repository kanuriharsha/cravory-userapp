const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Restaurant'
  },
  restaurantName: {
    type: String,
    required: true
  },
  // Customer contact details captured at order time
  customerName: {
    type: String,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  items: [{
    menuItemId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'MenuItem'
    },
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  subtotal: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    label: String,          // Home | Work | Other
    addressLine1: String,   // House / Flat / Building
    addressLine2: String,   // Street / Area / Locality
    city: String,
    state: String,
    pincode: String,
    latitude: Number,
    longitude: Number,
    // Convenience: full formatted string built by backend
    fullAddress: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'COD'
  },
  estimatedDeliveryTime: {
    type: String
  },
  deliveryInstructions: {
    type: String
  },
  // ── Order Tracking Stages ────────────────────────────────────────────────
  // Each stage is 'pending' until that milestone is reached, then 'completed'
  trackingStages: {
    orderConfirmed: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    preparingFood: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    foodReady: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    outForDelivery: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    delivered: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    }
  },

  // ── QR Delivery Verification (Part 17 & 18) ─────────────────────────────
  qrToken: {
    type: String,
    default: null
  },
  qrTokenExpiry: {
    type: Date,
    default: null
  },
  qrVerifiedAt: {
    type: Date,
    default: null
  },
  deliveryVerificationStatus: {
    type: String,
    enum: ['pending', 'qr_generated', 'verified', 'attempt_pending'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for user orders
orderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
