type Key = string;

interface Bucket {
  tokens: number;
  lastRefill: number; // ms
}

export class RateLimiter {
  private buckets = new Map<Key, Bucket>();
  constructor(private capacity = 5, private refillMs = 60_000) {}

  private now() {
    return Date.now();
  }

  take(key: Key): boolean {
    const now = this.now();
    const bucket = this.buckets.get(key) || { tokens: this.capacity, lastRefill: now };

    const elapsed = now - bucket.lastRefill;
    if (elapsed >= this.refillMs) {
      bucket.tokens = this.capacity;
      bucket.lastRefill = now;
    }

    if (bucket.tokens <= 0) {
      this.buckets.set(key, bucket);
      return false;
    }

    bucket.tokens -= 1;
    this.buckets.set(key, bucket);
    return true;
  }
}

export const authLimiter = new RateLimiter(10, 60_000);

export function getClientKey(req: Request): string {
  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "").split(",")[0].trim();
  const ua = req.headers.get("user-agent") || "";
  return ip || ua || "anonymous";
}
