import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { registerRoutes } from "./routes";
import { initializeStorage } from "./storage";

// Simple logging function
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    process.env.CLIENT_URL || 'https://shuddh-thindhi.onrender.com',
    'http://localhost:3000',
    'https://shuddh-thindhi.onrender.com',
    // Add common static site patterns
    /^https:\/\/.*\.onrender\.com$/,
    /^https:\/\/.*\.netlify\.app$/,
    /^https:\/\/.*\.vercel\.app$/
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

// Additional headers for cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from attached_assets directory with proper headers
// Serve static files from attached_assets directory with proper headers
app.use('/attached_assets', express.static(path.join(__dirname, 'attached_assets'), {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set proper MIME types for images
    if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
    // Enable CORS for images
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Serve client build files
const clientBuildPath = path.join(__dirname, '../client-app/dist');
app.use(express.static(clientBuildPath, {
  maxAge: '1d',
  etag: true
}));

// Session configuration with MongoDB store for persistence
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  touchAfter: 24 * 3600, // lazy session update (24 hours)
  ttl: 24 * 60 * 60, // session TTL (24 hours)
  autoRemove: 'native', // auto remove expired sessions
  crypto: {
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development'
  }
});

// Add event listeners for session store
sessionStore.on('connected', () => {
  console.log('✅ MongoDB session store connected');
});

sessionStore.on('error', (error: any) => {
  console.error('❌ MongoDB session store error:', error);
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development',
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid',
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
    domain: undefined
  },
  // Add session debugging
  genid: function(req) {
    const id = require('crypto').randomUUID();
    console.log('🔑 Generating new session ID:', id, '(stored in MongoDB)');
    return id;
  }
}));

// Initialize Passport
const { default: passport, configureGoogleOAuth } = await import("./auth");
configureGoogleOAuth(); // Configure Google OAuth after env vars are loaded
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware for authentication
app.use((req: any, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`${req.method} ${req.path} - Session: ${req.sessionID}, Auth: ${req.isAuthenticated ? req.isAuthenticated() : false}, User: ${req.user ? req.user.email : 'none'}`);
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Initialize storage (MongoDB with fallback to memory)
    await initializeStorage();

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // Start the server
    const port = parseInt(process.env.PORT || '10000', 10);
    server.listen(port, '0.0.0.0', () => {
      log(`API server running on port ${port}`);
      log(`CORS enabled for: ${process.env.CLIENT_URL || 'https://shuddh-thindhi-1.onrender.com'}`);
      log(`Admin setup available at: https://shuddh-thindhi.onrender.com/api/admin/setup`);
      log(`Static files served from: https://shuddh-thindhi.onrender.com/attached_assets/`);
    });

    // WebSocket disabled due to compatibility issues
    // Using polling-based updates instead
    console.log('WebSocket disabled - using polling for real-time updates');
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
})();
