const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Restaurant image is required']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  cuisine: {
    type: String,
    required: [true, 'Cuisine type is required']
  },
  deliveryTime: {
    type: String,
    required: [true, 'Delivery time is required']
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  distance: {
    type: String,
    default: '0 km'
  },
  description: {
    type: String
  },
  address: {
    type: String
  },
  phone: {
    type: String
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Real geo-coordinates for live distance calculation
  location: {
    coordinates: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null }
    }
  },
  // Approval status — only 'approved' restaurants are shown to users
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true
});

// Index for search
restaurantSchema.index({ name: 'text', cuisine: 'text', description: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
