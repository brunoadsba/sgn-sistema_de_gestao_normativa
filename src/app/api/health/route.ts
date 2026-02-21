import { NextResponse } from 'next/server';
import { isDatabaseReady } from '@/lib/db';
import { env } from '@/lib/env';

interface HealthCheck {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: 'ok' | 'error';
    api: 'ok' | 'error';
    llm: 'ok' | 'error';
  };
  performance: {
    duration: string;
  };
  uptime: number;
}

const startTime = Date.now();

export async function GET() {
  const checkStartTime = Date.now();
  const services: HealthCheck['services'] = {
    database: 'error',
    api: 'ok',
    llm: 'error',
  };

  try {
    services.database = isDatabaseReady() ? 'ok' : 'error';
    services.llm = await isGroqReady() ? 'ok' : 'error';

    const duration = Date.now() - checkStartTime;
    const uptime = Math.floor((Date.now() - startTime) / 1000);

    const status: HealthCheck['status'] = services.database === 'error' ? 'error' : 'ok';

    const health: HealthCheck = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: env.NODE_ENV,
      services,
      performance: {
        duration: `${duration}ms`,
      },
      uptime,
    };

    return NextResponse.json(health, {
      status: status === 'error' ? 503 : 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    const duration = Date.now() - checkStartTime;
    const uptime = Math.floor((Date.now() - startTime) / 1000);

    return NextResponse.json(
      {
        status: 'error' as const,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: env.NODE_ENV,
        services: { ...services, api: 'error' as const },
        performance: { duration: `${duration}ms` },
        uptime,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 503 }
    );
  }
}

async function isGroqReady(): Promise<boolean> {
  if (!env.GROQ_API_KEY) return false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}
