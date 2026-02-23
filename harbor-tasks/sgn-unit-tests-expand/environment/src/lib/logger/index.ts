import pino from 'pino';
import { randomUUID } from 'crypto';
import type { NextRequest } from 'next/server';

// Configuração do logger Pino para produção
const pinoOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: 'sgn-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
};

// pino-pretty transport desabilitado em dev — usa worker threads
// que conflitam com hot-reload do Next.js (erro MODULE_NOT_FOUND worker.js)

const logger = pino(pinoOptions);

// Logger com contexto para APIs
export const createLogger = (context: string) => {
  return logger.child({ context });
};

export function getCorrelationId(request?: NextRequest): string {
  if (!request) return randomUUID();
  return request.headers.get('x-request-id') || request.headers.get('x-correlation-id') || randomUUID();
}

export function createRequestLogger(request: NextRequest, context = 'api') {
  const correlationId = getCorrelationId(request);
  return logger.child({ context, correlationId });
}

// Logger padrão para uso geral
export const log = logger;

// Loggers específicos para diferentes módulos
export const apiLogger = createLogger('api');
export const iaLogger = createLogger('ia');
export const conformidadeLogger = createLogger('conformidade');
export const databaseLogger = createLogger('database');
export const authLogger = createLogger('auth');

// Função para log de erro com stack trace e contexto
export const logError = (error: Error, context?: Record<string, unknown>) => {
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  }, 'Erro capturado');
};

// Função para log de performance com métricas
export const logPerformance = (operation: string, duration: number, context?: Record<string, unknown>) => {
  logger.info({
    operation,
    duration,
    performance: {
      operation,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    },
    ...context,
  }, `Operação ${operation} executada em ${duration}ms`);
};

// Função para log de auditoria (ações importantes)
export const logAudit = (action: string, userId?: string, context?: Record<string, unknown>) => {
  logger.info({
    audit: {
      action,
      userId,
      timestamp: new Date().toISOString(),
      ip: context?.ip,
      userAgent: context?.userAgent,
    },
    ...context,
  }, `Ação de auditoria: ${action}`);
};

// Função para log de segurança
export const logSecurity = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, unknown>) => {
  logger.warn({
    security: {
      event,
      severity,
      timestamp: new Date().toISOString(),
      ip: context?.ip,
      userAgent: context?.userAgent,
    },
    ...context,
  }, `Evento de segurança [${severity.toUpperCase()}]: ${event}`);
};

// Função para log de negócio (métricas importantes)
export const logBusiness = (metric: string, value: number, context?: Record<string, unknown>) => {
  logger.info({
    business: {
      metric,
      value,
      timestamp: new Date().toISOString(),
    },
    ...context,
  }, `Métrica de negócio: ${metric} = ${value}`);
};

export default logger;
