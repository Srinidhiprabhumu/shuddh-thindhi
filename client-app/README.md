# Shuddh Thindi - Client App

React frontend application for the Shuddh Thindi e-commerce platform.

## Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS + Shadcn/ui
- React Query (TanStack Query)
- Zustand for state management

## Environment Setup

1. Copy environment template:
```bash
cp .env.example .env
```

2. Update the API URL if needed:
```
VITE_API_URL=http://localhost:5000
```

## Development

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features
- Product catalog and search
- Shopping cart
- User authentication
- Order management
- Admin panel
- Responsive design

## API Integration
The client connects to the server API using the URL specified in `VITE_API_URL` environment variable.
Default: http://localhost:5000

## Independent Development
This client app runs completely independently from the server. Make sure the server is running on the configured API URL for full functionality.