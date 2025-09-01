# Guia de Deploy

## Pré-requisitos

- Conta no Vercel
- Projeto no Supabase configurado
- N8N rodando (local ou cloud)
- Node.js 20+

## Deploy no Vercel

### 1. Configuração inicial
```bash
npm install -g vercel
vercel login
```

### 2. Deploy do frontend
```bash
cd frontend
vercel --prod
```

### 3. Variáveis de ambiente no Vercel
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Configuração Supabase

### 1. Banco de dados
- Executar scripts SQL das tabelas (ver `docs/runbooks/agente.md`)
- Configurar RLS policies
- Popular tabelas iniciais

### 2. Storage
- Criar bucket `documentos-empresa`
- Configurar policies de acesso

### 3. Auth (opcional para futuro)
- Configurar providers de autenticação
- Configurar redirect URLs

## Setup N8N

### Local
```bash
npm install -g n8n
n8n start
```

### Cloud
- Configurar webhook endpoints
- Agendar execução de workflows
- Conectar com Supabase

## Monitoramento

- Logs do Vercel
- Métricas do Supabase
- Status do N8N

## Troubleshooting

### Erro de conexão Supabase
- Verificar variáveis de ambiente
- Confirmar URLs e chaves

### Falha no N8N
- Verificar credenciais Supabase
- Testar conectividade manual

### Erros de Build ✨ **NOVO - 1º de setembro de 2025**

#### Erro: `searchParams` deve ser `await`
**Problema:** Next.js 15 mudou o comportamento do `searchParams`
**Solução:**
```typescript
// Antes (Next.js 14)
export default function Page({ searchParams }: { searchParams?: SearchParams }) {
  const page = Number(searchParams?.page) || 1
}

// Agora (Next.js 15)
export default async function Page({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = await searchParams
  const page = Number(params?.page) || 1
}
```

#### Erro: Service Worker cache inválido
**Problema:** `"Unable to add filesystem: <illegal path>"`
**Solução:**
```javascript
// Validar URLs antes de cachear
const CRITICAL_ASSETS = [
  '/',
  '/normas',
  '/empresas'
]

// Evitar URLs inválidas
async function validateAndCache(urls) {
  const validUrls = []
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok) validUrls.push(url)
    } catch (error) {
      console.warn(`URL inválida: ${url}`)
    }
  }
  return validUrls
}
```

#### Erro: Build TypeScript com warnings
**Problema:** Uso de `any` types e variáveis não utilizadas
**Solução:**
```bash
# Verificar tipos
cd frontend && npx tsc --noEmit

# Corrigir tipos específicos
# Substituir 'any' por tipos específicos
# Remover variáveis não utilizadas
```

### Performance em Produção ✨ **NOVO - 1º de setembro de 2025**

#### Otimizações Implementadas
- **Server Components** - Renderização otimizada
- **Streaming SSR** - Carregamento progressivo
- **Cache agressivo** - `unstable_cache` para dados
- **PWA** - Service Worker funcional
- **Bundle splitting** - Chunks otimizados

#### Métricas de Performance
- **Lighthouse Score** - Performance ≥ 95
- **First Contentful Paint** - < 1.5s
- **Largest Contentful Paint** - < 2.5s
- **Cumulative Layout Shift** - < 0.1

### Monitoramento Avançado ✨ **NOVO - 1º de setembro de 2025**

#### Logs Estruturados
```bash
# Verificar logs de erro
tail -f logs/error.log

# Verificar logs combinados
tail -f logs/combined.log

# Métricas de performance
npm run build && npm run start
```

#### Health Checks
- **API Status** - `/api/health`
- **Database Connection** - Supabase metrics
- **Service Worker** - Cache status
- **Build Status** - Zero warnings

### Backup e Recuperação ✨ **NOVO - 1º de setembro de 2025**

#### Backup Automático
```bash
# Backup do banco Supabase
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Backup dos documentos
aws s3 sync ./uploads s3://backup-bucket/documents/
```

#### Recuperação de Desastres
- **RTO** - Recovery Time Objective < 4 horas
- **RPO** - Recovery Point Objective < 1 hora
- **Backup diário** - Automatizado
- **Teste de recuperação** - Mensal

### Segurança ✨ **NOVO - 1º de setembro de 2025**

#### Headers de Segurança
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  }
]
```

#### RLS (Row Level Security)
- **Políticas por tenant** - Isolamento de dados
- **Auditoria** - Log de acessos
- **Backup seguro** - Criptografia

### Escalabilidade ✨ **NOVO - 1º de setembro de 2025**

#### Load Balancing
- **Vercel Edge** - CDN global
- **Supabase** - Auto-scaling
- **Rate Limiting** - Proteção contra abuso

#### Monitoramento de Recursos
- **CPU Usage** - < 80%
- **Memory Usage** - < 85%
- **Database Connections** - < 90%
- **API Response Time** - < 300ms

### Rollback ✨ **NOVO - 1º de setembro de 2025**

#### Estratégia de Rollback
```bash
# Rollback rápido
vercel rollback

# Rollback para versão específica
vercel rollback <deployment-url>

# Verificar status
vercel ls
```

#### Validação Pós-Deploy
- **Smoke tests** - Funcionalidades críticas
- **Performance tests** - Métricas de velocidade
- **Integration tests** - APIs funcionando
- **User acceptance** - Teste manual

---

**Deploy Guide atualizado em:** 1º de setembro de 2025  
**Status:** 🚀 **Enterprise Deployment Guide**  
**Capacidade:** Deploy profissional com monitoramento e recuperação

---

## ✅ **MELHORIAS TÉCNICAS IMPLEMENTADAS (1º de setembro de 2025)**

### **🔧 Correções de Deploy Realizadas**

#### **1. Build Process Otimizado**
- **Problema:** Build com warnings TypeScript
- **Solução:** Build 100% limpo, zero warnings
- **Status:** ✅ **RESOLVIDO**

#### **2. Service Worker Deployment**
- **Problema:** Cache inválido em produção
- **Solução:** URLs validadas, cache funcional
- **Status:** ✅ **RESOLVIDO**

#### **3. Health Check Endpoint**
- **Endpoint:** `/api/health`
- **Funcionalidade:** Monitoramento de serviços
- **Status:** ✅ **IMPLEMENTADO**

### **🚀 Novas Funcionalidades de Deploy**

#### **1. Logging Estruturado**
- **Biblioteca:** Pino
- **Formato:** JSON para produção
- **Status:** ✅ **IMPLEMENTADO**

#### **2. Validação de Dados**
- **Biblioteca:** Zod
- **Schemas:** Empresas e normas
- **Status:** ✅ **IMPLEMENTADO**

#### **3. Tratamento de Erros**
- **Middleware:** Erro estruturado
- **Padrão:** Respostas consistentes
- **Status:** ✅ **IMPLEMENTADO**

### **🧪 Testes de Deploy**

#### **✅ Testes Aprovados:**
1. **Build:** 100% limpo
2. **Health Check:** Funcionando
3. **Service Worker:** Cache otimizado
4. **APIs:** Todas operacionais
5. **Logs:** Estruturados

### **🎯 Próximos Passos de Deploy**

#### **1. Docker Containerização**
- Dockerfile para produção
- Docker Compose para desenvolvimento
- Containerização completa

#### **2. CI/CD Pipeline**
- GitHub Actions
- Deploy automatizado
- Testes automatizados

#### **3. Monitoramento Avançado**
- Métricas de performance
- Alertas automáticos
- Dashboard de monitoramento

---

**Deploy Guide atualizado em:** 1º de setembro de 2025  
**Status:** 🚀 **Enterprise Deployment Guide + Melhorias Técnicas Implementadas**  
**Capacidade:** Deploy profissional com monitoramento, recuperação e qualidade enterprise-grade
