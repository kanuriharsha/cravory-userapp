# Cravory Deployment Guide

## Overview
This guide covers deploying both the backend (Node.js/Express) and frontend (Expo/React Native) to production.

## Backend Deployment

### Option 1: Deploy to Render (Recommended)
1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` or `node server.js`
   - **Environment**: Node
5. Add environment variables:
   ```
   NODE_ENV=production
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_jwt_secret_here
   PORT=5000
   ALLOWED_ORIGINS=https://your-expo-app-url.com,exp://your-expo-url
   ```
6. Deploy and copy the URL (e.g., `https://cravory-api.onrender.com`)

### Option 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add environment variables (same as above)
4. Deploy and get your URL

### Option 3: Deploy to Heroku
```bash
cd backend
heroku create cravory-api
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_connection_string
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

## Frontend Deployment

### Option 1: Expo Application Services (EAS) - Recommended for Mobile
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo:
   ```bash
   eas login
   ```

3. Configure your project:
   ```bash
   cd frontend
   eas build:configure
   ```

4. Update `app.json` with your production API URL:
   ```json
   {
     "expo": {
       "extra": {
         "apiUrl": "https://your-backend-url.com/api"
       }
     }
   }
   ```

5. Create production builds:
   ```bash
   # For Android APK
   eas build --platform android --profile production
   
   # For iOS
   eas build --platform ios --profile production
   ```

6. Submit to stores:
   ```bash
   # Google Play Store
   eas submit --platform android
   
   # Apple App Store
   eas submit --platform ios
   ```

### Option 2: Web Deployment (Expo Web)
1. Build for web:
   ```bash
   cd frontend
   npx expo export:web
   ```

2. Deploy the `web-build` folder to:
   - **Vercel**: `vercel web-build`
   - **Netlify**: Drag & drop `web-build` folder
   - **GitHub Pages**: Push to gh-pages branch

## Environment Variables Setup

### Backend (.env)
Create `.env` file in `backend/` directory:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Cravory
JWT_SECRET=your_very_secure_random_secret_key_here
JWT_EXPIRE=7d
ALLOWED_ORIGINS=https://your-frontend-domain.com,exp://your-expo-url
```

### Frontend
For production builds, set the API URL in `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://cravory-api.onrender.com/api"
    }
  }
}
```

Then update `frontend/services/api.ts` to read from config:
```typescript
import Constants from 'expo-constants';

const getProductionApiUrl = () => {
  const envApiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (envApiUrl) {
    return envApiUrl;
  }
  return 'https://your-backend-url.com/api';
};
```

## Database Setup (MongoDB Atlas)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Database Access → Add Database User
4. Network Access → Add IP Address (0.0.0.0/0 for production)
5. Connect → Get connection string
6. Replace `<password>` with your database user password
7. Add connection string to backend `.env` as `MONGO_URI`

## Testing Deployment

### Test Backend
```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-21T..."
}
```

### Test Frontend
1. Open the Expo Go app
2. Scan the QR code from your EAS build
3. Test login, orders, and all features
4. Verify API calls in network inspector

## Post-Deployment Checklist

- [ ] Backend health endpoint returns 200 OK
- [ ] MongoDB connection successful (check logs)
- [ ] CORS allows frontend origin
- [ ] JWT secret is secure and not exposed
- [ ] Environment variables set correctly
- [ ] Frontend can reach backend API
- [ ] OTP/login flow works
- [ ] Orders can be created and fetched
- [ ] Admin dashboard accessible
- [ ] Images load correctly
- [ ] Test on real devices (iOS/Android)

## Continuous Deployment

### Backend (Render/Railway)
- Both services auto-deploy when you push to your main branch
- Configure in their dashboard settings

### Frontend (EAS)
Set up GitHub Actions:
```yaml
# .github/workflows/eas-build.yml
name: EAS Build
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g eas-cli
      - run: eas build --platform android --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## Common Issues

### CORS Errors
- Add your frontend URL to `ALLOWED_ORIGINS` in backend `.env`
- Check `server.js` CORS configuration

### API Connection Failed
- Verify backend is running: `curl https://your-api.com/health`
- Check frontend API_URL points to correct domain
- Ensure no trailing slashes in URLs

### MongoDB Connection Error
- Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas
- Verify connection string format
- Check username/password don't have special characters

### Build Errors
- Clear caches: `npx expo start --clear`
- Delete `node_modules`: `rm -rf node_modules && npm install`
- Update dependencies: `npm update`

## Monitoring & Logs

### Backend Logs
- **Render**: Dashboard → Logs tab
- **Railway**: Project → Deployments → View logs
- **Heroku**: `heroku logs --tail`

### Frontend Logs
- **Expo**: Check EAS build logs in dashboard
- **Sentry**: Add error tracking (recommended)

## Support & Resources

- [Expo Documentation](https://docs.expo.dev)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Railway Documentation](https://docs.railway.app/)

## Cost Estimate

- **MongoDB Atlas**: Free (512MB)
- **Render/Railway**: Free tier available
- **Expo EAS**: Free for development, $29/month for production
- **Domain**: $10-15/year (optional)

Total: **$0-29/month** for basic setup
