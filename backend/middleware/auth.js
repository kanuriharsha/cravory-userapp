const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Protect routes - Authentication middleware
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Admin authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// OTP storage (in production, use Redis)
const otpStorage = new Map();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP (mock implementation)
const sendOTP = async (phone) => {
  const normalized = phone && phone.toString().trim();
  const otp = generateOTP();
  otpStorage.set(normalized, {
    otp,
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
  });
  
  // In production, send via SMS service (Twilio, AWS SNS, etc.)
  console.log(`📱 OTP for ${normalized}: ${otp}`);
  
  return otp;
};

// Verify OTP
const verifyOTP = (phone, otp) => {
  const normalized = phone && phone.toString().trim();

  // Development helper: accept any OTP in non-production for quick testing
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Development mode: accepting any OTP for', normalized);
    return true;
  }

  const stored = otpStorage.get(normalized);

  if (!stored) {
    console.warn('verifyOTP: no OTP stored for', normalized);
    return false;
  }

  if (Date.now() > stored.expires) {
    otpStorage.delete(normalized);
    console.warn('verifyOTP: OTP expired for', normalized);
    return false;
  }

  if (stored.otp === otp) {
    otpStorage.delete(normalized);
    return true;
  }

  console.warn('verifyOTP: mismatch for', normalized, 'expected', stored.otp, 'got', otp);
  return false;
};

module.exports = {
  generateToken,
  protect,
  authorize,
  sendOTP,
  verifyOTP
};
