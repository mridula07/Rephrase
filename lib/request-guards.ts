// Lightweight, dependency-free abuse protection for the public /api/rephrase*
// endpoints. This is intentionally simple for an MVP:
//
// - In-memory, per-process rate limiting keyed by client IP. It resets on
//   restart/redeploy and is NOT shared across multiple server instances, so
//   it should be treated as a first line of defense, not a guarantee — see
//   the security audit notes for production-scale alternatives (e.g. a
//   shared store like Redis/Upstash, or a platform-level rate limiter).
// - A best-effort Content-Length check to reject obviously oversized
//   payloads before they're buffered/parsed. Content-Length can be absent or
//   spoofed, so this is a cheap early rejection, not a hard guarantee — the
//   authoritative limit is the per-field length check applied after parsing.

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MAX_TRACKED_CLIENTS = 5000;

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function sweepExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(request: Request): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  if (buckets.size > MAX_TRACKED_CLIENTS) {
    sweepExpired(now);
  }

  const key = getClientIp(request);
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

const MAX_BODY_BYTES = 20_000;

export function isPayloadTooLarge(request: Request): boolean {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return false;
  const bytes = Number(contentLength);
  return Number.isFinite(bytes) && bytes > MAX_BODY_BYTES;
}
