import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
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

  // Parse command line arguments for port override
  const args = process.argv.slice(2);
  const portArg = args.find(arg => arg.startsWith('--port='));
  const cmdLinePort = portArg ? parseInt(portArg.split('=')[1], 10) : null;
  
  // Priority: command line argument > environment variable > default 5000
  const port = cmdLinePort || parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
