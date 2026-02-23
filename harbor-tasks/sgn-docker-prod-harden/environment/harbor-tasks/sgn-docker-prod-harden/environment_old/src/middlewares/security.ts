import { NextRequest, NextResponse } from 'next/server';
import { logSecurity } from '@/lib/logger';
import { getCorrelationId, createLogContext } from '@/lib/logger/correlation';

// Configurações de CORS
export const CORS_CONFIG = {
  // Configuração para desenvolvimento
  development: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    credentials: true,
  },
  
  // Configuração para produção
  production: {
    origin: [
      'https://sgn.vercel.app',
      'https://sgn-staging.vercel.app',
      'https://sgn-sistema-gestao-normativa.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    credentials: true,
  },
} as const;

// Configurações de Content Security Policy
export const CSP_CONFIG = {
  development: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https:'],
    'connect-src': ["'self'", 'ws:', 'wss:', 'https:'],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
  
  production: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https:'],
    'connect-src': ["'self'", 'https:'],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
} as const;

// Headers de segurança
export const SECURITY_HEADERS = {
  // Prevenir clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevenir MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // XSS Protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  
  // Strict Transport Security (apenas em HTTPS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cross-Origin Embedder Policy
  'Cross-Origin-Embedder-Policy': 'require-corp',
  
  // Cross-Origin Opener Policy
  'Cross-Origin-Opener-Policy': 'same-origin',
  
  // Cross-Origin Resource Policy
  'Cross-Origin-Resource-Policy': 'same-origin',
} as const;

// Função para verificar se origin é permitida
function isOriginAllowed(origin: string, allowedOrigins: readonly string[]): boolean {
  if (!origin) return false;
  
  return allowedOrigins.some(allowedOrigin => {
    if (allowedOrigin === '*') return true;
    if (allowedOrigin.includes('*')) {
      const pattern = allowedOrigin.replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(origin);
    }
    return origin === allowedOrigin;
  });
}

// Interface para configuração CORS
interface CorsConfig {
  readonly origin: readonly string[];
  readonly methods: readonly string[];
  readonly allowedHeaders: readonly string[];
  readonly credentials: boolean;
}

// Tipo para handler de API
type SecurityApiHandler = (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>;

// Middleware para CORS
export function withCORS(config: CorsConfig) {
  return function(handler: SecurityApiHandler) {
    return async (req: NextRequest, ...args: unknown[]) => {
      const origin = req.headers.get('origin');
      const method = req.method;
      
      // Verificar origin
      if (origin && !isOriginAllowed(origin, config.origin)) {
        logSecurity('cors_blocked', 'medium', {
          origin,
          method,
          userAgent: req.headers.get('user-agent'),
          correlationId: getCorrelationId(req),
        });
        
        return new NextResponse(null, { status: 403 });
      }
      
      // Handle preflight requests
      if (method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 });
        
        // CORS headers
        if (origin && isOriginAllowed(origin, config.origin)) {
          response.headers.set('Access-Control-Allow-Origin', origin);
        }
        response.headers.set('Access-Control-Allow-Methods', config.methods.join(', '));
        response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
        
        if (config.credentials) {
          response.headers.set('Access-Control-Allow-Credentials', 'true');
        }
        
        response.headers.set('Access-Control-Max-Age', '86400'); // 24 horas
        
        return response;
      }
      
      // Executar handler original
      const response = await handler(req, ...args);
      
      // Adicionar CORS headers à resposta
      if (origin && isOriginAllowed(origin, config.origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      
      if (config.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return response;
    };
  };
}

// Middleware para headers de segurança
export function withSecurityHeaders() {
  return function(handler: SecurityApiHandler) {
    return async (req: NextRequest, ...args: unknown[]) => {
      const response = await handler(req, ...args);
      
      // Adicionar headers de segurança
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        // Não adicionar HSTS em desenvolvimento
        if (key === 'Strict-Transport-Security' && req.url.includes('localhost')) {
          return;
        }
        response.headers.set(key, value);
      });
      
      // Adicionar CSP
      const isProduction = process.env.NODE_ENV === 'production';
      const cspConfig = isProduction ? CSP_CONFIG.production : CSP_CONFIG.development;
      
      const cspString = Object.entries(cspConfig)
        .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
        .join('; ');
      
      response.headers.set('Content-Security-Policy', cspString);
      
      return response;
    };
  };
}

// Middleware para validação de request
export function withRequestValidation() {
  return function(handler: SecurityApiHandler) {
    return async (req: NextRequest, ...args: unknown[]) => {
      const logContext = createLogContext(req);
      
      // Verificar tamanho do request
      const contentLength = req.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
        logSecurity('request_too_large', 'medium', {
          ...logContext,
          contentLength: parseInt(contentLength),
        });
        
        return NextResponse.json(
          {
            success: false,
            message: 'Request muito grande',
            error: 'REQUEST_TOO_LARGE',
            timestamp: new Date().toISOString(),
          },
          { status: 413 }
        );
      }
      
      // Verificar User-Agent suspeito
      const userAgent = req.headers.get('user-agent');
      if (userAgent && (
        userAgent.includes('bot') ||
        userAgent.includes('crawler') ||
        userAgent.includes('spider') ||
        userAgent.length < 10
      )) {
        logSecurity('suspicious_user_agent', 'low', {
          ...logContext,
          userAgent,
        });
      }
      
      // Verificar headers suspeitos
      const suspiciousHeaders = [
        'x-forwarded-for',
        'x-real-ip',
        'x-cluster-client-ip',
        'x-forwarded',
        'forwarded-for',
        'forwarded',
      ];
      
      const hasSuspiciousHeaders = suspiciousHeaders.some(header => 
        req.headers.get(header) && req.headers.get(header) !== req.headers.get('x-forwarded-for')
      );
      
      if (hasSuspiciousHeaders) {
        logSecurity('suspicious_headers', 'medium', {
          ...logContext,
          headers: Object.fromEntries(req.headers.entries()),
        });
      }
      
      return handler(req, ...args);
    };
  };
}

// Middleware para proteção contra ataques comuns
export function withAttackProtection() {
  return function(handler: SecurityApiHandler) {
    return async (req: NextRequest, ...args: unknown[]) => {
      const logContext = createLogContext(req);
      const url = req.url;
      
      // Verificar tentativas de path traversal
      if (url.includes('../') || url.includes('..\\') || url.includes('%2e%2e')) {
        logSecurity('path_traversal_attempt', 'high', logContext);
        
        return NextResponse.json(
          {
            success: false,
            message: 'Caminho inválido',
            error: 'INVALID_PATH',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      
      // Verificar tentativas de SQL injection básicas
      const sqlPatterns = [
        /union\s+select/i,
        /drop\s+table/i,
        /delete\s+from/i,
        /insert\s+into/i,
        /update\s+set/i,
        /or\s+1\s*=\s*1/i,
        /and\s+1\s*=\s*1/i,
      ];
      
      const hasSqlInjection = sqlPatterns.some(pattern => pattern.test(url));
      if (hasSqlInjection) {
        logSecurity('sql_injection_attempt', 'high', logContext);
        
        return NextResponse.json(
          {
            success: false,
            message: 'Request inválido',
            error: 'INVALID_REQUEST',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      
      // Verificar tentativas de XSS básicas
      const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
      ];
      
      const hasXss = xssPatterns.some(pattern => pattern.test(url));
      if (hasXss) {
        logSecurity('xss_attempt', 'high', logContext);
        
        return NextResponse.json(
          {
            success: false,
            message: 'Request inválido',
            error: 'INVALID_REQUEST',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      
      return handler(req, ...args);
    };
  };
}

// Middleware combinado de segurança
export function withSecurity() {
  const isProd = process.env.NODE_ENV === 'production';
  const corsConfig: CorsConfig = isProd ? CORS_CONFIG.production : CORS_CONFIG.development;
  
  return function(handler: SecurityApiHandler) {
    return withCORS(corsConfig)(
      withSecurityHeaders()(
        withRequestValidation()(
          withAttackProtection()(handler)
        )
      )
    );
  };
}

// Função para obter configuração de segurança atual
export function getSecurityConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    environment: process.env.NODE_ENV,
    cors: isProduction ? CORS_CONFIG.production : CORS_CONFIG.development,
    csp: isProduction ? CSP_CONFIG.production : CSP_CONFIG.development,
    securityHeaders: SECURITY_HEADERS,
    isProduction,
  };
}

// Função para validar configuração de segurança
export function validateSecurityConfig() {
  const config = getSecurityConfig();
  const issues: string[] = [];
  
  // Verificar se CORS está configurado corretamente
  const corsOrigins = config.cors.origin as readonly string[];
  if (corsOrigins.length === 0) {
    issues.push('CORS origins não configurados');
  }
  
  // Verificar se CSP está configurado
  if (Object.keys(config.csp).length === 0) {
    issues.push('CSP não configurado');
  }
  
  // Verificar se headers de segurança estão configurados
  if (Object.keys(config.securityHeaders).length === 0) {
    issues.push('Headers de segurança não configurados');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    config,
  };
}

const securityMiddlewares = {
  withCORS,
  withSecurityHeaders,
  withRequestValidation,
  withAttackProtection,
  withSecurity,
  getSecurityConfig,
  validateSecurityConfig,
  CORS_CONFIG,
  CSP_CONFIG,
  SECURITY_HEADERS,
};

export default securityMiddlewares;
