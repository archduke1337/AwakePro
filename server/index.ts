import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
    console.log('Starting server...', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? 'YES' : 'NO',
      PORT: process.env.PORT || '5000'
    });

    // Initialize routes with error handling
    let server;
    try {
      server = await registerRoutes(app);
      console.log('✅ Routes registered successfully');
    } catch (routeError) {
      console.error('❌ Failed to register routes:', routeError);
      // Create a minimal server for fallback
      const { createServer } = await import('http');
      server = createServer(app);
      
      // Add basic error endpoint
      app.get('/api/error', (req, res) => {
        res.json({ 
          status: 'error', 
          message: 'Server running with limited functionality',
          error: routeError instanceof Error ? routeError.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      });
    }

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('Request error:', { status, message, error: err });
      res.status(status).json({ message });
    });

    // Setup static serving or Vite based on environment
    try {
      if (app.get("env") === "development") {
        console.log('Setting up Vite for development...');
        await setupVite(app, server);
      } else {
        console.log('Setting up static file serving for production...');
        serveStatic(app);
      }
    } catch (setupError) {
      console.error('❌ Failed to setup Vite/static serving:', setupError);
      // Continue without Vite/static serving
    }

    // Start server
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`✅ Server started successfully on port ${port}`);
      console.log('Server environment:', {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL ? 'YES' : 'NO',
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT SET'
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    // Don't exit in Vercel environment
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
})();
