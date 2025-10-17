# Design Guidelines: Shuddh Swad E-Commerce Platform

## Design Approach

**Reference-Based Approach** - Drawing inspiration from modern food e-commerce platforms (Shopify stores, Etsy, food delivery apps) while maintaining authentic Indian traditional aesthetics. The design should evoke warmth, trust, and appetite appeal while providing seamless shopping and admin experiences.

**Key Design Principles:**
- Authenticity meets modernity: Traditional Indian cultural elements with contemporary UI patterns
- Visual appetite appeal: High-quality product imagery takes center stage
- Trust and transparency: Clean layouts that build customer confidence
- Efficient admin control: Intuitive dashboard for complete site management

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary Brand: 25 85% 55% (Warm orange - traditional Indian spice color)
- Primary Hover: 25 85% 45%
- Secondary: 45 70% 50% (Golden accent for premium feel)
- Background: 0 0% 98% (Warm off-white)
- Surface: 0 0% 100% (Pure white for cards)
- Text Primary: 20 10% 15% (Warm dark brown)
- Text Secondary: 20 8% 45%
- Success: 140 60% 45% (Order confirmations)
- Error: 0 70% 50% (Out of stock, errors)
- Border: 20 10% 88%

**Dark Mode:**
- Primary Brand: 25 80% 60%
- Primary Hover: 25 80% 50%
- Background: 20 8% 12%
- Surface: 20 8% 16%
- Text Primary: 30 10% 92%
- Text Secondary: 30 8% 65%
- Border: 20 10% 25%

### B. Typography

**Font Families:**
- Display/Headings: 'Playfair Display' (traditional elegance for brand identity)
- Body/UI: 'Inter' (modern, clean readability)
- Accent/Numbers: 'Space Grotesk' (pricing, counts, metrics)

**Type Scale:**
- Hero Heading: text-5xl md:text-6xl lg:text-7xl font-bold
- Section Heading: text-3xl md:text-4xl font-bold
- Product Title: text-xl font-semibold
- Body Text: text-base
- Small Text: text-sm
- Price Display: text-2xl font-bold (Space Grotesk)
- Sale Badge: text-xs font-semibold uppercase

### C. Layout System

**Spacing Primitives:** Consistent use of Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4 (mobile), p-6 (tablet), p-8 (desktop)
- Section spacing: py-12 (mobile), py-16 (tablet), py-20 (desktop)
- Card spacing: p-6
- Admin panel spacing: p-6 for cards, p-8 for main containers

**Grid Systems:**
- Product Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Review Images: grid-cols-2 md:grid-cols-4 lg:grid-cols-6
- Admin Dashboard: grid-cols-1 lg:grid-cols-3 (metrics cards)
- Values Section: grid-cols-1 md:grid-cols-2 lg:grid-cols-4

**Container Widths:**
- Main content: max-w-7xl mx-auto
- Product details: max-w-6xl mx-auto
- Story/mission text: max-w-3xl mx-auto
- Admin panel: Full width with sidebar (max-w-screen-2xl)

### D. Component Library

**Navigation:**
- Sticky header with backdrop blur effect
- Logo (left), navigation links (center), cart icon with badge (right)
- Mobile: Hamburger menu with slide-in drawer
- Cart badge: Circular with count, primary background
- Admin: Sidebar navigation with icon + label pattern

**Product Cards:**
- Aspect ratio 1:1 images with hover zoom effect
- Rounded corners (rounded-xl)
- Shadow on hover (hover:shadow-xl transition)
- Sale badge (absolute top-right, rounded-full, error background)
- Price: Regular strikethrough + Sale in primary color
- "Add to Cart" button: Full width, primary background
- "Sold Out" overlay: Semi-transparent with centered text

**Hero Banner:**
- Full-width carousel with smooth transitions
- Image aspect: aspect-[16/9] md:aspect-[21/9]
- Sliding text banner above: "Free Shipping on Prepaid Orders"
- Navigation dots at bottom center
- Auto-play with 5-second intervals

**Reviews Section:**
- Masonry-style image grid for customer photos
- Infinite horizontal scroll animation
- Lightbox on image click
- Duplicated images for seamless loop effect

**Admin Dashboard:**
- Sidebar: Fixed left, icons + labels, active state highlighting
- Main content area: Grid of metric cards + data tables
- Metric cards: Icon + number + label + trend indicator
- Tables: Zebra striping, sortable headers, action buttons
- Forms: Label above input, helper text below, error states
- Image upload: Drag-drop zone with preview thumbnails

**Forms & Inputs:**
- Floating labels for inputs
- Dark mode: Inputs with border, focused border in primary
- File upload: Bordered dashed zone with upload icon
- Multi-image upload: Grid preview with delete buttons
- Select dropdowns: Custom styled with chevron icon
- Rich text editor for product/content descriptions

**Buttons:**
- Primary: bg-primary text-white, rounded-lg, px-6 py-3
- Secondary: bg-secondary text-white
- Outline: border-2 border-primary text-primary, backdrop-blur-md for image overlays
- Ghost: No background, hover:bg-primary/10
- Icon buttons: Rounded-full, p-2, hover:bg-surface
- Loading state: Spinner icon with disabled opacity

**Data Display:**
- Order cards: Border, rounded-lg, status badge, customer info
- Product list: Image thumbnail + details in row layout
- Stats cards: Large number, icon, label, change percentage
- Empty states: Icon + message + CTA button

**Modals & Overlays:**
- Backdrop blur with semi-transparent overlay
- Centered modal with max-w-2xl, rounded-xl, shadow-2xl
- Close button: Absolute top-right, ghost style
- Confirm dialogs: Icon + heading + description + action buttons

### E. Imagery Strategy

**Product Photography:**
- High-quality food photography with natural lighting
- Consistent white/neutral backgrounds for product catalog
- Lifestyle shots showing products in context (packaging, serving)
- 1:1 aspect ratio for grid consistency

**Hero/Banner Images:**
- Wide aspect ratio showcasing products and brand lifestyle
- Warm, appetizing color grading
- Text overlay with high contrast (dark overlay for light text)

**Review Images:**
- User-generated content showing products in real settings
- Various aspect ratios displayed in masonry grid
- Authentic customer photos building trust

**Admin Panel:**
- Placeholder images with upload prompts
- Multi-image gallery with primary image selection
- Preview thumbnails in 100x100 rounded squares

**Icon System:**
- Heroicons for UI elements (shopping cart, menu, user, etc.)
- Custom food/product icons where needed (described in comments)
- Consistent stroke width (2px) and sizing (w-6 h-6 standard)

### F. Interaction Patterns

**Minimal Animations:**
- Smooth transitions on hover (transform scale-105, shadow changes)
- Fade-in on scroll for value cards (stagger effect)
- Carousel slide transitions (300ms ease-in-out)
- Cart count badge bounce on update
- No distracting or excessive animations

**Loading States:**
- Skeleton screens for product grids (shimmer effect)
- Spinner for admin operations (centered, primary color)
- Progress bar for image uploads

**Feedback:**
- Toast notifications (top-right): Success (green), Error (red), Info (blue)
- Form validation: Real-time with error text below inputs
- Button states: Loading spinner replaces text, disabled opacity

## Page-Specific Guidelines

**Storefront Pages:**
- Hero with promotional messaging and imagery
- Featured products section with "Our Products" heading
- Customer reviews with image gallery
- Brand story sections (Mission, Values, Journey)
- Newsletter signup in footer
- Mobile-first responsive design

**Admin Panel:**
- Dashboard: Metrics overview, recent orders, low stock alerts
- Products: CRUD interface with image management, inventory tracking
- Orders: Filterable list, status updates, customer details
- Reviews: Image moderation, approve/delete functionality
- Content: Banner editor, brand story editor, values management
- Settings: Site configuration, email templates, admin users

**Vertical Rhythm:**
- Consistent py-16 md:py-20 for major sections
- py-8 md:py-12 for subsections
- Breathing room around CTAs (mt-8)

This design creates a warm, trustworthy e-commerce experience that honors traditional Indian aesthetics while providing modern functionality for both customers and administrators.