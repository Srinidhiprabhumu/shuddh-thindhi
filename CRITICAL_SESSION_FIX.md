# Critical Session Fix - Sessions Not Persisting

## 🚨 **Root Cause Identified**

Every request is creating a **NEW session ID** instead of reusing the existing session. This is why:
- OAuth login succeeds but user is immediately logged out
- Email/password login succeeds but next request shows not authenticated
- Every API call gets a fresh session

## 📊 **Evidence from Logs**

```
OAuth callback - Session ID: YIAWnViMl21SEzu_ekQi3E7Hhhg6neux
🔑 Generating new session ID: 08d6142f-d4bb-41a0-a3a9-cbee7815a23a  ← NEW SESSION!
🔑 Generating new session ID: d2fc59a5-42b1-418b-85be-a06bf90b2fd3  ← NEW SESSION!
🔑 Generating new session ID: f5b65972-9aa9-40f7-b20f-2fe978c980b5  ← NEW SESSION!
```

The cookie IS being sent:
```
Auth check - Cookies received: sessionId=s%3AYIAWnViMl21SEzu_ekQi3E7Hhhg6neux...
```

But it's not being recognized, so a new session is created for each request.

## 🔧 **Fixes Applied**

### **1. Fixed __dirname Error**
- ❌ `__dirname` not available in ES modules
- ✅ Added `fileURLToPath` and `path.dirname` to routes.ts

### **2. Updated Session Cookie Name**
- Changed from `connect.sid` to `sessionId` to match what's being sent
- Added explicit `path: '/'` to cookie configuration

### **3. Enhanced Debugging**
- Added cookie presence logging to track if cookies are being sent

## 🎯 **Why Sessions Aren't Persisting**

The issue is likely one of these:

### **Problem 1: Cookie Name Mismatch** (FIXED)
- Server expects: `connect.sid`
- Client sends: `sessionId`
- Solution: Changed server to use `sessionId`

### **Problem 2: Memory Store Limitation**
- Memory store doesn't persist across requests in some configurations
- Each request might be hitting a different server instance
- Solution: Need MongoDB session store (Phase 2)

### **Problem 3: Session Serialization**
- Passport might not be serializing/deserializing properly
- Session data might not be saved correctly
- Solution: Check passport configuration

## 🚀 **Deploy This Fix**

```bash
git add .
git commit -m "Fix session persistence - cookie name and __dirname issues"
git push
```

## 🧪 **Testing After Deployment**

1. **Login with email/password**
2. **Check logs** for:
   - Same session ID being reused
   - No new session generation on subsequent requests
3. **Verify** user stays logged in across page refreshes

## 📋 **If Sessions Still Don't Persist**

If this doesn't fix it, the next steps are:

### **Option 1: Add MongoDB Session Store** (Recommended)
```typescript
import MongoStore from 'connect-mongo';

store: MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  ttl: 24 * 60 * 60
})
```

### **Option 2: Adjust Cookie Settings**
```typescript
cookie: {
  secure: false, // Try without secure first
  httpOnly: true,
  sameSite: 'lax',
  path: '/'
}
```

### **Option 3: Check Render Configuration**
- Ensure only ONE instance is running
- Check if load balancer is interfering with sessions
- Verify environment variables are set correctly

## 🎯 **Expected Results**

After this fix:
- ✅ Same session ID should be reused across requests
- ✅ Login should persist
- ✅ No more "Generating new session ID" on every request
- ✅ OAuth and email/password login should work

**Deploy this fix immediately!**