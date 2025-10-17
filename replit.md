# Shuddh Swad - E-Commerce Platform

## Overview
A modern e-commerce platform for traditional Indian snacks with a comprehensive admin panel. Built with React, TypeScript, Express, and in-memory storage.

## Project Structure

### Frontend (Client)
- **Framework**: React + Vite + TypeScript + Wouter (routing)
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: Zustand (cart + admin auth)
- **Data Fetching**: React Query
- **UI Components**: Shadcn/ui

### Backend (Server)
- **Framework**: Express.js
- **Storage**: In-memory storage (MemStorage)
- **Validation**: Zod schemas

## Key Features

### Storefront
1. **Hero Carousel** - Rotating banners with promotional content
2. **Product Catalog** - Grid view with search functionality
3. **Product Details** - Image gallery, pricing, inventory status
4. **Shopping Cart** - Persistent cart with Zustand
5. **Customer Reviews** - Image gallery with approval system
6. **Brand Story** - Mission, values, and company history
7. **Newsletter Subscription** - Email collection for marketing

### Admin Panel
1. **Dashboard** - Metrics overview (products, orders, revenue, low stock)
2. **Product Management** - CRUD operations with image support
3. **Order Management** - View orders, update status
4. **Review Moderation** - Approve/delete customer reviews
5. **Banner Management** - Configure hero carousel
6. **Brand Content Editor** - Update mission, story, values
7. **Subscriber Management** - View and export newsletter subscribers

## Authentication
- Admin panel protected with login (username: admin, password: admin123)
- Session persistence with Zustand

## Design System
- **Fonts**: Playfair Display (serif), Inter (sans), Space Grotesk (mono)
- **Primary Color**: Warm orange (#E8763F) for brand identity
- **Color Scheme**: Warm, appetizing palette for food e-commerce
- **Components**: Hover states, smooth transitions, responsive design

## API Endpoints

### Public Endpoints
- `GET /api/products` - List all products
- `GET /api/products/featured` - Featured products
- `GET /api/products/:id` - Single product
- `GET /api/banners` - Hero banners
- `GET /api/reviews/approved` - Approved reviews
- `GET /api/brand-content` - Brand content (mission, story, values)
- `POST /api/subscribers` - Subscribe to newsletter

### Admin Endpoints
- `POST /api/admin/login` - Admin authentication
- `POST /api/products` - Create product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/orders` - List all orders
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/reviews` - All reviews (including pending)
- `PATCH /api/reviews/:id/approve` - Approve review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/banners` - Create banner
- `PATCH /api/banners/:id` - Update banner
- `DELETE /api/banners/:id` - Delete banner
- `POST /api/brand-content` - Upsert brand content
- `GET /api/subscribers` - List subscribers
- `DELETE /api/subscribers/:id` - Remove subscriber

## Data Models

### Product
- name, description, price, regularPrice, images[], category, inventory, isFeatured

### Order
- customerName, customerEmail, customerPhone, shippingAddress, items, totalAmount, status, createdAt

### Review
- customerName, image, isApproved, createdAt

### Banner
- image, title, subtitle, order, isActive

### BrandContent
- section, title, content

### Subscriber
- email, createdAt

## Seed Data
The application comes with pre-seeded data:
- 1 Admin account (admin/admin123)
- 3 Products (Traditional Thekua varieties)
- 1 Hero banner
- 1 Customer review
- Brand content (mission, story, values)

## Development

### Running the Project
```bash
npm run dev
```
Starts both Express backend and Vite frontend on the same port.

### Admin Access
Navigate to `/admin/login` and use:
- Username: admin
- Password: admin123

## Recent Changes
- Initial MVP implementation (October 17, 2025)
- Complete storefront with product catalog, cart, and brand pages
- Full admin panel with all CRUD operations
- Integrated frontend with backend APIs
- Added toast notifications for user feedback
- Implemented persistent cart with Zustand

## Architecture Decisions
- **In-Memory Storage**: Chosen for rapid prototyping and simplicity
- **Zustand for State**: Lightweight, persistent storage for cart and auth
- **React Query**: Efficient data fetching with automatic caching
- **Shadcn/ui**: Consistent, accessible component library
- **Design-First Approach**: Comprehensive design guidelines followed throughout
