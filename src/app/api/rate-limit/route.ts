import { NextRequest, NextResponse } from "next/server";

const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  max: 100
};

function getClientIp(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  // Fallback não-padronizado
  return "unknown";
}

function rateLimit(req: NextRequest): NextResponse | null {
  const ip = getClientIp(req);
  const now = Date.now();

  const current = requestCounts.get(ip);
  if (!current || now > current.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return null;
  }

  if (current.count >= RATE_LIMIT.max) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000);
    return new NextResponse(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) }
    });
  }

  current.count++;
  return null;
}

export async function GET(request: NextRequest) {
  const limited = rateLimit(request);
  if (limited) return limited;

  return NextResponse.json({
    success: true,
    message: "Rate limiting ativo"
  });
}
