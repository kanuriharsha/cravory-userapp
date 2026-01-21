# Google OAuth Setup for Cravory

## Error: redirect_uri_mismatch

This error occurs because the redirect URI used by your app is not authorized in your Google Cloud Console.

## Fix Steps:

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials

### 2. Select Your Project
- Select project: `cravory--login-app`

### 3. Edit OAuth 2.0 Client ID
- Find your OAuth 2.0 Client ID: `586542487325-bail263eggih7jdm7pl349nf9r64m52f.apps.googleusercontent.com`
- Click on it to edit

### 4. Add Authorized Redirect URIs

Add these URIs to the "Authorized redirect URIs" section:

#### For Expo Go Development:
```
https://auth.expo.io/@your-expo-username/cravory
```

#### For Expo Dev Client:
```
exp://localhost:8081
exp://10.123.56.226:8081
cravory://
```

#### For Production:
```
com.cravory.app://
```

#### For Web:
```
http://localhost:8081
https://localhost:8081
```

### 5. Save Changes

Click "Save" at the bottom of the page.

### 6. Alternative: Use Expo's Auth Proxy (Recommended for Development)

If you don't want to configure redirect URIs, you can use Expo's auth proxy which handles this automatically:

The code is already configured to use Expo's auth proxy with the `expoClientId` parameter in `login.tsx`.

## Testing

1. After adding the redirect URIs, wait 5-10 minutes for changes to propagate
2. Restart your Expo app: `npx expo start -c`
3. Try Google Sign-In again

## Current Configuration

- **Project ID**: cravory--login-app
- **Client ID**: 586542487325-bail263eggih7jdm7pl349nf9r64m52f.apps.googleusercontent.com
- **Package Name**: com.cravory.app

## Notes

- Expo Go uses Expo's auth proxy by default
- For production builds, you'll need to add your app's custom scheme
- The auth flow now properly stores user data in MongoDB via the backend API
