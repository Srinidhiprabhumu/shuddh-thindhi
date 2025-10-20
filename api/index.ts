import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock data
const mockProducts = [
  {
    id: '1',
    name: 'Organic Rice',
    price: 299,
    description: 'Premium organic basmati rice sourced directly from organic farms. Rich in nutrients and free from harmful chemicals.',
    images: ['/attached_assets/rice.jpg'],
    category: 'Grains',
    inStock: true,
    featured: true,
    stock: 50
  },
  {
    id: '2', 
    name: 'Fresh Vegetables',
    price: 150,
    description: 'Farm fresh mixed vegetables including tomatoes, onions, carrots, and leafy greens.',
    images: ['/attached_assets/vegetables.jpg'],
    category: 'Vegetables',
    inStock: true,
    featured: false,
    stock: 30
  },
  {
    id: '3',
    name: 'Pure Ghee',
    price: 450,
    description: 'Traditional cow ghee made from pure milk. Perfect for cooking and health benefits.',
    images: ['/attached_assets/ghee.jpg'],
    category: 'Dairy',
    inStock: true,
    featured: true,
    stock: 25
  }
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(req.url || '', `https://${req.headers.host}`);
    const path = url.pathname;
    
    console.log('API Handler called:', req.method, path);

    // Route handling
    if (path === '/api/auth/user') {
      // Check authentication
      const cookies = req.headers.cookie || '';
      const authToken = cookies.split(';').find(c => c.trim().startsWith('auth-token='));
      
      if (authToken) {
        return res.status(200).json({
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        });
      }
      return res.status(200).json(null);
    }

    if (path === '/api/auth/logout' && req.method === 'POST') {
      res.setHeader('Set-Cookie', [
        'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict',
        'user-id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict'
      ]);
      return res.status(200).json({ success: true, message: 'Logged out successfully' });
    }

    if (path === '/api/orders') {
      const orders = [
        {
          id: '1',
          userId: 'user1',
          items: [{ productId: '1', name: 'Organic Rice', price: 299, quantity: 2, image: '/attached_assets/rice.jpg' }],
          total: 598,
          status: 'delivered',
          createdAt: new Date('2024-01-15').toISOString(),
          deliveryAddress: '123 Main St, City, State 12345'
        }
      ];
      return res.status(200).json(orders);
    }

    if (path === '/api/subscribers' && req.method === 'POST') {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email required' });
      return res.status(201).json({ success: true, message: 'Subscribed successfully' });
    }

    if (path === '/api/banners') {
      const banners = [
        { id: '1', title: 'Fresh Organic Products', subtitle: 'Farm to Table Quality', image: '/attached_assets/banner1.jpg', link: '/products', isActive: true, order: 1 }
      ];
      return res.status(200).json(banners);
    }

    if (path === '/api/reviews/approved') {
      const reviews = [
        { id: '1', productId: '1', userName: 'Priya Sharma', rating: 5, comment: 'Excellent quality rice!', isApproved: true, createdAt: new Date('2024-01-15').toISOString() }
      ];
      return res.status(200).json(reviews);
    }

    if (path === '/api/brand-content') {
      return res.status(200).json({
        'hero-title': { id: '1', key: 'hero-title', value: 'Fresh, Organic, Delivered', type: 'text' }
      });
    }

    // Default response
    return res.status(200).json({
      message: 'Shuddh Thindi API',
      version: '1.0.0',
      status: 'working',
      path: path,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}