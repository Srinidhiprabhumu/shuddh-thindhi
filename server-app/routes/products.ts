import { Router } from 'express';
import { requireAdmin } from '../auth';
import { storage } from '../storage';
import { insertProductSchema } from '../shared/schema';

const router = Router();

// Public routes
router.get('/', async (req, res) => {
  try {
    const products = await storage.getAllProducts();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const products = await storage.getFeaturedProducts();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes
router.post('/', requireAdmin, async (req: any, res) => {
  try {
    const validated = insertProductSchema.parse(req.body);
    const product = await storage.createProduct(validated);
    return res.json(product);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid product data' });
  }
});

router.patch('/:id', requireAdmin, async (req: any, res) => {
  try {
    const product = await storage.updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json(product);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid product data' });
  }
});

router.delete('/:id', requireAdmin, async (req: any, res) => {
  try {
    const deleted = await storage.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;