import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Lazy import vite.config only when needed (development only)
  // This prevents the import from failing in serverless environments
  let viteConfig;
  try {
    // Try .ts extension first (for tsx in development), then .js (for compiled)
    try {
      viteConfig = await import("../vite.config.ts");
    } catch {
      viteConfig = await import("../vite.config.js");
    }
  } catch (error) {
    throw new Error(
      `Failed to load vite.config: ${error instanceof Error ? error.message : String(error)}. ` +
      `This function should only be called in development mode.`
    );
  }
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...(viteConfig.default || viteConfig),
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Resolve path relative to project root (not server directory)
  // In production, static files are in dist/public
  // In Vercel, try multiple possible paths
  const possiblePaths = [
    path.resolve(import.meta.dirname, "..", "dist", "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.join(process.cwd(), "dist", "public"),
  ];

  let distPath: string | null = null;
  for (const possiblePath of possiblePaths) {
    try {
      if (fs.existsSync(possiblePath)) {
        distPath = possiblePath;
        break;
      }
    } catch {
      // Continue to next path
    }
  }

  if (distPath) {
    app.use(express.static(distPath));
    
    // fall through to index.html if the file doesn't exist (SPA routing)
    app.use("*", (_req, res) => {
      // Skip API routes - they're handled by registerRoutes
      if (_req.path.startsWith("/api")) {
        return res.status(404).json({ error: "API route not found" });
      }
      
      const indexPath = path.resolve(distPath!, "index.html");
      try {
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          // In Vercel, static files might be served separately
          // Return a simple HTML response for SPA routing
          res.status(200).send(`
            <!DOCTYPE html>
            <html>
              <head><title>Loading...</title></head>
              <body>
                <div id="root"></div>
                <script>window.location.reload();</script>
              </body>
            </html>
          `);
        }
      } catch (error) {
        console.error("Error serving index.html:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  } else {
    // In Vercel serverless environment, static files are served by Vercel's CDN
    // We only handle API routes and SPA fallback for non-API routes
    app.use("*", (_req, res) => {
      // API routes are handled by registerRoutes, so this shouldn't be reached for /api/*
      // For non-API routes, Vercel should serve static files, but if they reach here,
      // return index.html content for SPA routing
      if (!_req.path.startsWith("/api")) {
        res.status(200).setHeader("Content-Type", "text/html").send(`
          <!DOCTYPE html>
          <html>
            <head><title>Loading...</title></head>
            <body>
              <div id="root"></div>
              <script>window.location.reload();</script>
            </body>
          </html>
        `);
      } else {
        res.status(404).json({ error: "API route not found" });
      }
    });
  }
}
