# SGN - Performance Optimization Guide

Este guia detalha as otimizações de performance implementadas no Sistema de Gestão Normativa (SGN).

## 🚀 Visão Geral

O SGN implementa um sistema completo de otimização de performance com:

- **Cache Redis**: Cache distribuído para APIs e dados
- **React Query**: Cache inteligente no frontend
- **Middleware de Cache**: Cache automático para APIs
- **Dashboard de Performance**: Monitoramento em tempo real
- **Testes de Performance**: Automação com Artillery

## 📊 Arquitetura de Performance

### 1. Cache Redis

**Localização**: `src/lib/cache/redis.ts`

**Funcionalidades**:
- Cache distribuído com TTL configurável
- Suporte a diferentes tipos de dados
- Invalidação por tags e padrões
- Estatísticas de uso
- Fallback automático

**Configuração**:
```typescript
// TTL padrão (em segundos)
CACHE_TTL = {
  NORMAS: 3600,        // 1 hora
  NORMA_DETAIL: 7200,  // 2 horas
  IA_ANALYSIS: 86400,  // 24 horas
  HEALTH_CHECK: 60,    // 1 minuto
}
```

### 2. React Query

**Localização**: `src/lib/cache/query-client.ts`

**Funcionalidades**:
- Cache inteligente no frontend
- Retry automático com backoff
- Prefetch de dados
- Invalidação seletiva
- DevTools para desenvolvimento

**Configuração**:
```typescript
// Tempos de cache
staleTime: 5 * 60 * 1000,  // 5 minutos
gcTime: 10 * 60 * 1000,    // 10 minutos
retry: 3,                  // 3 tentativas
```

### 3. Middleware de Cache

**Localização**: `src/middlewares/cache.ts`

**Funcionalidades**:
- Cache automático para APIs
- Headers de cache HTTP
- Invalidação por tags
- Estatísticas de hit/miss
- Fallback para erros

## 🛠️ Configuração

### 1. Variáveis de Ambiente

```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Cache
CACHE_TTL_NORMAS=3600
CACHE_TTL_IA_ANALYSIS=86400
CACHE_TTL_HEALTH_CHECK=60

# Performance
PERFORMANCE_MONITORING=true
PERFORMANCE_LOG_INTERVAL=30000
```

### 2. Docker Compose

O Redis está configurado no `docker-compose.yml`:

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
```

## 🚀 Uso

### 1. Hooks de API

```typescript
import { useNormas, useIAAnalysis, useCacheInvalidation } from '@/hooks/useApi';

// Buscar normas com cache automático
const { data: normas, isLoading, error } = useNormas({ page: 1, limit: 10 });

// Análise de IA com cache
const { data: analysis } = useIAAnalysis('empresa-123');

// Invalidação de cache
const { invalidateNormas, clearAll } = useCacheInvalidation();
```

### 2. Cache Manual

```typescript
import { getCacheManager, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis';

// Obter cache manager
const cacheManager = await getCacheManager();

// Armazenar dados
await cacheManager.set('key', data, CACHE_TTL.NORMAS);

// Recuperar dados
const data = await cacheManager.get('key');

// Verificar existência
const exists = await cacheManager.exists('key');
```

### 3. Invalidação de Cache

```typescript
import { invalidateCacheByTag, invalidateCacheByPattern } from '@/middlewares/cache';

// Invalidar por tag
await invalidateCacheByTag('normas');

// Invalidar por padrão
await invalidateCacheByPattern('normas:*');
```

## 📈 Dashboard de Performance

### Acesso

Navegue para `/performance` para acessar o dashboard.

### Funcionalidades

- **Status do Sistema**: Health check em tempo real
- **Status do Banco**: Conexão Supabase
- **Status do Cache**: Redis e estatísticas
- **Gerenciamento de Cache**: Limpeza seletiva
- **Métricas**: Tempo de resposta e uptime

### APIs Disponíveis

- `GET /api/cache/stats` - Estatísticas do cache
- `DELETE /api/cache?action=all` - Limpar todo cache
- `DELETE /api/cache?action=tag&tag=normas` - Limpar por tag
- `POST /api/cache/invalidate` - Invalidar específico

## 🧪 Testes de Performance

### Script Automatizado

```bash
# Teste básico
npm run perf:test

# Teste em produção
npm run perf:test:prod

# Teste pesado
npm run perf:test:heavy
```

### Configuração Manual

```bash
# Teste customizado
./scripts/performance-test.sh http://localhost:3001 20 120
```

### Métricas Coletadas

- **Throughput**: Requests por segundo
- **Latência**: Tempo de resposta médio e P95
- **Taxa de Erro**: Percentual de falhas
- **Cobertura**: Todos os endpoints principais

### Cenários de Teste

1. **Health Check** (20%): Verificação de saúde
2. **Normas List** (40%): Listagem de normas
3. **Normas Stats** (20%): Estatísticas
4. **Cache Stats** (10%): Estatísticas de cache
5. **IA Analysis** (10%): Análise de IA

## 📊 Métricas de Performance

### Objetivos

- **Tempo de Resposta**: < 2s para APIs críticas
- **Throughput**: > 100 requests/segundo
- **Taxa de Erro**: < 1%
- **Cache Hit Rate**: > 80%
- **Uptime**: > 99.9%

### Monitoramento

```typescript
// Logs de performance automáticos
logPerformance('normas_list', duration, { 
  correlationId, 
  totalNormas: count,
  cacheHit: true 
});

// Métricas de negócio
logBusinessMetrics({
  'normas_total': count,
  'cache_hit_rate': hitRate,
  'response_time': duration
}, { correlationId });
```

## 🔧 Otimizações Implementadas

### 1. Cache de APIs

- **Normas**: Cache de 1 hora com invalidação por tag
- **IA Analysis**: Cache de 24 horas para resultados
- **Health Check**: Cache de 1 minuto
- **Stats**: Cache de 30 minutos

### 2. React Query

- **Prefetch**: Dados carregados antecipadamente
- **Background Refetch**: Atualização em background
- **Optimistic Updates**: Updates otimistas
- **Error Boundaries**: Tratamento de erros

### 3. Middleware de Cache

- **Headers HTTP**: Cache-Control automático
- **ETags**: Validação condicional
- **Compression**: Gzip automático
- **CDN Ready**: Headers para CDN

### 4. Database Optimization

- **Connection Pooling**: Pool de conexões
- **Query Optimization**: Queries otimizadas
- **Indexes**: Índices para performance
- **Pagination**: Paginação eficiente

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Cache não funcionando

```bash
# Verificar Redis
redis-cli ping

# Verificar logs
tail -f logs/cache.log

# Limpar cache
curl -X DELETE http://localhost:3001/api/cache?action=all
```

#### 2. Performance baixa

```bash
# Executar teste de performance
npm run perf:test

# Verificar métricas
curl http://localhost:3001/api/cache/stats

# Verificar health
curl http://localhost:3001/api/health
```

#### 3. Memory leaks

```bash
# Verificar uso de memória Redis
redis-cli info memory

# Verificar cache size
redis-cli dbsize

# Limpar cache antigo
redis-cli flushdb
```

### Logs de Performance

```bash
# Logs de cache
grep "cache_hit\|cache_miss" logs/app.log

# Logs de performance
grep "performance" logs/app.log

# Logs de React Query
grep "react-query" logs/app.log
```

## 📚 Recursos Adicionais

- [Redis Documentation](https://redis.io/documentation)
- [React Query Guide](https://tanstack.com/query/latest)
- [Artillery Documentation](https://artillery.io/docs/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

## 🤝 Suporte

Para problemas de performance:

1. Verifique o dashboard em `/performance`
2. Execute testes de performance
3. Consulte os logs de cache
4. Abra uma issue no repositório
5. Entre em contato com a equipe de DevOps
