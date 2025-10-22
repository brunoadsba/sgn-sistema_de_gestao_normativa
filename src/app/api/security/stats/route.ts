import { NextRequest, NextResponse } from 'next/server';
import { handleSecurityRequest } from '../route';

// GET /api/security/stats
export async function GET(request: NextRequest) {
  return handleSecurityRequest(request);
}
