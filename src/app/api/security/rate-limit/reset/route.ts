import { NextRequest, NextResponse } from 'next/server';
import { handleSecurityRequest } from '../route';

// POST /api/security/rate-limit/reset
export async function POST(request: NextRequest) {
  return handleSecurityRequest(request);
}
