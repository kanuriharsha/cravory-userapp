const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const Offer = require('../models/Offer');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authorization
router.use(protect, authorize('admin'));

// ========== Restaurant Management ==========

// @route   GET /api/admin/restaurants
// @desc    Get all restaurants (admin view)
// @access  Admin
router.get('/restaurants', async (req, res, next) => {
  try {
    const { q, limit = 100, page = 1 } = req.query;

    const query = {};
    if (q) {
      query.name = { $regex: q, $options: 'i' };
    }

    const restaurants = await Restaurant.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Restaurant.countDocuments(query);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      page: parseInt(page),
      data: restaurants
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/restaurants
// @desc    Create new restaurant
// @access  Admin
router.post('/restaurants', async (req, res, next) => {
  try {
    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/restaurants/:id
// @desc    Update restaurant
// @access  Admin
router.put('/restaurants/:id', async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/restaurants/:id
// @desc    Delete restaurant
// @access  Admin
router.delete('/restaurants/:id', async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Delete all menu items for this restaurant
    await MenuItem.deleteMany({ restaurantId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Restaurant and associated menu items deleted'
    });
  } catch (error) {
    next(error);
  }
});

// ========== Menu Item Management ==========

// @route   POST /api/admin/menu-items
// @desc    Create new menu item
// @access  Admin
router.post('/menu-items', async (req, res, next) => {
  try {
    const menuItem = await MenuItem.create(req.body);

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/menu-items/:id
// @desc    Update menu item
// @access  Admin
router.put('/menu-items/:id', async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/menu-items/:id
// @desc    Delete menu item
// @access  Admin
router.delete('/menu-items/:id', async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu item deleted'
    });
  } catch (error) {
    next(error);
  }
});

// ========== Category Management ==========

// @route   GET /api/admin/categories
// @desc    Get all categories
// @access  Admin
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/categories
// @desc    Create new category
// @access  Admin
router.post('/categories', async (req, res, next) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/categories/:id
// @desc    Update category
// @access  Admin
router.put('/categories/:id', async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/categories/:id
// @desc    Delete category
// @access  Admin
router.delete('/categories/:id', async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted'
    });
  } catch (error) {
    next(error);
  }
});

// ========== Offer Management ==========

// @route   GET /api/admin/offers
// @desc    Get all offers
// @access  Admin
router.get('/offers', async (req, res, next) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/offers
// @desc    Create new offer
// @access  Admin
router.post('/offers', async (req, res, next) => {
  try {
    const offer = await Offer.create(req.body);

    res.status(201).json({
      success: true,
      data: offer
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/offers/:id
// @desc    Update offer
// @access  Admin
router.put('/offers/:id', async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: offer
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/offers/:id
// @desc    Delete offer
// @access  Admin
router.delete('/offers/:id', async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Offer deleted'
    });
  } catch (error) {
    next(error);
  }
});

// ========== Order Management ==========

// @route   GET /api/admin/orders
// @desc    Get all orders with filters
// @access  Admin
router.get('/orders', async (req, res, next) => {
  try {
    const { status, restaurantId, limit = 50, page = 1 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name phone')
      .populate('restaurantId', 'name')
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

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Admin
router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('userId', 'name phone')
     .populate('restaurantId', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
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

// ========== User Management ==========

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', async (req, res, next) => {
  try {
    const { role, isActive, limit = 50, page = 1 } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Admin
router.put('/users/:id', async (req, res, next) => {
  try {
    const { role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// ========== Dashboard Stats ==========

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/stats', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentOrders = await Order.find()
      .populate('userId', 'name')
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalRestaurants,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
