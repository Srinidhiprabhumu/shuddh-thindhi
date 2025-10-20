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
    // Return featured products (subset of all products)
    const featuredProducts = [
      {
        id: '1',
        name: 'Organic Rice',
        price: 299,
        description: 'Premium organic basmati rice',
        images: ['/attached_assets/rice.jpg'],
        category: 'Grains',
        inStock: true,
        featured: true,
        stock: 50
      },
      {
        id: '3',
        name: 'Pure Ghee',
        price: 450,
        description: 'Traditional cow ghee',
        images: ['/attached_assets/ghee.jpg'],
        category: 'Dairy',
        inStock: true,
        featured: true,
        stock: 25
      }
    ];

    return res.status(200).json(featuredProducts);
    
  } catch (error) {
    console.error('Featured products API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch featured products',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}