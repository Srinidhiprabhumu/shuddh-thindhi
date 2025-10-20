import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Mock products data
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
      },
      {
        id: '4',
        name: 'Organic Honey',
        price: 350,
        description: 'Pure wildflower honey collected from natural beehives.',
        images: ['/attached_assets/honey.jpg'],
        category: 'Sweeteners',
        inStock: true,
        featured: false,
        stock: 40
      },
      {
        id: '5',
        name: 'Fresh Milk',
        price: 60,
        description: 'Farm fresh cow milk delivered daily.',
        images: ['/attached_assets/milk.jpg'],
        category: 'Dairy',
        inStock: true,
        featured: false,
        stock: 100
      }
    ];

    // Check if this is a request for a specific product ID
    const url = new URL(req.url || '', `https://${req.headers.host}`);
    const pathParts = url.pathname.split('/');
    
    // If URL is like /api/products/1, return single product
    if (pathParts.length === 4 && pathParts[3]) {
      const productId = pathParts[3];
      const product = mockProducts.find(p => p.id === productId);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      return res.status(200).json(product);
    }

    // Otherwise return all products
    return res.status(200).json(mockProducts);
    
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}