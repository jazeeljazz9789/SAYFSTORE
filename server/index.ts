import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import ordersRouter from "./routes/orders";
import productsRouter from "./routes/products";
import contactRouter from "./routes/contact";
import { securityHeaders, sanitizeInput, createRateLimiter } from "./middleware/security";

dotenv.config();

const app = express();
app.disable("x-powered-by");
const PORT = process.env.PORT || 5000;

// Trust proxy header should only be enabled if explicitly required and configured for a known reverse proxy architecture.
// app.set("trust proxy", 1);

// 1. Security Headers Middleware
app.use(securityHeaders());

// 2. CORS Configuration
const isProd = process.env.NODE_ENV === "production";
const allowedOrigins = isProd
  ? [process.env.FRONTEND_URL].filter(Boolean) as string[]
  : [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5000"].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
  })
);

// 3. Body Parsing & Size Limit (Prevent payload flooding)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 4. Input Sanitization (NoSQL injection prevention)
app.use(sanitizeInput());

// 5. Request Logging (Clean production log format)
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== "test") {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// 6. Rate Limiters
// NOTE: The current rate limiter uses an in-memory store.
// This is perfectly suitable and secure for a single-server production deployment.
// However, if the application is horizontally scaled across multiple servers (e.g., using a load balancer),
// this should be replaced with a shared store like Redis to ensure consistent rate limiting across all instances.
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  maxRequests: 200,
  message: "Too many requests from this IP. Please try again later.",
});

const orderLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  maxRequests: 10,
  message: "Too many order requests. Please wait a few minutes before submitting again.",
});

const contactLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  maxRequests: 5,
  message: "Too many contact form submissions. Please try again later.",
});

// Apply global rate limit for API routes
app.use("/api/", generalLimiter);

// 7. API Routes
app.use("/api/orders", orderLimiter, ordersRouter);
app.use("/api/products", productsRouter);
app.use("/api/contact", contactLimiter, contactRouter);

// 8. Health Check Endpoint (For uptime monitors / ALB health checks)
app.get("/api/health", (_req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    message: "Stateless mode",
  });
});

// 9. Serve frontend static assets in production
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));

// 10. Fallback to index.html for SPA routing
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === "GET" && !req.url.startsWith("/api/")) {
    const indexPath = path.join(distPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).send("Front-end build not found. Run 'npm run build' first.");
      }
    });
  } else {
    next();
  }
});

// 11. Centralized Error Handler (Prevents server crash and stack trace leaks)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Avoid logging the full raw error object in production as it may contain sensitive data or stack traces
  console.error("🔴 [Unhandled Express Error]:", err?.message || err);
  
  if (process.env.NODE_ENV !== "production" && err?.stack) {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected internal server error occurred."
      : err.message || "Internal Server Error";

  return res.status(statusCode).json({
    error: message,
  });
});

// 12. Server Startup logic
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log("\n==================================================");
      console.log(`🚀 SAYF API Server (Stateless) running on http://localhost:${PORT}`);
      console.log("==================================================\n");
    }).on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.error(`🔴 [Server Startup Error] Port ${PORT} is already in use. Please stop any process using port ${PORT} and try again.`);
        process.exit(1);
      } else {
        console.error("🔴 [Server Startup Error]", err);
      }
    });
  } catch (error) {
    console.error("🔴 Fatal Server Startup Error:", error);
    process.exit(1);
  }
}

// Only start the server locally. Vercel will use the exported app directly.
if (!process.env.VERCEL) {
  startServer();
}

export default app;
