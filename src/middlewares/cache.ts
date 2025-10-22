import { NextRequest, NextResponse } from 'next/server';
import { getCacheManager, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis';
import { logPerformance } from '@/lib/logger';

// Interface para configuração de cache
interface CacheConfig {
  key: string;
  ttl?: number;
  skipCache?: boolean;
  tags?: string[];
}

// Middleware para adicionar cache às respostas
export function withCache(config: CacheConfig) {
  return function(handler: Function) {
    return async (request: NextRequest, ...args: any[]) => {
      const startTime = Date.now();
      
      try {
        // Verificar se cache está disponível
        const cacheManager = await getCacheManager();
        const cacheKey = `${config.key}:${request.url}`;
        
        // Tentar buscar do cache se não for para pular
        if (!config.skipCache) {
          const cachedResponse = await cacheManager.get(cacheKey);
          if (cachedResponse) {
            const duration = Date.now() - startTime;
            logPerformance('cache_hit', duration, { key: cacheKey });
            
            return NextResponse.json(cachedResponse, {
              headers: {
                'X-Cache': 'HIT',
                'X-Cache-Key': cacheKey,
                'X-Cache-TTL': String(config.ttl || CACHE_TTL.NORMAS),
              },
            });
          }
        }
        
        // Executar handler original
        const response = await handler(request, ...args);
        const responseData = await response.json();
        
        // Armazenar no cache se a resposta foi bem-sucedida
        if (response.status === 200 && !config.skipCache) {
          await cacheManager.set(
            cacheKey,
            responseData,
            config.ttl || CACHE_TTL.NORMAS
          );
          
          // Adicionar tags se especificadas
          if (config.tags && config.tags.length > 0) {
            for (const tag of config.tags) {
              await cacheManager.hset(`cache:tags:${tag}`, cacheKey, Date.now());
            }
          }
        }
        
        const duration = Date.now() - startTime;
        logPerformance('cache_miss', duration, { key: cacheKey });
        
        // Retornar resposta com headers de cache
        return NextResponse.json(responseData, {
          status: response.status,
          headers: {
            ...response.headers,
            'X-Cache': 'MISS',
            'X-Cache-Key': cacheKey,
            'X-Cache-TTL': String(config.ttl || CACHE_TTL.NORMAS),
            'X-Response-Time': `${duration}ms`,
          },
        });
        
      } catch (error) {
        // Em caso de erro, executar handler sem cache
        console.error('Erro no middleware de cache:', error);
        return handler(request, ...args);
      }
    };
  };
}

// Middleware para invalidar cache
export function withCacheInvalidation(tags: string[]) {
  return function(handler: Function) {
    return async (request: NextRequest, ...args: any[]) => {
      const response = await handler(request, ...args);
      
      // Se a operação foi bem-sucedida, invalidar cache
      if (response.status >= 200 && response.status < 300) {
        try {
          const cacheManager = await getCacheManager();
          
          for (const tag of tags) {
            // Buscar todas as chaves com essa tag
            const taggedKeys = await cacheManager.hgetall(`cache:tags:${tag}`);
            
            // Deletar todas as chaves
            for (const key of Object.keys(taggedKeys)) {
              await cacheManager.delete(key);
            }
            
            // Limpar a tag
            await cacheManager.delete(`cache:tags:${tag}`);
          }
          
          console.log(`Cache invalidado para tags: ${tags.join(', ')}`);
        } catch (error) {
          console.error('Erro ao invalidar cache:', error);
        }
      }
      
      return response;
    };
  };
}

// Função para invalidar cache manualmente
export async function invalidateCacheByTag(tag: string): Promise<void> {
  try {
    const cacheManager = await getCacheManager();
    const taggedKeys = await cacheManager.hgetall(`cache:tags:${tag}`);
    
    for (const key of Object.keys(taggedKeys)) {
      await cacheManager.delete(key);
    }
    
    await cacheManager.delete(`cache:tags:${tag}`);
    console.log(`Cache invalidado para tag: ${tag}`);
  } catch (error) {
    console.error('Erro ao invalidar cache por tag:', error);
  }
}

// Função para invalidar cache por padrão
export async function invalidateCacheByPattern(pattern: string): Promise<void> {
  try {
    const cacheManager = await getCacheManager();
    await cacheManager.deletePattern(pattern);
    console.log(`Cache invalidado para padrão: ${pattern}`);
  } catch (error) {
    console.error('Erro ao invalidar cache por padrão:', error);
  }
}

// Função para limpar todo o cache
export async function clearAllCache(): Promise<void> {
  try {
    const cacheManager = await getCacheManager();
    await cacheManager.clear();
    console.log('Todo o cache foi limpo');
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
  }
}

// Função para obter estatísticas do cache
export async function getCacheStats(): Promise<{
  keys: number;
  memory: string;
  connected: boolean;
}> {
  try {
    const cacheManager = await getCacheManager();
    return await cacheManager.getStats();
  } catch (error) {
    console.error('Erro ao obter estatísticas do cache:', error);
    return {
      keys: 0,
      memory: 'unknown',
      connected: false,
    };
  }
}

// Configurações de cache para diferentes endpoints
export const CACHE_CONFIGS = {
  // Normas
  normas: {
    key: CACHE_KEYS.NORMAS,
    ttl: CACHE_TTL.NORMAS,
    tags: ['normas'],
  },
  
  normaDetail: {
    key: CACHE_KEYS.NORMA_DETAIL,
    ttl: CACHE_TTL.NORMA_DETAIL,
    tags: ['normas', 'norma-detail'],
  },
  
  normaStats: {
    key: CACHE_KEYS.NORMA_STATS,
    ttl: CACHE_TTL.NORMA_STATS,
    tags: ['normas', 'stats'],
  },
  
  // IA
  iaAnalysis: {
    key: CACHE_KEYS.IA_ANALYSIS,
    ttl: CACHE_TTL.IA_ANALYSIS,
    tags: ['ia', 'analysis'],
  },
  
  iaResult: {
    key: CACHE_KEYS.IA_ANALYSIS_RESULT,
    ttl: CACHE_TTL.IA_ANALYSIS_RESULT,
    tags: ['ia', 'result'],
  },
  
  // Health
  healthCheck: {
    key: CACHE_KEYS.HEALTH_CHECK,
    ttl: CACHE_TTL.HEALTH_CHECK,
    tags: ['health'],
  },
} as const;

// Middleware para adicionar headers de cache
export function addCacheHeaders(response: NextResponse, config: CacheConfig): NextResponse {
  response.headers.set('Cache-Control', `public, max-age=${config.ttl || CACHE_TTL.NORMAS}`);
  response.headers.set('X-Cache-TTL', String(config.ttl || CACHE_TTL.NORMAS));
  response.headers.set('X-Cache-Key', config.key);
  
  return response;
}

// Middleware para verificar se deve usar cache
export function shouldUseCache(request: NextRequest): boolean {
  // Não usar cache para requests POST, PUT, DELETE
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    return false;
  }
  
  // Não usar cache se header no-cache estiver presente
  if (request.headers.get('cache-control')?.includes('no-cache')) {
    return false;
  }
  
  // Não usar cache se header no-store estiver presente
  if (request.headers.get('cache-control')?.includes('no-store')) {
    return false;
  }
  
  return true;
}

// Função para gerar chave de cache baseada na requisição
export function generateCacheKey(request: NextRequest, baseKey: string): string {
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  
  if (searchParams) {
    return `${baseKey}:${url.pathname}:${searchParams}`;
  }
  
  return `${baseKey}:${url.pathname}`;
}

// Função para verificar TTL do cache
export async function getCacheTTL(key: string): Promise<number> {
  try {
    const cacheManager = await getCacheManager();
    return await cacheManager.ttl(key);
  } catch (error) {
    console.error('Erro ao obter TTL do cache:', error);
    return -1;
  }
}

// Função para verificar se chave existe no cache
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const cacheManager = await getCacheManager();
    return await cacheManager.exists(key);
  } catch (error) {
    console.error('Erro ao verificar existência do cache:', error);
    return false;
  }
}

export default {
  withCache,
  withCacheInvalidation,
  invalidateCacheByTag,
  invalidateCacheByPattern,
  clearAllCache,
  getCacheStats,
  addCacheHeaders,
  shouldUseCache,
  generateCacheKey,
  getCacheTTL,
  cacheExists,
};
