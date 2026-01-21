const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Offer title is required']
  },
  subtitle: {
    type: String,
    required: [true, 'Offer subtitle is required']
  },
  code: {
    type: String,
    required: [true, 'Offer code is required'],
    unique: true,
    uppercase: true
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  maxDiscount: {
    type: Number
  },
  minOrderValue: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validUntil: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Offer', offerSchema);
