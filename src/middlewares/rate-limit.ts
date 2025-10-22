import { NextRequest, NextResponse } from 'next/server';
import { getCacheManager } from '@/lib/cache/redis';
import { logSecurity } from '@/lib/logger';
import { getCorrelationId, createLogContext } from '@/lib/logger/correlation';

// Configurações de rate limiting
export const RATE_LIMIT_CONFIG = {
  // Rate limiting geral
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP por janela
    message: 'Muitas requisições deste IP, tente novamente em 15 minutos',
  },
  
  // Rate limiting para APIs críticas
  api: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30, // máximo 30 requests por IP por minuto
    message: 'Muitas requisições de API deste IP, tente novamente em 1 minuto',
  },
  
  // Rate limiting para análise de IA
  ia: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 5, // máximo 5 análises por IP por 5 minutos
    message: 'Limite de análises de IA excedido, tente novamente em 5 minutos',
  },
  
  // Rate limiting para uploads
  upload: {
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 10, // máximo 10 uploads por IP por 10 minutos
    message: 'Limite de uploads excedido, tente novamente em 10 minutos',
  },
  
  // Rate limiting para login/tentativas de autenticação
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas por IP por 15 minutos
    message: 'Muitas tentativas de autenticação, tente novamente em 15 minutos',
  },
} as const;

// Interface para configuração de rate limiting
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

// Classe para gerenciar rate limiting
export class RateLimiter {
  private cacheManager: any;
  
  constructor() {
    this.initializeCache();
  }
  
  private async initializeCache() {
    try {
      this.cacheManager = await getCacheManager();
    } catch (error) {
      console.error('Erro ao inicializar cache para rate limiting:', error);
    }
  }
  
  // Gerar chave única para rate limiting
  private generateKey(req: NextRequest, prefix: string): string {
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               req.headers.get('cf-connecting-ip') ||
               'unknown';
    
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const correlationId = getCorrelationId(req);
    
    // Usar IP + User-Agent para maior precisão
    return `${prefix}:${ip}:${Buffer.from(userAgent).toString('base64').slice(0, 20)}`;
  }
  
  // Verificar se request está dentro do limite
  async checkLimit(req: NextRequest, config: RateLimitConfig): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    totalHits: number;
  }> {
    try {
      if (!this.cacheManager) {
        // Se cache não estiver disponível, permitir request
        return {
          allowed: true,
          remaining: config.max,
          resetTime: Date.now() + config.windowMs,
          totalHits: 0,
        };
      }
      
      const key = this.generateKey(req, 'rate_limit');
      const now = Date.now();
      const windowStart = now - config.windowMs;
      
      // Buscar hits existentes
      const existingHits = await this.cacheManager.get(key) || [];
      
      // Filtrar hits dentro da janela atual
      const validHits = existingHits.filter((hit: number) => hit > windowStart);
      
      // Verificar se excedeu o limite
      const isAllowed = validHits.length < config.max;
      
      if (isAllowed) {
        // Adicionar novo hit
        validHits.push(now);
        await this.cacheManager.set(key, validHits, Math.ceil(config.windowMs / 1000));
      }
      
      // Calcular tempo de reset
      const oldestHit = validHits.length > 0 ? Math.min(...validHits) : now;
      const resetTime = oldestHit + config.windowMs;
      
      return {
        allowed: isAllowed,
        remaining: Math.max(0, config.max - validHits.length),
        resetTime,
        totalHits: validHits.length,
      };
      
    } catch (error) {
      console.error('Erro no rate limiting:', error);
      // Em caso de erro, permitir request
      return {
        allowed: true,
        remaining: config.max,
        resetTime: Date.now() + config.windowMs,
        totalHits: 0,
      };
    }
  }
  
  // Log de tentativas de rate limiting
  private async logRateLimitAttempt(req: NextRequest, config: RateLimitConfig, result: any) {
    const logContext = createLogContext(req);
    
    if (!result.allowed) {
      logSecurity('rate_limit_exceeded', 'medium', {
        ...logContext,
        rateLimitConfig: config,
        totalHits: result.totalHits,
        remaining: result.remaining,
        resetTime: result.resetTime,
      });
    }
  }
}

// Instância global do rate limiter
let rateLimiter: RateLimiter | null = null;

export async function getRateLimiter(): Promise<RateLimiter> {
  if (!rateLimiter) {
    rateLimiter = new RateLimiter();
  }
  return rateLimiter;
}

// Middleware para rate limiting
export function withRateLimit(config: RateLimitConfig) {
  return function(handler: Function) {
    return async (req: NextRequest, ...args: any[]) => {
      const limiter = await getRateLimiter();
      const result = await limiter.checkLimit(req, config);
      
      // Log da tentativa
      await limiter['logRateLimitAttempt'](req, config, result);
      
      if (!result.allowed) {
        const response = NextResponse.json(
          {
            success: false,
            message: config.message,
            error: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
            timestamp: new Date().toISOString(),
          },
          { status: 429 }
        );
        
        // Adicionar headers de rate limiting
        response.headers.set('X-RateLimit-Limit', String(config.max));
        response.headers.set('X-RateLimit-Remaining', String(result.remaining));
        response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));
        response.headers.set('Retry-After', String(Math.ceil((result.resetTime - Date.now()) / 1000)));
        
        return response;
      }
      
      // Adicionar headers de rate limiting à resposta
      const response = await handler(req, ...args);
      response.headers.set('X-RateLimit-Limit', String(config.max));
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));
      
      return response;
    };
  };
}

// Middleware específico para diferentes tipos de endpoints
export const rateLimitMiddlewares = {
  // Rate limiting geral para todas as rotas
  general: withRateLimit(RATE_LIMIT_CONFIG.general),
  
  // Rate limiting para APIs
  api: withRateLimit(RATE_LIMIT_CONFIG.api),
  
  // Rate limiting para análise de IA
  ia: withRateLimit(RATE_LIMIT_CONFIG.ia),
  
  // Rate limiting para uploads
  upload: withRateLimit(RATE_LIMIT_CONFIG.upload),
  
  // Rate limiting para autenticação
  auth: withRateLimit(RATE_LIMIT_CONFIG.auth),
} as const;

// Função para verificar rate limit sem bloquear
export async function checkRateLimit(req: NextRequest, config: RateLimitConfig) {
  const limiter = await getRateLimiter();
  return await limiter.checkLimit(req, config);
}

// Função para resetar rate limit de um IP específico
export async function resetRateLimit(ip: string, prefix: string = 'rate_limit') {
  try {
    const cacheManager = await getCacheManager();
    const pattern = `${prefix}:${ip}:*`;
    await cacheManager.deletePattern(pattern);
    console.log(`Rate limit resetado para IP: ${ip}`);
  } catch (error) {
    console.error('Erro ao resetar rate limit:', error);
  }
}

// Função para obter estatísticas de rate limiting
export async function getRateLimitStats() {
  try {
    const cacheManager = await getCacheManager();
    const keys = await cacheManager.redis.keys('rate_limit:*');
    
    const stats = {
      totalKeys: keys.length,
      activeLimits: 0,
      blockedIPs: 0,
    };
    
    for (const key of keys) {
      const hits = await cacheManager.get(key);
      if (hits && hits.length > 0) {
        stats.activeLimits++;
        
        // Verificar se algum IP está bloqueado
        const now = Date.now();
        const recentHits = hits.filter((hit: number) => hit > now - 15 * 60 * 1000);
        if (recentHits.length >= 100) {
          stats.blockedIPs++;
        }
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Erro ao obter estatísticas de rate limiting:', error);
    return {
      totalKeys: 0,
      activeLimits: 0,
      blockedIPs: 0,
    };
  }
}

// Middleware para slow down (reduzir velocidade após muitas requests)
export function withSlowDown(config: {
  windowMs: number;
  delayAfter: number;
  delayMs: number;
}) {
  return function(handler: Function) {
    return async (req: NextRequest, ...args: any[]) => {
      const limiter = await getRateLimiter();
      const result = await limiter.checkLimit(req, {
        ...config,
        max: config.delayAfter,
        message: 'Slow down',
      });
      
      if (result.totalHits >= config.delayAfter) {
        const delay = config.delayMs * (result.totalHits - config.delayAfter + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return handler(req, ...args);
    };
  };
}

export default {
  withRateLimit,
  rateLimitMiddlewares,
  checkRateLimit,
  resetRateLimit,
  getRateLimitStats,
  withSlowDown,
  RATE_LIMIT_CONFIG,
};
