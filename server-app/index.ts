import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
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
    process.env.CLIENT_URL || 'https://shuddh-thindhi-1.onrender.com',
    'https://shuddh-thindhi-1.onrender.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Initialize Passport
const { default: passport, configureGoogleOAuth } = await import("./auth");
configureGoogleOAuth(); // Configure Google OAuth after env vars are loaded
app.use(passport.initialize());
app.use(passport.session());

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
    const port = parseInt(process.env.PORT || '5001', 10);
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
