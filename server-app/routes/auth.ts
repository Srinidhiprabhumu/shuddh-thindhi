import { Router } from 'express';
import passport from '../auth';
import { requireAuth } from '../auth';
import { storage } from '../storage';
import { hashPassword, verifyPassword, validateEmail, validatePassword } from '../auth-utils';

const router = Router();

// User signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      name,
      googleId: null,
      avatar: null,
    });

    // Create session
    (req as any).login(user, (err: any) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create session' });
      }
      res.json({ 
        id: user.id, 
        email: user.email, 
        name: user.name,
        message: 'Account created successfully' 
      });
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create session
    (req as any).login(user, (err: any) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create session' });
      }
      res.json({ 
        id: user.id, 
        email: user.email, 
        name: user.name,
        message: 'Login successful' 
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || window.location.origin}/login?error=oauth_failed` }),
  (req, res) => {
    console.log('OAuth callback - User authenticated:', !!req.user);
    console.log('OAuth callback - Session ID:', req.sessionID);
    console.log('OAuth callback - Session data:', req.session);
    console.log('OAuth callback - CLIENT_URL:', process.env.CLIENT_URL);
    
    // Force session save before redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
      // Use same origin if CLIENT_URL is not set
      const redirectUrl = process.env.CLIENT_URL || req.get('origin') || `${req.protocol}://${req.get('host')}`;
      console.log('Redirecting to:', `${redirectUrl}/?login=success`);
      res.redirect(`${redirectUrl}/?login=success`);
    });
  }
);

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

router.get('/user', (req, res) => {
  console.log('Auth check - Session ID:', req.sessionID);
  console.log('Auth check - Is authenticated:', req.isAuthenticated());
  console.log('Auth check - User:', req.user ? 'User found' : 'No user');
  console.log('Auth check - Session data:', req.session);
  console.log('Auth check - Cookies received:', req.headers.cookie);
  
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// OAuth success check endpoint
router.get('/oauth-status', (req, res) => {
  try {
    console.log('OAuth status check - Session ID:', req.sessionID);
    console.log('OAuth status check - Is authenticated:', req.isAuthenticated());
    console.log('OAuth status check - Cookies:', req.headers.cookie);
    console.log('OAuth status check - User:', req.user ? 'User found' : 'No user');
    
    res.json({
      isAuthenticated: req.isAuthenticated(),
      user: req.user || null,
      sessionId: req.sessionID,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('OAuth status check error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      isAuthenticated: false,
      user: null 
    });
  }
});

export default router;