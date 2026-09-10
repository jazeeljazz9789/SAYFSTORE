import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * Memory-efficient sliding window rate limiting middleware
 */
export function createRateLimiter(options: { windowMs: number; maxRequests: number; message?: string }) {
  const store: RateLimitStore = {};
  const { windowMs, maxRequests, message = "Too many requests. Please try again later." } = options;

  // Periodically clean up expired IPs to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const ip in store) {
      if (store[ip].resetTime < now) {
        delete store[ip];
      }
    }
  }, Math.max(60000, windowMs));

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown-ip";
    const now = Date.now();

    if (!store[ip] || store[ip].resetTime < now) {
      if (Object.keys(store).length >= 10000) {
        return res.status(429).json({ error: "Service temporarily overloaded." });
      }
      store[ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    store[ip].count += 1;

    if (store[ip].count > maxRequests) {
      const retryAfterSeconds = Math.ceil((store[ip].resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        error: message,
        retryAfter: retryAfterSeconds,
      });
    }

    next();
  };
}

/**
 * Security headers middleware (equivalent to Helmet essentials)
 */
export function securityHeaders() {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    // Content Security Policy — allow self, inline styles (React), Google Fonts, and data URIs for images
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ")
    );
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  };
}

/**
 * Sanitizes request body and query to prevent NoSQL Mongo operator injection ($gt, $ne, etc.)
 */
export function sanitizeInput() {
  const sanitize = (obj: any): any => {
    if (!obj || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(sanitize);

    const clean: any = {};
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        console.warn(`⚠️ [Security Alert] Blocked suspicious input key: "${key}"`);
        continue; // Strip key starting with $ or .
      }
      clean[key] = sanitize(obj[key]);
    }
    return clean;
  };

  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === "object") {
      req.body = sanitize(req.body);
    }
    if (req.query && typeof req.query === "object") {
      for (const key of Object.keys(req.query)) {
        if (key.startsWith("$") || key.includes(".")) {
          console.warn(`⚠️ [Security Alert] Blocked suspicious query parameter: "${key}"`);
          delete (req.query as any)[key];
        }
      }
    }
    next();
  };
}
