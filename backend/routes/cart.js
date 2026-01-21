const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate('restaurantId', 'name image')
      .populate('items.menuItemId', 'name price image');

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [],
        total: 0
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/cart/items
// @desc    Add item to cart
// @access  Private
router.post('/items', protect, async (req, res, next) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;

    // Get menu item details
    const menuItem = await MenuItem.findById(menuItemId);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    if (!menuItem.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Menu item is not available'
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        restaurantId: menuItem.restaurantId,
        items: [],
        total: 0
      });
    }

    // Check if cart is from same restaurant
    if (cart.restaurantId && cart.restaurantId.toString() !== menuItem.restaurantId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add items from different restaurants. Please clear cart first.'
      });
    }

    // Update restaurant if cart was empty
    if (!cart.restaurantId) {
      cart.restaurantId = menuItem.restaurantId;
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.menuItemId.toString() === menuItemId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        menuItemId,
        quantity,
        price: menuItem.price
      });
    }

    // Calculate total
    cart.total = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    await cart.save();
    await cart.populate('restaurantId', 'name image');
    await cart.populate('items.menuItemId', 'name price image');

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/cart/items/:menuItemId
// @desc    Update item quantity in cart
// @access  Private
router.put('/items/:menuItemId', protect, async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be positive'
      });
    }

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item.menuItemId.toString() === req.params.menuItemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    // Calculate total
    cart.total = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Clear restaurant if cart is empty
    if (cart.items.length === 0) {
      cart.restaurantId = null;
    }

    await cart.save();
    await cart.populate('restaurantId', 'name image');
    await cart.populate('items.menuItemId', 'name price image');

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/cart/items/:menuItemId
// @desc    Remove item from cart
// @access  Private
router.delete('/items/:menuItemId', protect, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Filter out the item
    cart.items = cart.items.filter(
      item => item.menuItemId.toString() !== req.params.menuItemId
    );

    // Calculate total
    cart.total = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Clear restaurant if cart is empty
    if (cart.items.length === 0) {
      cart.restaurantId = null;
    }

    await cart.save();
    await cart.populate('restaurantId', 'name image');
    await cart.populate('items.menuItemId', 'name price image');

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', protect, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    cart.total = 0;
    cart.restaurantId = null;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
