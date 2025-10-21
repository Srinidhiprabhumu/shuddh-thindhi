import { API_URL } from './config';

const API_BASE_URL = API_URL;

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // For 401 errors on auth check endpoints, don't throw - return null instead
        if (response.status === 401 && (endpoint === '/api/auth/user' || endpoint === '/api/admin/me')) {
          return null as T;
        }

        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // For auth check endpoints, don't log errors for 401s
      if (!(endpoint === '/api/auth/user' || endpoint === '/api/admin/me')) {
        console.error(`API request failed: ${endpoint}`, error);
      }
      throw error;
    }
  }

  // Auth endpoints
  auth = {
    login: (email: string, password: string) =>
      this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    signup: (email: string, password: string, name: string) =>
      this.request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }),

    logout: () =>
      this.request('/api/auth/logout', { method: 'POST' }),

    getUser: () =>
      this.request('/api/auth/user'),

    googleLogin: () => {
      window.location.href = `${this.baseUrl}/api/auth/google`;
    },
  };

  // Admin endpoints
  admin = {
    login: (username: string, password: string) =>
      this.request('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),

    logout: () =>
      this.request('/api/admin/logout', { method: 'POST' }),

    getMe: () =>
      this.request('/api/admin/me'),

    setup: (username: string, password: string) =>
      this.request('/api/admin/setup', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),

    // Upload
    upload: (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      return this.request('/api/admin/upload', {
        method: 'POST',
        headers: {}, // Remove Content-Type to let browser set it for FormData
        body: formData,
      });
    },

    // Orders
    orders: {
      getAll: () => this.request('/api/admin/orders'),
      getById: (id: string) => this.request(`/api/admin/orders/${id}`),
      updateStatus: (id: string, status: string) =>
        this.request(`/api/admin/orders/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }),
    },

    // Products
    products: {
      create: (product: any) =>
        this.request('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(product),
        }),
      update: (id: string, product: any) =>
        this.request(`/api/admin/products/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(product),
        }),
      delete: (id: string) =>
        this.request(`/api/admin/products/${id}`, { method: 'DELETE' }),
    },
  };

  // Public endpoints
  products = {
    getAll: () => this.request('/api/products'),
    getFeatured: () => this.request('/api/products/featured'),
    getById: (id: string) => this.request(`/api/products/${id}`),
  };

  orders = {
    getMyOrders: () => this.request('/api/orders'),
    create: (order: any) =>
      this.request('/api/orders', {
        method: 'POST',
        body: JSON.stringify(order),
      }),
  };

  // Other endpoints can be added here following the same pattern
  reviews = {
    getApproved: () => this.request('/api/reviews/approved'),
    create: (review: any) =>
      this.request('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(review),
      }),
  };

  banners = {
    getAll: () => this.request('/api/banners'),
  };

  brandContent = {
    getAll: () => this.request('/api/brand-content'),
  };

  subscribers = {
    create: (email: string) =>
      this.request('/api/subscribers', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  };

  coupons = {
    validate: (code: string, orderAmount: number) =>
      this.request('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, orderAmount }),
      }),
    apply: (code: string) =>
      this.request('/api/coupons/apply', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
  };
}

export const api = new ApiClient(API_BASE_URL);
export default api;