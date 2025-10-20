# Shuddh Thindi - Server App

Node.js/Express backend API for the Shuddh Thindi e-commerce platform.

## Tech Stack
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- Passport.js (Local + Google OAuth)
- Drizzle ORM
- CORS enabled for client communication

## Environment Setup

1. Copy environment template:
```bash
cp .env.example .env
```

2. Fill in your environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `SESSION_SECRET` - Session signing secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:3000)
- `PORT` - Server port (default: 5000)

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload (runs on port 5000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push      # Push schema changes
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
```

## API Endpoints
- `/api/products` - Product management
- `/api/auth` - Authentication
- `/api/orders` - Order management
- `/api/admin` - Admin operations
- `/api/banners` - Banner management
- `/api/reviews` - Review system
- `/api/subscribers` - Newsletter subscriptions

## Independent Development
This server runs completely independently with its own node_modules and environment.
CORS is configured to allow requests from the client application.

## Production Deployment
The server can be deployed to any Node.js hosting platform:
- Railway
- Render
- DigitalOcean App Platform
- AWS EC2
- Google Cloud Run
- Heroku