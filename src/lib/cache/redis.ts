import Redis from 'ioredis';
import { logError } from '@/lib/logger';
import { env } from '@/lib/env';

// Configuração do Redis
const redisConfig = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
  db: parseInt(env.REDIS_DB),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnClusterDown: 300,
  enableOfflineQueue: false,
  maxLoadingTimeout: 10000,
};

// Instância do Redis para cache
let redis: Redis | null = null;

// Função para conectar ao Redis
export async function connectRedis(): Promise<Redis> {
  if (redis && redis.status === 'ready') {
    return redis;
  }

  try {
    redis = new Redis(redisConfig);
    
    redis.on('connect', () => {
      console.log('✅ Redis conectado com sucesso');
    });
    
    redis.on('error', (error) => {
      logError(error, { context: 'redis-connection' });
      console.error('❌ Erro na conexão Redis:', error.message);
    });
    
    redis.on('close', () => {
      console.log('🔌 Conexão Redis fechada');
    });
    
    redis.on('reconnecting', () => {
      console.log('🔄 Reconectando ao Redis...');
    });
    
    await redis.connect();
    return redis;
  } catch (error) {
    logError(error as Error, { context: 'redis-connection' });
    console.error('❌ Falha ao conectar Redis:', error);
    throw error;
  }
}

// Função para obter instância do Redis
export function getRedis(): Redis | null {
  return redis;
}

// Função para desconectar do Redis
export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.disconnect();
    redis = null;
  }
}

// Função para verificar se Redis está disponível
export async function isRedisAvailable(): Promise<boolean> {
  try {
    if (!redis || redis.status !== 'ready') {
      await connectRedis();
    }
    await redis!.ping();
    return true;
  } catch (error) {
    return false;
  }
}

// Cache helper functions
export class CacheManager {
  private redis: Redis;
  
  constructor(redisInstance: Redis) {
    this.redis = redisInstance;
  }
  
  // Set com TTL
  async set(key: string, value: unknown, ttlSeconds: number = 3600): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttlSeconds, serialized);
    } catch (error) {
      logError(error as Error, { context: 'cache-set', key });
    }
  }
  
  // Get com fallback
  async get<T>(key: string, fallback?: T): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return fallback || null;
    } catch (error) {
      logError(error as Error, { context: 'cache-get', key });
      return fallback || null;
    }
  }
  
  // Delete
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logError(error as Error, { context: 'cache-delete', key });
    }
  }
  
  // Delete pattern (usa SCAN em vez de KEYS para não bloquear Redis)
  async deletePattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      logError(error as Error, { context: 'cache-delete-pattern', pattern });
    }
  }
  
  // Exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logError(error as Error, { context: 'cache-exists', key });
      return false;
    }
  }
  
  // TTL
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      logError(error as Error, { context: 'cache-ttl', key });
      return -1;
    }
  }
  
  // Increment
  async increment(key: string, value: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, value);
    } catch (error) {
      logError(error as Error, { context: 'cache-increment', key });
      return 0;
    }
  }
  
  // Set hash
  async hset(key: string, field: string, value: unknown): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.hset(key, field, serialized);
    } catch (error) {
      logError(error as Error, { context: 'cache-hset', key, field });
    }
  }
  
  // Get hash
  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redis.hget(key, field);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      logError(error as Error, { context: 'cache-hget', key, field });
      return null;
    }
  }
  
  // Get all hash fields
  async hgetall<T>(key: string): Promise<Record<string, T>> {
    try {
      const hash = await this.redis.hgetall(key);
      const result: Record<string, T> = {};
      
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value as T;
        }
      }
      
      return result;
    } catch (error) {
      logError(error as Error, { context: 'cache-hgetall', key });
      return {};
    }
  }
  
  // Clear all cache
  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      logError(error as Error, { context: 'cache-clear' });
    }
  }
  
  // Get cache stats
  async getStats(): Promise<{
    keys: number;
    memory: string;
    connected: boolean;
  }> {
    try {
      const info = await this.redis.info('memory');
      const keys = await this.redis.dbsize();
      
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memory = memoryMatch ? memoryMatch[1] : 'unknown';
      
      return {
        keys,
        memory,
        connected: this.redis.status === 'ready',
      };
    } catch (error) {
      logError(error as Error, { context: 'cache-stats' });
      return {
        keys: 0,
        memory: 'unknown',
        connected: false,
      };
    }
  }
}

// Instância global do cache manager
let cacheManager: CacheManager | null = null;

export async function getCacheManager(): Promise<CacheManager> {
  if (!cacheManager) {
    const redis = await connectRedis();
    cacheManager = new CacheManager(redis);
  }
  return cacheManager;
}

// Cache keys constants
export const CACHE_KEYS = {
  NORMAS: 'normas',
  NORMA_DETAIL: 'norma:detail',
  NORMA_STATS: 'norma:stats',
  IA_ANALYSIS: 'ia:analysis',
  IA_ANALYSIS_RESULT: 'ia:analysis:result',
  USER_SESSION: 'user:session',
  API_RATE_LIMIT: 'api:rate_limit',
  HEALTH_CHECK: 'health:check',
} as const;

// Cache TTL constants (em segundos)
export const CACHE_TTL = {
  NORMAS: 3600, // 1 hora
  NORMA_DETAIL: 7200, // 2 horas
  NORMA_STATS: 1800, // 30 minutos
  IA_ANALYSIS: 86400, // 24 horas
  IA_ANALYSIS_RESULT: 604800, // 7 dias
  USER_SESSION: 3600, // 1 hora
  API_RATE_LIMIT: 900, // 15 minutos
  HEALTH_CHECK: 60, // 1 minuto
} as const;

export default redis;
