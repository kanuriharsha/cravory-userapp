const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// @route   GET /api/restaurants
// @desc    Get all restaurants with filters
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { cuisine, minRating, isOpen, search, limit = 20, page = 1 } = req.query;

    // Build query
    const query = {};

    if (cuisine) {
      query.cuisine = cuisine;
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (isOpen === 'true') {
      query.isOpen = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const restaurants = await Restaurant.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort(search ? { score: { $meta: 'textScore' } } : { rating: -1 });

    const total = await Restaurant.countDocuments(query);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: restaurants
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/restaurants/:id
// @desc    Get restaurant by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

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

// @route   GET /api/restaurants/:id/menu
// @desc    Get menu items for a restaurant
// @access  Public
router.get('/:id/menu', async (req, res, next) => {
  try {
    const { category, isAvailable } = req.query;

    const query = { 
      $or: [
        { restaurantId: req.params.id },
        { restaurant_id: req.params.id }
      ]
    };

    if (category) {
      query.category = category;
    }

    if (isAvailable === 'true') {
      query.isAvailable = true;
    }

    const menuItems = await MenuItem.find(query)
      .populate('restaurantId', 'name')
      .sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
