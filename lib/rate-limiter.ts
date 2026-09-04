/**
 * In-Memory Sliding Window Rate Limiter
 * Keys by IP address. Configurable window and max requests.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

export function rateLimit(
  key: string,
  config: { windowMs: number; maxRequests: number }
): { allowed: boolean; remaining: number; retryAfterMs?: number } {
  const now = Date.now();
  const cutoff = now - config.windowMs;

  cleanup(config.windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + config.windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, retryAfterMs),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
  };
}

// Pre-defined rate limit configs
export const RATE_LIMITS = {
  applicationSubmit: { windowMs: 60 * 60 * 1000, maxRequests: 5 },   // 5 per hour
  contactForm: { windowMs: 60 * 60 * 1000, maxRequests: 10 },        // 10 per hour
  adminLogin: { windowMs: 15 * 60 * 1000, maxRequests: 10 },         // 10 per 15 min
  paymentUpload: { windowMs: 60 * 60 * 1000, maxRequests: 10 },      // 10 per hour
  trackLookup: { windowMs: 60 * 1000, maxRequests: 20 },             // 20 per minute
} as const;

/**
 * Extract client IP from headers (works with Vercel, Cloudflare, etc.)
 */
export function getClientIp(headerEntries: Headers): string {
  return (
    headerEntries.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerEntries.get("x-real-ip") ||
    "unknown"
  );
}
