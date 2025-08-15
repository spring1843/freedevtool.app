import express, { type Request, type Response, type NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Enable gzip compression for all responses
app.use(compression({
  // Set compression level (1-9, 6 is default, 9 is best compression)
  level: 9,
  // Set compression threshold (only compress if response is larger than this)
  threshold: 1024,
  // Compress these MIME types
  filter: (req: Request, res: Response) => {
    // Don't compress if the client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    const contentType = res.getHeader('content-type');
    if (typeof contentType === 'string') {
      // Compress text-based content (JS, CSS, HTML, JSON, SVG, etc.)
      return /text|javascript|css|json|xml|html|svg|application\/javascript|application\/json/.test(contentType);
    }
    
    // Use default compression filter as fallback
    return compression.filter(req, res);
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add cache headers for index.html: cache for 24 hours, then must revalidate
app.use((req, res, next) => {
  // Check if this is a request for the root HTML file or any HTML route
  if (req.path === '/' || (!req.path.includes('.') && !req.path.startsWith('/api'))) {
    // Set cache headers: cache for 24 hours (86400 seconds), then revalidate
    res.set({
      'Cache-Control': 'public, max-age=86400, must-revalidate',
      'Vary': 'Accept-Encoding'
    });
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const {path} = req;
  let capturedJsonResponse: Record<string, unknown> | undefined;

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
        logLine = `${logLine.slice(0, 79)  }…`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
