const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// Haversine formula — returns distance in kilometres between two coords
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MAX_RADIUS_KM = 3.5;

// @route   GET /api/restaurants
// @desc    Get approved restaurants within 3.5 KM of the user
//          Requires query params: lat, lng (user's live coordinates)
//          Distance is always calculated in real-time; the stored `distance`
//          field is intentionally ignored.
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { cuisine, minRating, isOpen, search, limit = 100, page = 1, lat, lng } = req.query;

    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    // Only show approved restaurants, or legacy records that predate the status field
    const query = {
      $or: [
        { status: 'approved' },
        { status: { $exists: false } },
        { status: null }
      ]
    };

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

    // Fetch approved restaurants (no pagination at DB level so we can filter by radius)
    const allRestaurants = await Restaurant.find(query)
      .sort(search ? { score: { $meta: 'textScore' } } : { rating: -1 });

    let result = allRestaurants;

    if (userLat !== null && userLng !== null) {
      // Compute real-time distance and filter to MAX_RADIUS_KM
      result = allRestaurants.reduce((acc, r) => {
        const rLat = r.location && r.location.coordinates && r.location.coordinates.latitude;
        const rLng = r.location && r.location.coordinates && r.location.coordinates.longitude;

        if (rLat == null || rLng == null) return acc; // skip restaurants with no coordinates

        const dist = haversineKm(userLat, userLng, Number(rLat), Number(rLng));

        if (dist <= MAX_RADIUS_KM) {
          const obj = r.toObject();
          obj.computedDistance = Math.round(dist * 100) / 100; // round to 2 dp
          acc.push(obj);
        }
        return acc;
      }, []);

      // Sort nearest first
      result.sort((a, b) => a.computedDistance - b.computedDistance);
    }

    // Apply pagination after radius filter
    const total = result.length;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const paginated = result.slice((pageInt - 1) * limitInt, pageInt * limitInt);

    res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      page: pageInt,
      pages: Math.ceil(total / limitInt),
      data: paginated
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
