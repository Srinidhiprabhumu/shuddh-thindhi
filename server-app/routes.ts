import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import productRoutes from "./routes/products";
import uploadRoutes from "./routes/upload";
import orderRoutes from "./routes/orders";
import adminOrderRoutes from "./routes/admin-orders";
import { requireAdmin } from "./auth";
import { storage } from "./storage";
import { insertReviewSchema, insertBannerSchema, insertBrandContentSchema, insertSubscriberSchema, insertCouponSchema } from "./shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Test endpoint to check session
  app.get('/api/test/session', (req: any, res) => {
    console.log('Session test - Headers:', req.headers.cookie);
    console.log('Session test - Session ID:', req.sessionID);
    console.log('Session test - Is authenticated:', req.isAuthenticated ? req.isAuthenticated() : false);
    res.json({
      sessionId: req.sessionID,
      session: req.session,
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      user: req.user || null,
      adminId: req.session?.adminId || null,
      cookies: req.headers.cookie
    });
  });

  // Register organized route modules
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/admin/upload', uploadRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin/orders', adminOrderRoutes);
  app.use('/api/admin/products', productRoutes); // Admin product routes are in the same file

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

  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/attached_assets/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(__dirname, '../client-app/dist/index.html'));
  });

  const httpServer = createServer(app);
  return httpServer;
}
