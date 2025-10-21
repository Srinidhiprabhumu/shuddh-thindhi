import { Router } from 'express';
import { requireAdmin } from '../auth';
import { storage } from '../storage';

const router = Router();

// Admin routes for orders
router.get('/', requireAdmin, async (req: any, res) => {
  try {
    const orders = await storage.getAllOrders();
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', requireAdmin, async (req: any, res) => {
  try {
    const order = await storage.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/status', requireAdmin, async (req: any, res) => {
  try {
    const { status } = req.body;
    const order = await storage.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    return res.json(order);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid status update' });
  }
});

export default router;