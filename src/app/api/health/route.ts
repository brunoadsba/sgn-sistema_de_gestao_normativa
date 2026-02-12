import type { NextRequest } from 'next/server';
import { isDatabaseReady } from '@/lib/db';
import { isRedisAvailable } from '@/lib/cache/redis';
import { env } from '@/lib/env';

interface HealthCheck {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: 'ok' | 'error';
    cache: 'ok' | 'error' | 'unavailable';
    api: 'ok' | 'error';
  };
  performance: {
    duration: string;
  };
  uptime: number;
}

const startTime = Date.now();

export async function GET(_request: NextRequest) {
  const checkStartTime = Date.now();
  const services: HealthCheck['services'] = {
    database: 'error',
    cache: 'unavailable',
    api: 'ok',
  };
  
  try {
    // Verificar conexão com SQLite
    services.database = isDatabaseReady() ? 'ok' : 'error';

    // Verificar conexão com Redis (não crítico)
    try {
      const redisAvailable = await isRedisAvailable();
      services.cache = redisAvailable ? 'ok' : 'unavailable';
    } catch {
      services.cache = 'unavailable';
    }

    const duration = Date.now() - checkStartTime;
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    
    let status: HealthCheck['status'] = 'ok';
    if (services.database === 'error') {
      status = 'error';
    } else if (services.cache === 'unavailable') {
      status = 'degraded';
    }

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

    const httpStatus = status === 'error' ? 503 : 200;
    
    return Response.json(health, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true',
      },
    });

  } catch (error) {
    const duration = Date.now() - checkStartTime;
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    
    return Response.json(
      { 
        status: 'error' as const,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: env.NODE_ENV,
        services: {
          ...services,
          api: 'error' as const,
        },
        performance: {
          duration: `${duration}ms`,
        },
        uptime,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }, 
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Check': 'true',
        },
      }
    );
  }
}
