import { NextRequest, NextResponse } from 'next/server';
import { handleSecurityRequest } from '../route';

// GET /api/security/config
export async function GET(request: NextRequest) {
  return handleSecurityRequest(request);
}

// POST /api/security/test
export async function POST(request: NextRequest) {
  return handleSecurityRequest(request);
}
