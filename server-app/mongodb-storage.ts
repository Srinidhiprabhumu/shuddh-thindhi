import { MongoClient, Db, Collection } from 'mongodb';
import { randomUUID } from "crypto";
import type {
  User, InsertUser,
  Admin, InsertAdmin,
  Product, InsertProduct,
  Order, InsertOrder,
  Review, InsertReview,
  Banner, InsertBanner,
  BrandContent, InsertBrandContent,
  Subscriber, InsertSubscriber,
  Coupon, InsertCoupon,
  Announcement, InsertAnnouncement
} from "@shared/schema";
import { IStorage } from "./storage";

const thekua1 = "/attached_assets/generated_images/Traditional_thekua_sweet_snacks_abfa8650.png";
const thekua2 = "/attached_assets/generated_images/Jaggery_thekua_dessert_d0e3cff2.png";
const thekua3 = "/attached_assets/generated_images/Traditional_sweets_combo_pack_ccf12962.png";
const banner1 = "/attached_assets/generated_images/Traditional_kitchen_banner_image_f751e656.png";
const review1 = "/attached_assets/generated_images/Happy_family_enjoying_snacks_6a8c2e98.png";

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: Db;
  private users: Collection<User>;
  private admins: Collection<Admin>;
  private products: Collection<Product>;
  private orders: Collection<Order>;
  private reviews: Collection<Review>;
  private banners: Collection<Banner>;
  private brandContent: Collection<BrandContent>;
  private subscribers: Collection<Subscriber>;
  private coupons: Collection<Coupon>;
  private announcements: Collection<Announcement>;

  constructor() {
    // Don't initialize client in constructor, do it in connect()
  }

  async connect() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    console.log('Connecting to MongoDB Atlas...');
    console.log('MongoDB URI format check:', mongoUri.substring(0, 20) + '...' + mongoUri.substring(mongoUri.length - 20));
    
    // Try different connection configurations
    const connectionConfigs = [
      // Standard configuration
      {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority',
      },
      // Alternative configuration for SSL issues
      {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority',
        tls: true,
        tlsInsecure: false,
      },
      // Fallback configuration
      {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority',
        ssl: true,
        sslValidate: true,
      }
    ];

    let lastError: Error | null = null;

    for (let i = 0; i < connectionConfigs.length; i++) {
      try {
        console.log(`Attempting connection with config ${i + 1}/${connectionConfigs.length}...`);
        this.client = new MongoClient(mongoUri, connectionConfigs[i]);
        
        await this.client.connect();
        
        // Test the connection
        await this.client.db().admin().ping();
        
        this.db = this.client.db();
        console.log('✅ MongoDB Atlas connection established successfully');
        break;
      } catch (error) {
        console.warn(`Connection attempt ${i + 1} failed:`, error.message);
        lastError = error as Error;
        
        if (this.client) {
          try {
            await this.client.close();
          } catch (closeError) {
            // Ignore close errors
          }
        }
        
        if (i === connectionConfigs.length - 1) {
          console.error('❌ All MongoDB connection attempts failed');
          throw new Error(`MongoDB connection failed after ${connectionConfigs.length} attempts. Last error: ${lastError?.message}`);
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Initialize collections
    this.users = this.db.collection<User>('users');
    this.admins = this.db.collection<Admin>('admins');
    this.products = this.db.collection<Product>('products');
    this.orders = this.db.collection<Order>('orders');
    this.reviews = this.db.collection<Review>('reviews');
    this.banners = this.db.collection<Banner>('banners');
    this.brandContent = this.db.collection<BrandContent>('brandContent');
    this.subscribers = this.db.collection<Subscriber>('subscribers');
    this.coupons = this.db.collection<Coupon>('coupons');
    this.announcements = this.db.collection<Announcement>('announcements');

    // Create indexes for better performance
    await this.users.createIndex({ email: 1 }, { unique: true });
    await this.users.createIndex({ googleId: 1 }, { unique: true, sparse: true });
    await this.admins.createIndex({ username: 1 }, { unique: true });
    await this.subscribers.createIndex({ email: 1 }, { unique: true });
    await this.coupons.createIndex({ code: 1 }, { unique: true });
    await this.announcements.createIndex({ order: 1 });

    console.log('Connected to MongoDB Atlas');
    
    // Seed initial data if collections are empty
    await this.seedData();
  }

  private async seedData() {
    // No default admin creation for security reasons
    // Admin accounts must be created manually through secure setup

    // Check if products exist
    const productCount = await this.products.countDocuments();
    if (productCount === 0) {
      const products: Product[] = [
        {
          id: "prod-1",
          name: "Traditional Thekua",
          description: "Handcrafted traditional thekua made with pure wheat flour, jaggery, and ghee. A perfect blend of authentic taste and heritage.",
          price: 299,
          regularPrice: 599,
          images: [thekua1],
          category: "Traditional Sweets",
          inventory: 50,
          isFeatured: true,
        },
        {
          id: "prod-2",
          name: "Jaggery Thekua",
          description: "Rich and flavorful thekua sweetened with pure organic jaggery. Each bite is a celebration of traditional flavors.",
          price: 299,
          regularPrice: 599,
          images: [thekua2],
          category: "Traditional Sweets",
          inventory: 45,
          isFeatured: true,
        },
        {
          id: "prod-3",
          name: "Traditional Thekua 3 Combo",
          description: "Premium combo pack featuring three varieties of our best-selling thekua. Perfect for gifting or sharing with family.",
          price: 799,
          regularPrice: 1799,
          images: [thekua3],
          category: "Combo Packs",
          inventory: 30,
          isFeatured: true,
        },
      ];
      await this.products.insertMany(products);
    }

    // Check if banners exist
    const bannerCount = await this.banners.countDocuments();
    if (bannerCount === 0) {
      const banners: Banner[] = [
        {
          id: "banner-1",
          image: banner1,
          title: "Traditional Snacks, Made with Love",
          subtitle: "Experience the authentic taste of India's finest traditional sweets",
          order: 0,
          isActive: true,
        },
      ];
      await this.banners.insertMany(banners);
    }

    // Check if reviews exist
    const reviewCount = await this.reviews.countDocuments();
    if (reviewCount === 0) {
      const reviews: Review[] = [
        {
          id: "review-1",
          customerName: "Priya Sharma",
          image: review1,
          isApproved: true,
          createdAt: new Date(),
        },
      ];
      await this.reviews.insertMany(reviews);
    }

    // Check if brand content exists
    const contentCount = await this.brandContent.countDocuments();
    if (contentCount === 0) {
      const brandContentData: BrandContent[] = [
        {
          id: "content-mission",
          section: "mission",
          title: "Our Mission",
          content: "To be India's finest snacks brand, delivering high-quality, hygienic, and affordable traditional snacks that you can trust and enjoy, any day of the year. We are not just selling snacks; we are reviving a legacy of purity.",
        },
        {
          id: "content-story",
          section: "story",
          title: "The Beginning",
          content: "The journey of Shuddh Swad began with a powerful, personal experience. Our 16-year-old founder's simple desire for a local thekua turned into a harsh lesson on food hygiene. This single incident sparked a powerful question: Why can't traditional snacks be both delicious and safe?\n\nThis was followed by another realization during Chhath Puja—the best snacks were scarce and seasonal. This scarcity and lack of hygiene wasn't just a problem; it was an opportunity to create something better.",
        },
        {
          id: "content-values",
          section: "values",
          title: "Our Philosophy of Purity",
          content: "Authentic Recipes: We stay true to the traditions. Our recipes are passed down through generations, ensuring every bite is a genuine taste of heritage.\n\nUncompromising Hygiene: From our kitchen to your home, we maintain the strictest hygiene standards. Because good taste begins with good health.\n\nAvailable for All: Great taste shouldn't be seasonal or exclusive. We make our traditional snacks affordable and available all year round, for everyone to enjoy.",
        },
      ];
      await this.brandContent.insertMany(brandContentData);
    }

    // Check if coupons exist
    const couponCount = await this.coupons.countDocuments();
    if (couponCount === 0) {
      const sampleCoupons: Coupon[] = [
        {
          id: "coupon-1",
          code: "WELCOME20",
          description: "Welcome offer! Get 20% off on your first order",
          discountType: "percentage",
          discountValue: 20,
          minimumOrderAmount: 500,
          maximumDiscountAmount: 200,
          usageLimit: 100,
          usedCount: 0,
          isActive: true,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          createdAt: new Date(),
        },
        {
          id: "coupon-2",
          code: "SAVE50",
          description: "Flat ₹50 off on orders above ₹300",
          discountType: "fixed",
          discountValue: 50,
          minimumOrderAmount: 300,
          maximumDiscountAmount: null,
          usageLimit: null,
          usedCount: 0,
          isActive: true,
          validFrom: new Date(),
          validUntil: null,
          createdAt: new Date(),
        },
        {
          id: "coupon-3",
          code: "FESTIVE30",
          description: "Festival special! 30% off on all traditional sweets",
          discountType: "percentage",
          discountValue: 30,
          minimumOrderAmount: 800,
          maximumDiscountAmount: 300,
          usageLimit: 50,
          usedCount: 0,
          isActive: true,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          createdAt: new Date(),
        },
      ];
      await this.coupons.insertMany(sampleCoupons);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const user = await this.users.findOne({ id });
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.users.findOne({ email });
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const user = await this.users.findOne({ googleId });
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser: User = { 
      ...user, 
      id, 
      createdAt: new Date(),
      isEmailVerified: user.googleId ? true : false // Auto-verify Google users
    };
    await this.users.insertOne(newUser);
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await this.users.findOneAndUpdate(
      { id },
      { $set: user },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  // Admin methods
  async getAdmin(id: string): Promise<Admin | undefined> {
    const admin = await this.admins.findOne({ id });
    return admin || undefined;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const admin = await this.admins.findOne({ username });
    return admin || undefined;
  }

  async getAllAdmins(): Promise<Admin[]> {
    return await this.admins.find({}).toArray();
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const newAdmin: Admin = { ...admin, id };
    await this.admins.insertOne(newAdmin);
    return newAdmin;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await this.products.find({}).toArray();
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await this.products.find({ isFeatured: true }).toArray();
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const product = await this.products.findOne({ id });
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = { ...product, id };
    await this.products.insertOne(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await this.products.findOneAndUpdate(
      { id },
      { $set: product },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.products.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Order methods
  async getAllOrders(): Promise<Order[]> {
    return await this.orders.find({}).sort({ createdAt: -1 }).toArray();
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const order = await this.orders.findOne({ id });
    return order || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const newOrder: Order = { ...order, id, createdAt: new Date() };
    await this.orders.insertOne(newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const result = await this.orders.findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  // Review methods
  async getAllReviews(): Promise<Review[]> {
    return await this.reviews.find({}).sort({ createdAt: -1 }).toArray();
  }

  async getApprovedReviews(): Promise<Review[]> {
    return await this.reviews.find({ isApproved: true }).toArray();
  }

  async getReview(id: string): Promise<Review | undefined> {
    const review = await this.reviews.findOne({ id });
    return review || undefined;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = randomUUID();
    const newReview: Review = { ...review, id, createdAt: new Date() };
    await this.reviews.insertOne(newReview);
    return newReview;
  }

  async approveReview(id: string): Promise<Review | undefined> {
    const result = await this.reviews.findOneAndUpdate(
      { id },
      { $set: { isApproved: true } },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await this.reviews.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Banner methods
  async getAllBanners(): Promise<Banner[]> {
    return await this.banners.find({}).sort({ order: 1 }).toArray();
  }

  async getBanner(id: string): Promise<Banner | undefined> {
    const banner = await this.banners.findOne({ id });
    return banner || undefined;
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const id = randomUUID();
    const maxOrderResult = await this.banners.findOne({}, { sort: { order: -1 } });
    const maxOrder = maxOrderResult?.order ?? -1;
    const newBanner: Banner = { ...banner, id, order: maxOrder + 1 };
    await this.banners.insertOne(newBanner);
    return newBanner;
  }

  async updateBanner(id: string, banner: Partial<InsertBanner>): Promise<Banner | undefined> {
    const result = await this.banners.findOneAndUpdate(
      { id },
      { $set: banner },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteBanner(id: string): Promise<boolean> {
    const result = await this.banners.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async reorderBanners(bannerIds: string[]): Promise<void> {
    for (let i = 0; i < bannerIds.length; i++) {
      await this.banners.updateOne(
        { id: bannerIds[i] },
        { $set: { order: i } }
      );
    }
  }

  // Brand content methods
  async getAllBrandContent(): Promise<BrandContent[]> {
    return await this.brandContent.find({}).toArray();
  }

  async getBrandContentBySection(section: string): Promise<BrandContent | undefined> {
    const content = await this.brandContent.findOne({ section });
    return content || undefined;
  }

  async upsertBrandContent(content: InsertBrandContent): Promise<BrandContent> {
    const existing = await this.getBrandContentBySection(content.section);
    if (existing) {
      const result = await this.brandContent.findOneAndUpdate(
        { section: content.section },
        { $set: content },
        { returnDocument: 'after' }
      );
      return result!;
    }
    const id = randomUUID();
    const newContent: BrandContent = { ...content, id };
    await this.brandContent.insertOne(newContent);
    return newContent;
  }

  // Subscriber methods
  async getAllSubscribers(): Promise<Subscriber[]> {
    return await this.subscribers.find({}).sort({ createdAt: -1 }).toArray();
  }

  async getSubscriber(id: string): Promise<Subscriber | undefined> {
    const subscriber = await this.subscribers.findOne({ id });
    return subscriber || undefined;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const subscriber = await this.subscribers.findOne({ email });
    return subscriber || undefined;
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const id = randomUUID();
    const newSubscriber: Subscriber = { ...subscriber, id, createdAt: new Date() };
    await this.subscribers.insertOne(newSubscriber);
    return newSubscriber;
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    const result = await this.subscribers.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Coupon methods
  async getAllCoupons(): Promise<Coupon[]> {
    return await this.coupons.find({}).sort({ createdAt: -1 }).toArray();
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    const coupon = await this.coupons.findOne({ id });
    return coupon || undefined;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const coupon = await this.coupons.findOne({ code: code.toUpperCase() });
    return coupon || undefined;
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const id = randomUUID();
    const newCoupon: Coupon = { 
      ...coupon, 
      id, 
      code: coupon.code.toUpperCase(),
      usedCount: 0,
      createdAt: new Date() 
    };
    await this.coupons.insertOne(newCoupon);
    return newCoupon;
  }

  async updateCoupon(id: string, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const updateData = { ...coupon };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    
    const result = await this.coupons.findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const result = await this.coupons.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async validateCoupon(code: string, orderAmount: number): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) {
      return { valid: false, error: 'Coupon not found' };
    }

    if (!coupon.isActive) {
      return { valid: false, error: 'Coupon is not active' };
    }

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return { valid: false, error: 'Coupon is not yet valid' };
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return { valid: false, error: 'Coupon has expired' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'Coupon usage limit reached' };
    }

    if (coupon.minimumOrderAmount && orderAmount < coupon.minimumOrderAmount) {
      return { valid: false, error: `Minimum order amount is ₹${coupon.minimumOrderAmount}` };
    }

    return { valid: true, coupon };
  }

  async applyCoupon(code: string): Promise<boolean> {
    const result = await this.coupons.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } },
      { returnDocument: 'after' }
    );
    return !!result;
  }

  async disconnect() {
    await this.client.close();
  }
}