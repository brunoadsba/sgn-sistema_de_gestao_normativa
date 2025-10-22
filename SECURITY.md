# SGN - Security Hardening Guide

Este guia detalha as medidas de segurança enterprise-grade implementadas no Sistema de Gestão Normativa (SGN).

## 🛡️ Visão Geral

O SGN implementa um sistema completo de segurança com:

- **Rate Limiting**: Proteção contra ataques de força bruta e DDoS
- **CORS**: Controle de acesso cross-origin configurável
- **CSP**: Content Security Policy para prevenir XSS
- **Security Headers**: Headers de segurança HTTP
- **Attack Protection**: Proteção contra ataques comuns
- **Security Dashboard**: Monitoramento em tempo real

## 🔒 Arquitetura de Segurança

### 1. Rate Limiting com Redis

**Localização**: `src/middlewares/rate-limit.ts`

**Funcionalidades**:
- Rate limiting distribuído com Redis
- Diferentes limites por tipo de endpoint
- Headers informativos de rate limiting
- Logging de tentativas suspeitas
- Reset manual de limites

**Configurações**:
```typescript
RATE_LIMIT_CONFIG = {
  general: { windowMs: 15min, max: 100 },    // Geral
  api: { windowMs: 1min, max: 30 },         // APIs
  ia: { windowMs: 5min, max: 5 },           // IA
  upload: { windowMs: 10min, max: 10 },      // Uploads
  auth: { windowMs: 15min, max: 5 },        // Auth
}
```

### 2. CORS Configurável

**Localização**: `src/middlewares/security.ts`

**Funcionalidades**:
- Configuração por ambiente (dev/prod)
- Validação de origins permitidas
- Headers CORS automáticos
- Suporte a credentials
- Preflight handling

**Configurações**:
```typescript
CORS_CONFIG = {
  development: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
  production: {
    origin: ['https://sgn.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
}
```

### 3. Content Security Policy (CSP)

**Funcionalidades**:
- Políticas restritivas por ambiente
- Prevenção de XSS
- Controle de recursos carregados
- Configuração granular por diretiva

**Configurações**:
```typescript
CSP_CONFIG = {
  development: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
  },
  production: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
  },
}
```

### 4. Security Headers

**Headers Implementados**:
- `X-Frame-Options`: Previne clickjacking
- `X-Content-Type-Options`: Previne MIME sniffing
- `X-XSS-Protection`: Proteção XSS
- `Referrer-Policy`: Controle de referrer
- `Permissions-Policy`: Controle de APIs do browser
- `Strict-Transport-Security`: HSTS (produção)
- `Cross-Origin-*`: Políticas cross-origin

### 5. Attack Protection

**Proteções Implementadas**:
- **Path Traversal**: Detecção de `../` e `..\\`
- **SQL Injection**: Padrões básicos de SQL injection
- **XSS**: Detecção de scripts e eventos
- **Request Size**: Limite de tamanho de request
- **Suspicious Headers**: Detecção de headers suspeitos
- **User-Agent**: Validação de User-Agent

## 🛠️ Configuração

### 1. Variáveis de Ambiente

```bash
# Security Configuration
NODE_ENV=production
SECURITY_ENABLED=true
RATE_LIMIT_ENABLED=true
CORS_ENABLED=true
CSP_ENABLED=true

# Redis Configuration (para rate limiting)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 2. Middleware Application

```typescript
// Aplicar middlewares de segurança
export const GET = withSecurity()(
  rateLimitMiddlewares.api(
    withCache(config)(handler)
  )
);
```

### 3. Next.js Configuration

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        // ... outros headers
      ],
    },
  ];
}
```

## 🚀 Uso

### 1. Rate Limiting

```typescript
import { rateLimitMiddlewares } from '@/middlewares/rate-limit';

// Aplicar rate limiting específico
export const POST = rateLimitMiddlewares.ia(handler);
export const GET = rateLimitMiddlewares.api(handler);
```

### 2. Security Headers

```typescript
import { withSecurity } from '@/middlewares/security';

// Aplicar todos os middlewares de segurança
export const GET = withSecurity()(handler);
```

### 3. CORS Configuration

```typescript
import { withCORS, CORS_CONFIG } from '@/middlewares/security';

// CORS específico
export const GET = withCORS(CORS_CONFIG.production)(handler);
```

### 4. Attack Protection

```typescript
import { withAttackProtection } from '@/middlewares/security';

// Proteção contra ataques
export const POST = withAttackProtection()(handler);
```

## 📊 Security Dashboard

### Acesso

Navegue para `/security` para acessar o dashboard.

### Funcionalidades

- **Security Score**: Avaliação geral (0-100%)
- **CORS Status**: Configuração e status
- **CSP Status**: Diretivas ativas
- **Rate Limiting**: Estatísticas e gerenciamento
- **Security Headers**: Headers aplicados
- **Environment Info**: Configuração por ambiente

### APIs Disponíveis

- `GET /api/security/config` - Configuração de segurança
- `GET /api/security/stats` - Estatísticas de segurança
- `POST /api/security/test` - Teste de configurações
- `POST /api/security/rate-limit/reset` - Reset rate limit

## 🧪 Testes de Segurança

### 1. Teste Automatizado

```bash
# Executar teste de segurança
curl -X POST http://localhost:3001/api/security/test \
  -H "Content-Type: application/json" \
  -d '{"testType": "all"}'
```

### 2. Teste de Rate Limiting

```bash
# Testar rate limiting
for i in {1..10}; do
  curl http://localhost:3001/api/normas
done
```

### 3. Teste de CORS

```bash
# Testar CORS
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS http://localhost:3001/api/normas
```

### 4. Teste de CSP

```bash
# Verificar CSP headers
curl -I http://localhost:3001/ | grep -i content-security-policy
```

## 📈 Métricas de Segurança

### Objetivos

- **Security Score**: > 90%
- **Rate Limit Effectiveness**: > 95% requests dentro do limite
- **Attack Blocking**: 100% ataques conhecidos bloqueados
- **CORS Compliance**: 100% requests de origins válidas
- **CSP Violations**: 0 violações em produção

### Monitoramento

```typescript
// Logs de segurança automáticos
logSecurity('rate_limit_exceeded', 'medium', {
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  endpoint: '/api/ia/analisar-conformidade',
  totalHits: 6,
});

logSecurity('cors_blocked', 'medium', {
  origin: 'https://malicious-site.com',
  method: 'POST',
  endpoint: '/api/normas',
});
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Rate Limiting muito restritivo

```bash
# Verificar configuração
curl http://localhost:3001/api/security/config

# Resetar rate limit
curl -X POST http://localhost:3001/api/security/rate-limit/reset \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.1"}'
```

#### 2. CORS bloqueando requests

```bash
# Verificar origins permitidas
curl http://localhost:3001/api/security/config | jq '.data.config.cors.origin'

# Testar CORS
curl -H "Origin: https://your-domain.com" \
  -X OPTIONS http://localhost:3001/api/normas
```

#### 3. CSP bloqueando recursos

```bash
# Verificar CSP
curl -I http://localhost:3001/ | grep -i content-security-policy

# Verificar console do browser para violações
```

#### 4. Headers não aplicados

```bash
# Verificar headers
curl -I http://localhost:3001/api/normas

# Verificar configuração do Next.js
cat next.config.js | grep -A 20 "async headers"
```

### Logs de Segurança

```bash
# Logs de rate limiting
grep "rate_limit" logs/app.log

# Logs de CORS
grep "cors" logs/app.log

# Logs de ataques
grep "attack" logs/app.log

# Logs de segurança geral
grep "security" logs/app.log
```

## 📚 Recursos Adicionais

- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [CORS MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [CSP MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)

## 🤝 Suporte

Para problemas de segurança:

1. Verifique o dashboard em `/security`
2. Execute testes de segurança
3. Consulte os logs de segurança
4. Abra uma issue no repositório
5. Entre em contato com a equipe de segurança