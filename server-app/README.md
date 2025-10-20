# Shuddh Thindi - Server App

Node.js/Express backend API for the Shuddh Thindi e-commerce platform.

## Tech Stack
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- Passport.js (Local + Google OAuth)
- Drizzle ORM
- Vercel Serverless Functions

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Push database schema
npm run db:push
```

## Environment Variables
Copy `.env.example` to `.env` and fill in your values:

- `DATABASE_URL` - PostgreSQL connection string
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `SESSION_SECRET` - Session signing secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

## API Endpoints
- `/api/products` - Product management
- `/api/auth` - Authentication
- `/api/orders` - Order management
- `/api/admin` - Admin operations