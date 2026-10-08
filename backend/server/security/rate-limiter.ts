import { Request, Response, NextFunction } from "express";
import { getClientIp } from "./ip-detection.js";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
}) {
  const {
    windowMs = 60 * 1000,
    max = 60,
    message = "Too many requests. Please slow down and try again later.",
    keyPrefix = "rl",
  } = options;

  const storage = new Map<string, RateLimitRecord>();

  // Cleanup expired entries periodically (every 5 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of storage.entries()) {
      if (now > record.resetAt) {
        storage.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    // In test environment, bypass rate limits if DISABLE_RATE_LIMITS is set
    if (process.env.DISABLE_RATE_LIMITS === "true") {
      return next();
    }

    const { ipAddress } = getClientIp(req);
    const key = `${keyPrefix}:${ipAddress}`;
    const now = Date.now();

    let record = storage.get(key);
    if (!record || now > record.resetAt) {
      record = {
        count: 1,
        resetAt: now + windowMs,
      };
      storage.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetAt / 1000));

    if (record.count > max) {
      res.setHeader("Retry-After", retryAfterSec);
      return res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message,
          retryAfter: retryAfterSec,
        },
        meta: { requestId: (req as any).requestId },
      });
    }

    next();
  };
}
