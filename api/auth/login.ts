import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Mock authentication - replace with real authentication
    if (email === 'test@example.com' && password === 'password') {
      // Set a simple session cookie
      res.setHeader('Set-Cookie', [
        `auth-token=user-1-token; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
        `user-id=1; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
      ]);

      return res.status(200).json({
        success: true,
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        },
        message: 'Login successful'
      });
    } else {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({ 
      error: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}