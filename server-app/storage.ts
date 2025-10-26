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


export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  getAdmin(id: string): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  getAllAdmins(): Promise<Admin[]>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  getAllProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  getAllOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  getAllReviews(): Promise<Review[]>;
  getApprovedReviews(): Promise<Review[]>;
  getReview(id: string): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  approveReview(id: string): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;

  getAllBanners(): Promise<Banner[]>;
  getBanner(id: string): Promise<Banner | undefined>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: string, banner: Partial<InsertBanner>): Promise<Banner | undefined>;
  deleteBanner(id: string): Promise<boolean>;
  reorderBanners(bannerIds: string[]): Promise<void>;

  getAllBrandContent(): Promise<BrandContent[]>;
  getBrandContentBySection(section: string): Promise<BrandContent | undefined>;
  upsertBrandContent(content: InsertBrandContent): Promise<BrandContent>;

  getAllSubscribers(): Promise<Subscriber[]>;
  getSubscriber(id: string): Promise<Subscriber | undefined>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  deleteSubscriber(id: string): Promise<boolean>;

  getAllCoupons(): Promise<Coupon[]>;
  getCoupon(id: string): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<boolean>;
  validateCoupon(code: string, orderAmount: number): Promise<{ valid: boolean; coupon?: Coupon; error?: string }>;
  applyCoupon(code: string): Promise<boolean>;

  getAllAnnouncements(): Promise<Announcement[]>;
  getActiveAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<boolean>;
  reorderAnnouncements(announcementIds: string[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private admins: Map<string, Admin>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private reviews: Map<string, Review>;
  private banners: Map<string, Banner>;
  private brandContent: Map<string, BrandContent>;
  private subscribers: Map<string, Subscriber>;
  private coupons: Map<string, Coupon>;
  private announcements: Map<string, Announcement>;

  constructor() {
    this.users = new Map();
    this.admins = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.reviews = new Map();
    this.banners = new Map();
    this.brandContent = new Map();
    this.subscribers = new Map();
    this.coupons = new Map();
    this.announcements = new Map();

    this.seedData();
  }

  private seedData() {
    // Admin credentials should only be in MongoDB, not in memory storage
    // This is just for fallback/testing purposes

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
    products.forEach(p => this.products.set(p.id, p));

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
    banners.forEach(b => this.banners.set(b.id, b));

    const reviews: Review[] = [
      {
        id: "review-1",
        customerName: "Priya Sharma",
        image: review1,
        isApproved: true,
        createdAt: new Date(),
      },
    ];
    reviews.forEach(r => this.reviews.set(r.id, r));

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
        content: "The journey of Shuddh Thindhi began with a powerful, personal experience. Our 16-year-old founder's simple desire for a local thekua turned into a harsh lesson on food hygiene. This single incident sparked a powerful question: Why can't traditional snacks be both delicious and safe?\n\nThis was followed by another realization during Chhath Puja—the best snacks were scarce and seasonal. This scarcity and lack of hygiene wasn't just a problem; it was an opportunity to create something better.",
      },
      {
        id: "content-values",
        section: "values",
        title: "Our Philosophy of Purity",
        content: "Authentic Recipes: We stay true to the traditions. Our recipes are passed down through generations, ensuring every bite is a genuine taste of heritage.\n\nUncompromising Hygiene: From our kitchen to your home, we maintain the strictest hygiene standards. Because good taste begins with good health.\n\nAvailable for All: Great taste shouldn't be seasonal or exclusive. We make our traditional snacks affordable and available all year round, for everyone to enjoy.",
      },
    ];
    brandContentData.forEach(c => this.brandContent.set(c.id, c));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.googleId === googleId);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      googleId: user.googleId || null,
      password: user.password || null,
      avatar: user.avatar || null,
      isEmailVerified: user.isEmailVerified || false
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...user };
    this.users.set(id, updated);
    return updated;
  }

  async getAdmin(id: string): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(a => a.username === username);
  }

  async getAllAdmins(): Promise<Admin[]> {
    return Array.from(this.admins.values());
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const admin: Admin = { ...insertAdmin, id };
    this.admins.set(id, admin);
    return admin;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isFeatured);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = {
      ...product,
      id,
      regularPrice: product.regularPrice || null,
      inventory: product.inventory || 0,
      isFeatured: product.isFeatured || false
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...product };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const newOrder: Order = {
      ...order,
      id,
      createdAt: new Date(),
      status: order.status || 'pending',
      userId: order.userId || null,
      couponCode: order.couponCode || null,
      discountAmount: order.discountAmount || null
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const updated = { ...order, status };
    this.orders.set(id, updated);
    return updated;
  }

  async getAllReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getApprovedReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.isApproved);
  }

  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = randomUUID();
    const newReview: Review = {
      ...review,
      id,
      createdAt: new Date(),
      isApproved: review.isApproved || false
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async approveReview(id: string): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    const updated = { ...review, isApproved: true };
    this.reviews.set(id, updated);
    return updated;
  }

  async deleteReview(id: string): Promise<boolean> {
    return this.reviews.delete(id);
  }

  async getAllBanners(): Promise<Banner[]> {
    return Array.from(this.banners.values()).sort((a, b) => a.order - b.order);
  }

  async getBanner(id: string): Promise<Banner | undefined> {
    return this.banners.get(id);
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const id = randomUUID();
    const maxOrder = Math.max(...Array.from(this.banners.values()).map(b => b.order), -1);
    const newBanner: Banner = {
      ...banner,
      id,
      order: maxOrder + 1,
      title: banner.title || null,
      subtitle: banner.subtitle || null,
      isActive: banner.isActive || false
    };
    this.banners.set(id, newBanner);
    return newBanner;
  }

  async updateBanner(id: string, banner: Partial<InsertBanner>): Promise<Banner | undefined> {
    const existing = this.banners.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...banner };
    this.banners.set(id, updated);
    return updated;
  }

  async deleteBanner(id: string): Promise<boolean> {
    return this.banners.delete(id);
  }

  async reorderBanners(bannerIds: string[]): Promise<void> {
    bannerIds.forEach((id, index) => {
      const banner = this.banners.get(id);
      if (banner) {
        this.banners.set(id, { ...banner, order: index });
      }
    });
  }

  async getAllBrandContent(): Promise<BrandContent[]> {
    return Array.from(this.brandContent.values());
  }

  async getBrandContentBySection(section: string): Promise<BrandContent | undefined> {
    return Array.from(this.brandContent.values()).find(c => c.section === section);
  }

  async upsertBrandContent(content: InsertBrandContent): Promise<BrandContent> {
    const existing = await this.getBrandContentBySection(content.section);
    if (existing) {
      const updated = { ...existing, ...content };
      this.brandContent.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const newContent: BrandContent = { ...content, id };
    this.brandContent.set(id, newContent);
    return newContent;
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getSubscriber(id: string): Promise<Subscriber | undefined> {
    return this.subscribers.get(id);
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(s => s.email === email);
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const id = randomUUID();
    const newSubscriber: Subscriber = { ...subscriber, id, createdAt: new Date() };
    this.subscribers.set(id, newSubscriber);
    return newSubscriber;
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    return this.subscribers.delete(id);
  }

  // Coupon methods
  async getAllCoupons(): Promise<Coupon[]> {
    return Array.from(this.coupons.values());
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    return this.coupons.get(id);
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return Array.from(this.coupons.values()).find(c => c.code === code);
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const id = randomUUID();
    const newCoupon: Coupon = {
      ...coupon,
      id,
      usedCount: 0,
      isActive: coupon.isActive ?? true,
      createdAt: new Date(),
      minimumOrderAmount: coupon.minimumOrderAmount ?? null,
      maximumDiscountAmount: coupon.maximumDiscountAmount ?? null,
      usageLimit: coupon.usageLimit ?? null,
      validUntil: coupon.validUntil ?? null
    };
    this.coupons.set(id, newCoupon);
    return newCoupon;
  }

  async updateCoupon(id: string, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const existing = this.coupons.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...coupon };
    this.coupons.set(id, updated);
    return updated;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    return this.coupons.delete(id);
  }

  async validateCoupon(code: string, orderAmount: number): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
    const coupon = await this.getCouponByCode(code);

    if (!coupon) {
      return { valid: false, error: 'Coupon not found' };
    }

    if (!coupon.isActive) {
      return { valid: false, error: 'Coupon is not active' };
    }

    if (coupon.validUntil && new Date() > coupon.validUntil) {
      return { valid: false, error: 'Coupon has expired' };
    }

    if (coupon.minimumOrderAmount && orderAmount < coupon.minimumOrderAmount) {
      return { valid: false, error: `Minimum order amount is ₹${coupon.minimumOrderAmount}` };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'Coupon usage limit reached' };
    }

    return { valid: true, coupon };
  }

  async applyCoupon(code: string): Promise<boolean> {
    const coupon = await this.getCouponByCode(code);
    if (!coupon) return false;

    coupon.usedCount = (coupon.usedCount || 0) + 1;
    this.coupons.set(coupon.id, coupon);
    return true;
  }

  // Announcement methods
  async getAllAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).sort((a, b) => a.order - b.order);
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values())
      .filter(a => a.isActive)
      .sort((a, b) => a.order - b.order);
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const id = randomUUID();
    const maxOrder = Math.max(...Array.from(this.announcements.values()).map(a => a.order), -1);
    const newAnnouncement: Announcement = {
      ...announcement,
      id,
      order: maxOrder + 1,
      backgroundColor: announcement.backgroundColor || null,
      textColor: announcement.textColor || null,
      isActive: announcement.isActive ?? true,
      createdAt: new Date()
    };
    this.announcements.set(id, newAnnouncement);
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const existing = this.announcements.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...announcement };
    this.announcements.set(id, updated);
    return updated;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    return this.announcements.delete(id);
  }

  async reorderAnnouncements(announcementIds: string[]): Promise<void> {
    announcementIds.forEach((id, index) => {
      const announcement = this.announcements.get(id);
      if (announcement) {
        this.announcements.set(id, { ...announcement, order: index });
      }
    });
  }
}

import { MongoStorage } from './mongodb-storage';

// MongoDB Atlas only - no fallback
const mongoStorage = new MongoStorage();

export const initializeStorage = async (): Promise<void> => {
  console.log('🔄 Initializing MongoDB Atlas connection...');
  await mongoStorage.connect();
  console.log('✅ MongoDB Atlas connected - all data persisted to cloud database');
};

// Direct export of MongoDB storage
export const storage = mongoStorage;
