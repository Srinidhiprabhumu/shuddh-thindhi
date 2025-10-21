# Deployment Plan - Step by Step

## 🚀 **Phase 1: Get Site Working (Deploy Now)**

### **Current Status:**
- ✅ Reverted to memory store temporarily
- ✅ Fixed API URL issues
- ✅ Enhanced OAuth handling
- ✅ Made orders work for guests
- ✅ No TypeScript errors

### **Deploy Now:**
```bash
git add .
git commit -m "Fix authentication and API issues - temporary memory store"
git push
```

### **Expected Results:**
- ✅ Site will load properly
- ✅ Google OAuth will work (but may lose session on restart)
- ✅ Guest checkout will work
- ✅ Admin panel will be accessible
- ⚠️ Sessions may be lost on server restart (temporary limitation)

## 🔧 **Phase 2: Add MongoDB Session Store (After Site Works)**

### **Step 1: Install Dependency**
```bash
cd server-app
npm install connect-mongo@^5.1.0
```

### **Step 2: Update Code**
```typescript
// In server-app/index.ts
import session from "express-session";
import MongoStore from "connect-mongo";

// Update session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development',
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid',
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600,
    ttl: 24 * 60 * 60,
    autoRemove: 'native'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
    domain: undefined
  }
}));
```

### **Step 3: Update package.json**
```json
{
  "dependencies": {
    "connect-mongo": "^5.1.0"
  }
}
```

### **Step 4: Deploy Again**
```bash
git add .
git commit -m "Add MongoDB session store for persistent sessions"
git push
```

## 🎯 **Why This Two-Phase Approach?**

1. **Phase 1** gets your site working immediately with all the authentication fixes
2. **Phase 2** adds persistent sessions without risking the deployment
3. **Safer deployment** - fix critical issues first, optimize later
4. **Easier debugging** - isolate session store issues from other fixes

## 📋 **Current Environment Variables for Render:**

```
MONGODB_URI=mongodb+srv://srinidhiprabhumu0512_db_user:AMXtdiyFOhciIaG1@cluster0.gywbz3m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
SESSION_SECRET=Xt7$nM9kL2pV8bN4qR1wE5yU3iO6aS9dF2gH7jK4lM1nP8qR5tY7uI3oA6sD9fG2
GOOGLE_CLIENT_ID=78440034359-f9aq71o5jhmmlgkril3bok5vko3mt7tj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://shuddh-thindhi.onrender.com/api/auth/google/callback
NODE_ENV=production
CLIENT_URL=https://shuddh-thindhi.onrender.com
```

## 🚨 **Deploy Phase 1 Now!**

Your site should work properly after this deployment. The MongoDB session store can be added in Phase 2 once we confirm everything else is working.