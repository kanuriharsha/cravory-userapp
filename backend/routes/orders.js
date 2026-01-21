const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order from cart
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;

    // Helper to normalize image value to string URI
    const normalizeImage = (img) => {
      if (!img) return null;
      if (typeof img === 'string') return img;
      // Expo asset objects often have { uri: '...', width, height }
      if (img.uri) return img.uri;
      // Metro unstable_path pattern
      if (img.unstable_path) return img.unstable_path;
      // nested asset
      if (img.asset && img.asset.uri) return img.asset.uri;
      try {
        return String(img);
      } catch (e) {
        return null;
      }
    };

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.menuItemId')
      .populate('restaurantId');

    let orderItems = [];
    let subtotal = 0;

    if (cart && cart.items.length > 0) {
      // Build order items from server cart
      orderItems = cart.items.map(item => {
        const itemTotal = item.quantity * item.price;
        subtotal += itemTotal;
        const rawImage = item.menuItemId?.image || item.image || null;
        return {
          menuItemId: item.menuItemId?._id || null,
          name: item.menuItemId?.name || item.name || 'Item',
          quantity: item.quantity,
          price: item.price,
          image: normalizeImage(rawImage),
          total: itemTotal
        };
      });
    } else if (req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
      // Allow client to send items directly (useful for mock/local data)
      orderItems = req.body.items.map(it => {
        const itemTotal = (it.quantity || 1) * (it.price || 0);
        subtotal += itemTotal;
        return {
          menuItemId: it.menuItemId || null,
          name: it.name || 'Item',
          quantity: it.quantity || 1,
          price: it.price || 0,
          image: normalizeImage(it.image || null),
          total: itemTotal
        };
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const deliveryFee = 2.99;
    const tax = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + deliveryFee + tax;

    // Create order
    const restaurantNameFromBody = req.body.restaurantName || (req.body.items && req.body.items[0]?.restaurantName) || null;
    const order = await Order.create({
      userId: req.user.id,
      restaurantId: cart?.restaurantId || null,
      restaurantName: (cart && cart.restaurantId && cart.restaurantId.name) || restaurantNameFromBody || null,
      items: orderItems,
      subtotal,
      deliveryFee,
      tax,
      total: totalAmount,
      deliveryAddress,
      paymentMethod,
      status: 'pending'
    });

    // Clear cart after order (only if cart existed on server)
    if (cart && cart._id) {
      await Cart.findByIdAndDelete(cart._id);
    }

    // Populate order for response
    await order.populate('restaurantId', 'name image phone');

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    const query = { userId: req.user.id };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('restaurantId', 'name image phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name image phone address');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel if not already preparing/delivered
    if (['preparing', 'out_for_delivery', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order in current status'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/orders/:id/rate
// @desc    Rate an order
// @access  Private
router.post('/:id/rate', protect, async (req, res, next) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this order'
      });
    }

    // Can only rate delivered orders
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate delivered orders'
      });
    }

    order.rating = rating;
    order.review = review;
    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
