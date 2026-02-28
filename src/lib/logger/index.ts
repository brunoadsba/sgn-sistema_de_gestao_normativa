import pino from 'pino';
import { randomUUID } from 'crypto';
import type { NextRequest } from 'next/server';
import { env } from '@/lib/env';

function createBaseLogger(): pino.Logger {
  return pino({
    level: env.LOG_LEVEL,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      service: 'sgn-api',
      version: env.NPM_PACKAGE_VERSION,
      environment: env.NODE_ENV,
    },
  });
}

let _logger: pino.Logger | null = null;

function getLogger(): pino.Logger {
  if (!_logger) {
    _logger = createBaseLogger();
  }
  return _logger;
}

// Logger com contexto para APIs
export const createLogger = (context: string) => {
  return getLogger().child({ context });
};

export function getCorrelationId(request?: NextRequest): string {
  if (!request) return randomUUID();
  return request.headers.get('x-request-id') || request.headers.get('x-correlation-id') || randomUUID();
}

export function createRequestLogger(request: NextRequest, context = 'api') {
  const correlationId = getCorrelationId(request);
  return getLogger().child({ context, correlationId });
}

// Logger padrão para uso geral (lazy proxy)
const logProxy = new Proxy({} as pino.Logger, {
  get(_, prop) {
    return (getLogger() as unknown as Record<string, unknown>)[prop as string];
  },
});

export const log = logProxy;

// Loggers específicos para diferentes módulos
export const apiLogger = createLogger('api');
export const iaLogger = createLogger('ia');
export const conformidadeLogger = createLogger('conformidade');
export const databaseLogger = createLogger('database');
export const authLogger = createLogger('auth');

// Função para log de erro com stack trace e contexto
export const logError = (error: Error, context?: Record<string, unknown>) => {
  getLogger().error(
    {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...context,
    },
    'Erro capturado'
  );
};

// Função para log de performance com métricas
export const logPerformance = (operation: string, duration: number, context?: Record<string, unknown>) => {
  getLogger().info(
    {
      operation,
      duration,
      performance: {
        operation,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      },
      ...context,
    },
    `Operação ${operation} executada em ${duration}ms`
  );
};

// Função para log de auditoria (ações importantes)
export const logAudit = (action: string, userId?: string, context?: Record<string, unknown>) => {
  getLogger().info(
    {
      audit: {
        action,
        userId,
        timestamp: new Date().toISOString(),
        ip: context?.ip,
        userAgent: context?.userAgent,
      },
      ...context,
    },
    `Ação de auditoria: ${action}`
  );
};

// Função para log de segurança
export const logSecurity = (
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  context?: Record<string, unknown>
) => {
  getLogger().warn(
    {
      security: {
        event,
        severity,
        timestamp: new Date().toISOString(),
        ip: context?.ip,
        userAgent: context?.userAgent,
      },
      ...context,
    },
    `Evento de segurança [${severity.toUpperCase()}]: ${event}`
  );
};

// Função para log de negócio (métricas importantes)
export const logBusiness = (metric: string, value: number, context?: Record<string, unknown>) => {
  getLogger().info(
    {
      business: {
        metric,
        value,
        timestamp: new Date().toISOString(),
      },
      ...context,
    },
    `Métrica de negócio: ${metric} = ${value}`
  );
};

export default logProxy;
