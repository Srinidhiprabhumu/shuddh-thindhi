import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import passport from "./auth";
import { requireAuth, requireAdmin } from "./auth";
import { storage } from "./storage";
import { hashPassword, verifyPassword, validateEmail, validatePassword } from "./auth-utils";
// import { broadcastToClients } from "./websocket"; // Disabled WebSocket
import { insertProductSchema, insertOrderSchema, insertReviewSchema, insertBannerSchema, insertBrandContentSchema, insertSubscriberSchema, insertCouponSchema } from "@shared/schema";

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'attached_assets/generated_images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // File upload route
  app.post('/api/admin/upload', requireAdmin, upload.array('images', 5), (req: any, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const imageUrls = files.map(file => `/attached_assets/generated_images/${file.filename}`);
      res.json({ images: imageUrls });
    } catch (error) {
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // User signup route
  app.post('/api/auth/signup', async (req, res) => {
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
  app.post('/api/auth/login', async (req, res) => {
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
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  
  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/');
    }
  );
  
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });
  
  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  app.post("/api/admin/login", async (req: any, res) => {
    try {
      const { username, password } = req.body;
      const admin = await storage.getAdminByUsername(username);
      
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Store admin ID in session
      req.session.adminId = admin.id;
      
      return res.json({ id: admin.id, username: admin.username });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });

  // Secure admin setup route - only works if no admins exist
  app.post("/api/admin/setup", async (req: any, res) => {
    try {
      // Check if any admin already exists
      const existingAdmins = await storage.getAllAdmins();
      if (existingAdmins && existingAdmins.length > 0) {
        return res.status(403).json({ error: "Admin setup already completed" });
      }

      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      // Hash the password before storing
      const { hashPassword } = await import("./auth-utils");
      const hashedPassword = await hashPassword(password);

      const admin = await storage.createAdmin({
        username,
        password: hashedPassword,
      });

      return res.json({ 
        message: "Admin setup completed successfully",
        adminId: admin.id 
      });
    } catch (error) {
      console.error("Admin setup error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/me", async (req: any, res) => {
    try {
      if (req.session?.adminId) {
        const admin = await storage.getAdmin(req.session.adminId);
        if (admin) {
          return res.json({ id: admin.id, username: admin.username });
        }
      }
      return res.status(401).json({ error: 'Not authenticated' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      return res.json(products);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      return res.json(products);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.json(product);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin routes for products
  app.post("/api/admin/products", requireAdmin, async (req: any, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      return res.json(product);
    } catch (error) {
      return res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.patch("/api/admin/products/:id", requireAdmin, async (req: any, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.json(product);
    } catch (error) {
      return res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req: any, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin routes for orders
  app.get("/api/admin/orders", requireAdmin, async (req: any, res) => {
    try {
      const orders = await storage.getAllOrders();
      return res.json(orders);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/orders/:id", requireAdmin, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      return res.json(order);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // User routes for their own orders
  app.get("/api/orders", requireAuth, async (req: any, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      const userOrders = allOrders.filter(order => order.userId === req.user.id);
      return res.json(userOrders);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/orders", requireAuth, async (req: any, res) => {
    try {
      const validated = insertOrderSchema.parse(req.body);
      const orderData = {
        ...validated,
        userId: req.user.id,
        customerEmail: req.user.email,
        customerName: req.user.name
      };
      const order = await storage.createOrder(orderData);
      
      // WebSocket broadcasting disabled - using polling instead
      
      return res.json(order);
    } catch (error) {
      return res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req: any, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // WebSocket broadcasting disabled - using polling instead
      
      return res.json(order);
    } catch (error) {
      return res.status(400).json({ error: "Invalid status update" });
    }
  });

  // Admin routes for reviews
  app.get("/api/admin/reviews", requireAdmin, async (req: any, res) => {
    try {
      const reviews = await storage.getAllReviews();
      return res.json(reviews);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/reviews/approved", async (req, res) => {
    try {
      const reviews = await storage.getApprovedReviews();
      return res.json(reviews);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const validated = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validated);
      return res.json(review);
    } catch (error) {
      return res.status(400).json({ error: "Invalid review data" });
    }
  });

  app.patch("/api/admin/reviews/:id/approve", requireAdmin, async (req: any, res) => {
    try {
      const review = await storage.approveReview(req.params.id);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      return res.json(review);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/reviews/:id", requireAdmin, async (req: any, res) => {
    try {
      const deleted = await storage.deleteReview(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Review not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public route for banners
  app.get("/api/banners", async (req, res) => {
    try {
      const banners = await storage.getAllBanners();
      return res.json(banners);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin routes for banners
  app.post("/api/admin/banners", requireAdmin, async (req: any, res) => {
    try {
      const validated = insertBannerSchema.parse(req.body);
      const banner = await storage.createBanner(validated);
      return res.json(banner);
    } catch (error) {
      return res.status(400).json({ error: "Invalid banner data" });
    }
  });

  app.patch("/api/admin/banners/:id", requireAdmin, async (req: any, res) => {
    try {
      const banner = await storage.updateBanner(req.params.id, req.body);
      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }
      return res.json(banner);
    } catch (error) {
      return res.status(400).json({ error: "Invalid banner data" });
    }
  });

  app.delete("/api/admin/banners/:id", requireAdmin, async (req: any, res) => {
    try {
      const deleted = await storage.deleteBanner(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Banner not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/banners/reorder", requireAdmin, async (req: any, res) => {
    try {
      const { bannerIds } = req.body;
      await storage.reorderBanners(bannerIds);
      return res.json({ success: true });
    } catch (error) {
      return res.status(400).json({ error: "Invalid reorder data" });
    }
  });

  app.get("/api/brand-content", async (req, res) => {
    try {
      const content = await storage.getAllBrandContent();
      const contentMap = content.reduce((acc, item) => {
        acc[item.section] = item;
        return acc;
      }, {} as Record<string, typeof content[0]>);
      return res.json(contentMap);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/brand-content", requireAdmin, async (req: any, res) => {
    try {
      const validated = insertBrandContentSchema.parse(req.body);
      const content = await storage.upsertBrandContent(validated);
      return res.json(content);
    } catch (error) {
      return res.status(400).json({ error: "Invalid content data" });
    }
  });

  // Admin route for subscribers
  app.get("/api/admin/subscribers", requireAdmin, async (req: any, res) => {
    try {
      const subscribers = await storage.getAllSubscribers();
      return res.json(subscribers);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/subscribers", async (req, res) => {
    try {
      const validated = insertSubscriberSchema.parse(req.body);
      
      const existing = await storage.getSubscriberByEmail(validated.email);
      if (existing) {
        return res.status(409).json({ error: "Email already subscribed" });
      }
      
      const subscriber = await storage.createSubscriber(validated);
      return res.json(subscriber);
    } catch (error) {
      return res.status(400).json({ error: "Invalid subscriber data" });
    }
  });

  app.delete("/api/admin/subscribers/:id", requireAdmin, async (req: any, res) => {
    try {
      const deleted = await storage.deleteSubscriber(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Subscriber not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Coupon routes
  app.get("/api/admin/coupons", requireAdmin, async (req: any, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      return res.json(coupons);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/coupons/:id", requireAdmin, async (req: any, res) => {
    try {
      const coupon = await storage.getCoupon(req.params.id);
      if (!coupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      return res.json(coupon);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/coupons", requireAdmin, async (req: any, res) => {
    try {
      console.log("Received coupon data:", req.body);
      const validated = insertCouponSchema.parse(req.body);
      console.log("Validated coupon data:", validated);
      const coupon = await storage.createCoupon(validated);
      return res.json(coupon);
    } catch (error) {
      console.error("Coupon creation error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "Invalid coupon data", 
          details: error.errors 
        });
      }
      return res.status(400).json({ error: "Invalid coupon data", details: error.message });
    }
  });

  app.patch("/api/admin/coupons/:id", requireAdmin, async (req: any, res) => {
    try {
      const coupon = await storage.updateCoupon(req.params.id, req.body);
      if (!coupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      return res.json(coupon);
    } catch (error) {
      return res.status(400).json({ error: "Invalid coupon data" });
    }
  });

  app.delete("/api/admin/coupons/:id", requireAdmin, async (req: any, res) => {
    try {
      const deleted = await storage.deleteCoupon(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public coupon validation route
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, orderAmount } = req.body;
      if (!code || orderAmount === undefined) {
        return res.status(400).json({ error: "Code and order amount are required" });
      }
      
      const result = await storage.validateCoupon(code, orderAmount);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Apply coupon (increment usage count)
  app.post("/api/coupons/apply", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Coupon code is required" });
      }
      
      const success = await storage.applyCoupon(code);
      return res.json({ success });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
