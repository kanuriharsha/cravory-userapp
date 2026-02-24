const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const Offer = require('../models/Offer');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Category.deleteMany({});
    await Offer.deleteMany({});

    // (admin user creation removed)

    // Create categories
    console.log('📂 Creating categories...');
    const categories = await Category.create([
      { name: 'Pizza', icon: '🍕', isActive: true },
      { name: 'Burger', icon: '🍔', isActive: true },
      { name: 'Indian', icon: '🍛', isActive: true },
      { name: 'Chinese', icon: '🥡', isActive: true },
      { name: 'Dessert', icon: '🍰', isActive: true },
      { name: 'Drinks', icon: '🥤', isActive: true }
    ]);

    // Create offers
    console.log('🎁 Creating offers...');
    const offers = await Offer.create([
      {
        title: '50% OFF',
        subtitle: 'On your first order',
        code: 'FIRST50',
        discountPercentage: 50,
        maxDiscount: 100,
        minOrderValue: 199,
        isActive: true,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'FLAT ₹100',
        subtitle: 'On orders above ₹499',
        code: 'FLAT100',
        discountPercentage: 0,
        maxDiscount: 100,
        minOrderValue: 499,
        isActive: true,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ]);

    // Create restaurants
    // Coordinates are placed near Vijayawada (16.4403923, 80.6279616) — all within 3.5 km
    console.log('🏪 Creating restaurants...');
    const restaurants = await Restaurant.create([
      {
        name: 'Pizza Paradise',
        description: 'Authentic Italian pizzas with fresh ingredients',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
        cuisine: 'Italian',
        address: 'Benz Circle, Vijayawada',
        phone: '+919876543210',
        rating: 4.5,
        deliveryTime: '30-40 min',
        isOpen: true,
        status: 'approved',
        location: { coordinates: { latitude: 16.4494, longitude: 80.6330 } }  // ~1.1 km
      },
      {
        name: 'Burger House',
        description: 'Juicy burgers and crispy fries',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        cuisine: 'American',
        address: 'Governorpet, Vijayawada',
        phone: '+919876543211',
        rating: 4.3,
        deliveryTime: '25-35 min',
        isOpen: true,
        status: 'approved',
        location: { coordinates: { latitude: 16.4254, longitude: 80.6380 } }  // ~2.0 km
      },
      {
        name: 'Spice Kitchen',
        description: 'Traditional Indian cuisine with modern twist',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
        cuisine: 'Indian',
        address: 'Patamata, Vijayawada',
        phone: '+919876543212',
        rating: 4.7,
        deliveryTime: '35-45 min',
        isOpen: true,
        status: 'approved',
        location: { coordinates: { latitude: 16.4604, longitude: 80.6130 } }  // ~2.7 km
      },
      {
        name: 'Wok Express',
        description: 'Fast and fresh Chinese food',
        image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c',
        cuisine: 'Chinese',
        address: 'Siddhartha Nagar, Vijayawada',
        phone: '+919876543213',
        rating: 4.4,
        deliveryTime: '30-40 min',
        isOpen: true,
        status: 'approved',
        location: { coordinates: { latitude: 16.4154, longitude: 80.6480 } }  // ~3.4 km
      },
      {
        name: 'Sweet Treats',
        description: 'Delicious desserts and beverages',
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777',
        cuisine: 'Dessert',
        address: 'One Town, Vijayawada',
        phone: '+919876543214',
        rating: 4.6,
        deliveryTime: '20-30 min',
        isOpen: true,
        status: 'approved',
        location: { coordinates: { latitude: 16.4434, longitude: 80.6230 } }  // ~0.6 km
      }
    ]);

    // Create menu items for each restaurant
    console.log('🍽️  Creating menu items...');

    // Pizza Paradise menu
    await MenuItem.create([
      {
        restaurantId: restaurants[0]._id,
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 299,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurantId: restaurants[0]._id,
        name: 'Pepperoni Pizza',
        description: 'Loaded with pepperoni and cheese',
        price: 399,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
        isVeg: false,
        isAvailable: true
      },
      {
        restaurantId: restaurants[0]._id,
        name: 'Veggie Supreme',
        description: 'Bell peppers, onions, olives, and mushrooms',
        price: 349,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f',
        isVeg: true,
        isAvailable: true
      }
    ]);

    // Burger House menu
    await MenuItem.create([
      {
        restaurantId: restaurants[1]._id,
        name: 'Classic Beef Burger',
        description: 'Juicy beef patty with lettuce, tomato, and special sauce',
        price: 199,
        category: 'Burger',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        isVeg: false,
        isAvailable: true
      },
      {
        restaurantId: restaurants[1]._id,
        name: 'Chicken Burger',
        description: 'Grilled chicken with mayo and veggies',
        price: 179,
        category: 'Burger',
        image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b',
        isVeg: false,
        isAvailable: true
      },
      {
        restaurantId: restaurants[1]._id,
        name: 'Veggie Burger',
        description: 'Plant-based patty with fresh vegetables',
        price: 159,
        category: 'Burger',
        image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurantId: restaurants[1]._id,
        name: 'French Fries',
        description: 'Crispy golden fries',
        price: 99,
        category: 'Sides',
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
        isVeg: true,
        isAvailable: true
      }
    ]);

    // Spice Kitchen menu
    await MenuItem.create([
      {
        restaurantId: restaurants[2]._id,
        name: 'Butter Chicken',
        description: 'Creamy tomato-based chicken curry',
        price: 299,
        category: 'Indian',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398',
        isVeg: false,
        isAvailable: true
      },
      {
        restaurantId: restaurants[2]._id,
        name: 'Paneer Tikka Masala',
        description: 'Grilled cottage cheese in spicy gravy',
        price: 249,
        category: 'Indian',
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurantId: restaurants[2]._id,
        name: 'Biryani',
        description: 'Fragrant rice with spices and meat',
        price: 349,
        category: 'Indian',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
        isVeg: false,
        isAvailable: true
      }
    ]);

    // Wok Express menu
    await MenuItem.create([
      {
        restaurantId: restaurants[3]._id,
        name: 'Fried Rice',
        description: 'Wok-tossed rice with vegetables',
        price: 179,
        category: 'Chinese',
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurantId: restaurants[3]._id,
        name: 'Hakka Noodles',
        description: 'Stir-fried noodles with vegetables',
        price: 199,
        category: 'Chinese',
        image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurantId: restaurants[3]._id,
        name: 'Manchurian',
        description: 'Fried vegetable balls in tangy sauce',
        price: 219,
        category: 'Chinese',
        image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb',
        isVeg: true,
        isAvailable: true
      }
    ]);

    // Sweet Treats menu
    await MenuItem.create([
      {
        restaurantId: restaurants[4]._id,
        name: 'Chocolate Cake',
        description: 'Rich and moist chocolate cake',
        price: 149,
        category: 'Dessert',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurantId: restaurants[4]._id,
        name: 'Ice Cream Sundae',
        description: 'Vanilla ice cream with toppings',
        price: 129,
        category: 'Dessert',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurantId: restaurants[4]._id,
        name: 'Cold Coffee',
        description: 'Refreshing iced coffee',
        price: 99,
        category: 'Drinks',
        image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7',
        isVeg: true,
        isAvailable: true
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created:`);
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${offers.length} offers`);
    console.log(`   - ${restaurants.length} restaurants`);
    console.log(`   - Menu items for all restaurants`);
    console.log(`\n👤 Admin Login Credentials:`);
    console.log(`   Phone: +919999999999`);
    console.log(`   Password: admin123`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed
connectDB().then(() => seedData());
