# Cravory Backend API

Complete Node.js/Express backend for Cravory food delivery application with MongoDB Atlas integration.

## 🚀 Features

- **Authentication**: JWT-based authentication with OTP login support
- **Restaurant Management**: CRUD operations for restaurants and menus
- **Order Processing**: Complete order lifecycle management
- **Shopping Cart**: Real-time cart management
- **Admin Panel**: Full admin dashboard with analytics
- **Database**: MongoDB Atlas as single source of truth
- **Security**: Helmet, rate limiting, CORS protection
- **Image Uploads**: Cloudinary integration (optional)

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB Atlas account
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://admin:admin@cluster0.31kaszr.mongodb.net/Cravory
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

## 🌱 Seed Database

Populate the database with initial data:

```bash
npm run seed
```

This creates:
- Admin user (Phone: +919999999999, Password: admin123)
- 6 food categories
- 5 restaurants with menu items
- 2 promotional offers

## 🏃 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/send-otp` | Send OTP to phone | Public |
| POST | `/verify-otp` | Verify OTP and login | Public |
| POST | `/register` | Register new user | Public |
| GET | `/me` | Get current user | Private |
| PUT | `/update-profile` | Update user profile | Private |

### Restaurants (`/api/restaurants`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all restaurants (with filters) | Public |
| GET | `/:id` | Get restaurant by ID | Public |
| GET | `/:id/menu` | Get restaurant menu | Public |
| GET | `/search/nearby` | Find nearby restaurants | Public |

### Orders (`/api/orders`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create order from cart | Private |
| GET | `/` | Get user's orders | Private |
| GET | `/:id` | Get order by ID | Private |
| PUT | `/:id/cancel` | Cancel order | Private |
| POST | `/:id/rate` | Rate order | Private |

### Cart (`/api/cart`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get user's cart | Private |
| POST | `/items` | Add item to cart | Private |
| PUT | `/items/:menuItemId` | Update item quantity | Private |
| DELETE | `/items/:menuItemId` | Remove item from cart | Private |
| DELETE | `/` | Clear entire cart | Private |

### Admin (`/api/admin`)

All admin routes require `admin` role.

**Restaurants**
- POST `/restaurants` - Create restaurant
- PUT `/restaurants/:id` - Update restaurant
- DELETE `/restaurants/:id` - Delete restaurant

**Menu Items**
- POST `/menu-items` - Create menu item
- PUT `/menu-items/:id` - Update menu item
- DELETE `/menu-items/:id` - Delete menu item

**Categories**
- GET `/categories` - List categories
- POST `/categories` - Create category
- PUT `/categories/:id` - Update category
- DELETE `/categories/:id` - Delete category

**Offers**
- GET `/offers` - List offers
- POST `/offers` - Create offer
- PUT `/offers/:id` - Update offer
- DELETE `/offers/:id` - Delete offer

**Orders**
- GET `/orders` - List all orders
- PUT `/orders/:id/status` - Update order status

**Users**
- GET `/users` - List all users
- PUT `/users/:id` - Update user role/status

**Stats**
- GET `/stats` - Dashboard statistics

## 🔐 Authentication

### JWT Token
All private routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### OTP Login Flow
1. Send OTP: `POST /api/auth/send-otp` with `{ phone }`
2. Verify OTP: `POST /api/auth/verify-otp` with `{ phone, otp }`
3. Receive JWT token in response

## 📊 Database Models

### User
- name, email, phone, password
- role: user/admin/restaurant_owner
- addresses array

### Restaurant
- name, description, image
- cuisine array
- rating, deliveryTime, deliveryFee
- location (GeoJSON)

### MenuItem
- name, description, price
- category, image
- isVeg, isAvailable
- references Restaurant

### Order
- items array with denormalized data
- subtotal, tax, deliveryFee, totalAmount
- status: pending → confirmed → preparing → out_for_delivery → delivered
- deliveryAddress embedded
- references User, Restaurant

### Cart
- One cart per user (unique userId)
- items array
- auto-calculated total
- references Restaurant, MenuItem

### Category
- name, icon, isActive

### Offer
- code (unique), description
- discountPercentage, maxDiscount
- minOrderAmount, validUntil

## 🔍 Query Parameters

### Restaurants List (`GET /api/restaurants`)
- `cuisine` - Filter by cuisine (comma-separated)
- `minRating` - Minimum rating
- `isOpen` - Filter open restaurants
- `search` - Text search
- `limit` - Results per page (default: 20)
- `page` - Page number (default: 1)

Example:
```
GET /api/restaurants?cuisine=Italian,Pizza&minRating=4.0&isOpen=true&limit=10&page=1
```

### Nearby Search (`GET /api/restaurants/search/nearby`)
- `lat` - Latitude (required)
- `lng` - Longitude (required)
- `maxDistance` - Max distance in meters (default: 5000)

Example:
```
GET /api/restaurants/search/nearby?lat=19.0760&lng=72.8777&maxDistance=3000
```

## 🐳 Deployment (Render)

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**: Add all from `.env`
5. Deploy!

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NODE_ENV | Environment (development/production) | Yes |
| PORT | Server port | Yes |
| MONGO_URI | MongoDB connection string | Yes |
| JWT_SECRET | JWT signing secret | Yes |
| JWT_EXPIRE | JWT expiration (e.g., 7d) | Yes |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | No |
| CLOUDINARY_API_KEY | Cloudinary API key | No |
| CLOUDINARY_API_SECRET | Cloudinary API secret | No |

## 🧪 Testing

Test the API using:
- **Postman**: Import endpoints and test
- **Thunder Client**: VS Code extension
- **curl**: Command line testing

Example health check:
```bash
curl http://localhost:5000/health
```

Example register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "password": "password123"
  }'
```

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [ /* array of items */ ]
}
```

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **JWT**: Token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Mongoose schema validation

## 🐛 Error Handling

The API handles:
- Mongoose validation errors
- Duplicate key errors
- Cast errors (invalid ObjectId)
- Custom application errors

All errors return consistent format with appropriate HTTP status codes.

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **dotenv**: Environment variables
- **cors**: CORS middleware
- **helmet**: Security headers
- **compression**: Response compression
- **morgan**: Request logging
- **express-rate-limit**: Rate limiting

## 👨‍💻 Development

### Project Structure
```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   ├── auth.js              # JWT & OTP middleware
│   └── error.js             # Error handler
├── models/
│   ├── User.js
│   ├── Restaurant.js
│   ├── MenuItem.js
│   ├── Order.js
│   ├── Cart.js
│   ├── Address.js
│   ├── Category.js
│   └── Offer.js
├── routes/
│   ├── auth.js
│   ├── restaurants.js
│   ├── orders.js
│   ├── cart.js
│   └── admin.js
├── scripts/
│   └── seed.js              # Database seeding
├── .env                     # Environment variables
├── .env.example             # Environment template
├── server.js                # Entry point
├── package.json
└── README.md
```

## 📄 License

This project is part of Cravory food delivery application.

## 🆘 Support

For issues and questions:
1. Check this README
2. Review error logs
3. Verify environment variables
4. Check MongoDB connection

---

**Built with ❤️ for Cravory**
