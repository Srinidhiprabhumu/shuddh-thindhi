import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { storage } from './storage';

// Function to configure Google OAuth strategy after environment variables are loaded
export function configureGoogleOAuth() {
  console.log('Google OAuth config check:');
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
  console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
  console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL ? 'Set' : 'Not set');

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
    console.log('Configuring Google OAuth strategy...');
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await storage.getUserByGoogleId(profile.id);

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');

        if (user) {
          // Update existing user with Google ID
          user = await storage.updateUser(user.id, { googleId: profile.id });
          return done(null, user);
        }

        // Create new user
        user = await storage.createUser({
          googleId: profile.id,
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName || '',
          avatar: profile.photos?.[0]?.value || null
        });

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }));
    return true;
  } else {
    console.warn('Google OAuth not configured - missing environment variables');
    return false;
  }
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Middleware to check if user is authenticated
export const requireAuth = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Middleware to check if user is admin (for session-based admin auth)
export const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    console.log('requireAdmin check - Session ID:', req.sessionID);
    console.log('requireAdmin check - adminId:', req.session?.adminId);
    console.log('requireAdmin check - Path:', req.path);
    
    // Check if admin is already authenticated in session
    if (req.session?.adminId) {
      const admin = await storage.getAdmin(req.session.adminId);
      if (admin) {
        console.log('requireAdmin - Admin authorized:', admin.username);
        req.admin = admin;
        return next();
      } else {
        console.log('requireAdmin - Admin ID in session but not found in DB');
      }
    } else {
      console.log('requireAdmin - No adminId in session');
    }

    return res.status(401).json({ error: 'Admin authentication required' });
  } catch (error) {
    console.error('requireAdmin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default passport;