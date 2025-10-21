import { Router } from 'express';
import { requireAuth, requireAdmin } from '../auth';
import { storage } from '../storage';
import { insertOrderSchema } from '../shared/schema';

const router = Router();

// User routes for their own orders
router.get('/', requireAuth, async (req: any, res) => {
  try {
    const allOrders = await storage.getAllOrders();
    const userOrders = allOrders.filter(order => order.userId === req.user.id);
    return res.json(userOrders);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req: any, res) => {
  try {
    const validated = insertOrderSchema.parse(req.body);
    const orderData = {
      ...validated,
      userId: req.user.id,
      // Use the customer email from the authenticated user for security
      customerEmail: req.user.email,
      // Allow custom customer name from the form (don't override)
      customerName: validated.customerName || req.user.name
    };
    const order = await storage.createOrder(orderData);
    
    return res.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(400).json({ error: 'Invalid order data' });
  }
});

export default router;