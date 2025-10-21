import { Router } from 'express';
import { requireAdmin } from '../auth';
import { storage } from '../storage';
import { hashPassword, verifyPassword } from '../auth-utils';

const router = Router();

// Admin login route
router.post('/login', async (req: any, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await storage.getAdminByUsername(username);
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password using bcrypt
    const isValidPassword = await verifyPassword(password, admin.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Store admin ID in session
    req.session.adminId = admin.id;
    
    return res.json({ id: admin.id, username: admin.username });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin logout route
router.post('/logout', (req: any, res) => {
  req.session.destroy((err: any) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Get current admin info
router.get('/me', async (req: any, res) => {
  try {
    if (req.session?.adminId) {
      const admin = await storage.getAdmin(req.session.adminId);
      if (admin) {
        return res.json({ id: admin.id, username: admin.username });
      }
    }
    return res.status(401).json({ error: 'Not authenticated' });
  } catch (error) {
    console.error('Admin auth check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Secure admin setup route - only works if no admins exist
router.post('/setup', async (req: any, res) => {
  try {
    // Check if any admin already exists
    const existingAdmins = await storage.getAllAdmins();
    if (existingAdmins && existingAdmins.length > 0) {
      return res.status(403).json({ error: 'Admin setup already completed' });
    }

    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Hash the password before storing
    const hashedPassword = await hashPassword(password);

    const admin = await storage.createAdmin({
      username,
      password: hashedPassword,
    });

    console.log('Admin created successfully:', admin.username);

    return res.json({ 
      message: 'Admin setup completed successfully',
      adminId: admin.id 
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;