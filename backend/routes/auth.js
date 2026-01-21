const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, sendOTP, verifyOTP, protect } = require('../middleware/auth');

// @route   POST /api/auth/send-otp
// @desc    Send OTP to phone number
// @access  Public
router.post('/send-otp', async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const otp = await sendOTP(phone);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      otp // Remove in production
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login/register
// @access  Public
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone and OTP are required'
      });
    }

    // Verify OTP
    const isValid = verifyOTP(phone, otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check if phone is admin number
    const adminNumbers = ['+919059070897', '9059070897'];
    const isAdmin = adminNumbers.includes(phone) || adminNumbers.includes(phone.replace(/^\+91/, ''));

    // Find or create user
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({ 
        phone,
        authProvider: 'phone',
        role: isAdmin ? 'admin' : 'user',
        lastLogin: new Date()
      });
    } else {
      // Update role if needed
      if (isAdmin && user.role !== 'admin') {
        user.role = 'admin';
      }
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto || null,
        authProvider: user.authProvider,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/google
// @desc    Google Sign-In authentication
// @access  Public
router.post('/google', async (req, res, next) => {
  try {
    const { googleId, email, name, profilePhoto } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Google ID and email are required'
      });
    }

    // Find user by Google ID or email
    let user = await User.findOne({ 
      $or: [{ googleId }, { email }] 
    });

    if (user) {
      // Update existing user
      user.googleId = googleId;
      user.name = name || user.name;
      user.email = email;
      user.profilePhoto = profilePhoto || user.profilePhoto;
      user.authProvider = 'google';
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        googleId,
        email,
        name,
        profilePhoto,
        authProvider: 'google',
        lastLogin: new Date()
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        authProvider: user.authProvider,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
