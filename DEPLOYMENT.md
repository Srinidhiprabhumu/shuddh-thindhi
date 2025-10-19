# Deployment Guide

## Frontend Deployment (Vercel)

The frontend can be deployed to Vercel as a static site.

### Prerequisites
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set up environment variables in Vercel dashboard

### Environment Variables for Vercel
Add these in your Vercel project settings:

```
NODE_ENV=production
VITE_API_URL=https://your-backend-url.com
```

### Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist/client`
- **Install Command**: `npm install`

## Backend Deployment Options

### Option 1: Railway (Recommended)
1. Connect your GitHub repo to Railway
2. Set environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=https://your-backend-url.com/auth/google/callback
   ```
3. Railway will automatically deploy your Express server

### Option 2: Render
1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables (same as above)

### Option 3: Heroku
1. Install Heroku CLI
2. Create new Heroku app
3. Set environment variables using `heroku config:set`
4. Deploy using Git

## Full-Stack Deployment Steps

1. **Deploy Backend First**
   - Choose Railway, Render, or Heroku
   - Set all environment variables
   - Note the backend URL

2. **Update Frontend Config**
   - Update API calls to use your backend URL
   - Set `VITE_API_URL` environment variable

3. **Deploy Frontend**
   - Deploy to Vercel
   - Set environment variables in Vercel dashboard

## Environment Variables Checklist

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-super-secret-session-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-url.com/auth/google/callback
```

### Frontend (Vercel)
```
NODE_ENV=production
VITE_API_URL=https://your-backend-url.com
```

## Security Notes
- Never commit `.env` files to Git
- Use strong, unique secrets for JWT and sessions
- Ensure MongoDB Atlas IP whitelist includes your deployment platform
- Set up proper CORS configuration for production