/**
 * Rate limiting (sección 1 y 8 del prompt maestro): "Upstash Redis (o
 * in-memory fallback en dev)". Sin credenciales de Upstash todavía, así
 * que esto usa el fallback en memoria — funciona perfecto en un único
 * proceso (dev, o un server tradicional), pero OJO: en un deploy
 * serverless multi-instancia (Vercel) cada instancia tiene su propio
 * mapa, así que el límite real termina siendo N × este valor. Cuando
 * lleguen las credenciales de Upstash, esto se reemplaza por
 * `@upstash/ratelimit` sin cambiar la firma de `checkRateLimit()`.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count++;
  return { success: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

/** IP del request — Vercel/proxies mandan `x-forwarded-for`. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
