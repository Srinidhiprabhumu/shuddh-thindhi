# Render Deployment Guide

## 🚀 Steps to Fix Your Deployment

### 1. Update Google OAuth Settings
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Find your OAuth 2.0 Client ID: `78440034359-f9aq71o5jhmmlgkril3bok5vko3mt7tj.apps.googleusercontent.com`
4. Add these authorized redirect URIs:
   - `https://shuddh-thindhi.onrender.com/api/auth/google/callback`
   - Keep `http://localhost:5001/api/auth/google/callback` for development

### 2. Set Environment Variables in Render Dashboard

**For your Backend Service (shuddh-thindhi.onrender.com):**
```
MONGODB_URI=mongodb+srv://srinidhiprabhumu0512_db_user:AMXtdiyFOhciIaG1@cluster0.gywbz3m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=ShT9x$mK2pL8vN4qR7wE3yU6iO1aS5dF0gH9jK2lM8nP4qR7tY3uI6oA1sD5fG0h
SESSION_SECRET=Xt7$nM9kL2pV8bN4qR1wE5yU3iO6aS9dF0gH7jK4lM1nP8qR5tY7uI3oA6sD9fG2
GOOGLE_CLIENT_ID=78440034359-f9aq71o5jhmmlgkril3bok5vko3mt7tj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://shuddh-thindhi.onrender.com/api/auth/google/callback
NODE_ENV=production
CLIENT_URL=https://shuddh-thindhi-1.onrender.com
```

**For your Frontend Service (shuddh-thindhi-1.onrender.com):**
```
VITE_API_URL=https://shuddh-thindhi.onrender.com
NODE_ENV=production
```

### 3. Update Render Build Settings

**Backend Service:**
- Build Command: `npm run render-build`
- Start Command: `npm start`
- Root Directory: `server-app`

**Frontend Service:**
- Build Command: `npm run build`
- Publish Directory: `dist`
- Root Directory: `client-app`

### 4. Deploy Order
1. Deploy backend first (shuddh-thindhi.onrender.com)
2. Wait for it to be fully deployed
3. Then deploy frontend (shuddh-thindhi-1.onrender.com)

### 5. Test After Deployment
1. Visit: `https://shuddh-thindhi.onrender.com/api/admin/setup`
2. Create admin account
3. Test Google OAuth: `https://shuddh-thindhi-1.onrender.com`
4. Test order checkout

## 🔧 Common Issues & Solutions

### Issue: "CORS Error"
- Make sure both services are deployed
- Check environment variables are set correctly
- Verify CLIENT_URL matches your frontend domain

### Issue: "Google OAuth Not Working"
- Update Google Cloud Console redirect URIs
- Check GOOGLE_CALLBACK_URL environment variable
- Ensure HTTPS is used in production

### Issue: "Session/Cookie Issues"
- Sessions work across subdomains (.onrender.com)
- Make sure both services use HTTPS
- Check browser developer tools for cookie errors

### Issue: "Database Connection Failed"
- Verify MONGODB_URI is correct
- Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
- Ensure database user has proper permissions

## 📝 Notes
- Environment variables in Render dashboard override .env files
- Both services need to be on the same domain (.onrender.com) for sessions to work
- Static assets are served from the backend service
- Admin setup is available at: `/api/admin/setup`