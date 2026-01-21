const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  label: {
    type: String,
    required: [true, 'Address label is required'],
    enum: ['Home', 'Work', 'Other']
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required']
  },
  addressLine2: {
    type: String
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required']
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Address', addressSchema);
