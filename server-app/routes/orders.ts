import { Router } from 'express';
import { requireAuth, requireAdmin } from '../auth';
import { storage } from '../storage';
import { insertOrderSchema } from '../shared/schema';

const router = Router();

// User routes for their own orders (authenticated users only)
router.get('/', requireAuth, async (req: any, res) => {
  try {
    const allOrders = await storage.getAllOrders();
    const userOrders = allOrders.filter(order => order.userId === req.user.id);
    return res.json(userOrders);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Public order creation endpoint (for guest checkout)
router.post('/', async (req: any, res) => {
  try {
    console.log('Order creation - Is authenticated:', req.isAuthenticated ? req.isAuthenticated() : false);
    console.log('Order creation - User:', req.user ? 'User found' : 'No user');
    console.log('Order creation - Session ID:', req.sessionID);
    
    const validated = insertOrderSchema.parse(req.body);
    
    let orderData;
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      // Authenticated user order
      orderData = {
        ...validated,
        userId: req.user.id,
        customerEmail: req.user.email,
        customerName: validated.customerName || req.user.name
      };
    } else {
      // Guest order
      orderData = {
        ...validated,
        userId: null // Guest order
      };
    }
    
    const order = await storage.createOrder(orderData);
    return res.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(400).json({ error: 'Invalid order data', details: error.message });
  }
});

export default router;