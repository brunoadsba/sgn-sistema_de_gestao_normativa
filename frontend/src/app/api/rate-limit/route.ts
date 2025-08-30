import { NextRequest, NextResponse } from "next/server";

const requestCounts = new Map();
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  max: 100
};

export function rateLimit(req) {
  const ip = req.ip || "unknown";
  const now = Date.now();
  
  const current = requestCounts.get(ip);
  
  if (!current) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return null;
  }
  
  if (current.count >= RATE_LIMIT.max) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  
  current.count++;
  return null;
}

export async function GET(request) {
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;
  
  return NextResponse.json({
    success: true,
    message: "Rate limiting ativo"
  });
}
