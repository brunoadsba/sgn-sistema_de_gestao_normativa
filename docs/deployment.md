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

**Deploy Guide atualizado em:** 15 de setembro de 2025  
**Status:** 🚀 **Enterprise Deployment Guide + Dashboard de Conformidade + Terminologia SST Profissional**  
**Capacidade:** Deploy profissional com dashboard executivo, terminologia adequada e funcionalidades avançadas

---

## ✅ **MELHORIAS TÉCNICAS IMPLEMENTADAS (15 de setembro de 2025)**

### **🔧 Correções de Deploy Realizadas**

#### **1. Dashboard de Conformidade**
- **Problema:** Falta de interface executiva para conformidade
- **Solução:** Dashboard completo com KPIs, oportunidades e avaliações
- **Status:** ✅ **IMPLEMENTADO**

#### **2. Terminologia SST**
- **Problema:** Termos técnicos inadequados para SST
- **Solução:** Terminologia profissional em português brasileiro
- **Status:** ✅ **IMPLEMENTADO**

#### **3. Correções React**
- **Problema:** Erros de React.Children.only e Button asChild
- **Solução:** Correções de componentes e props
- **Status:** ✅ **RESOLVIDO**

#### **4. Cache Next.js**
- **Problema:** Cache não atualizava dados
- **Solução:** Otimização e correção do sistema de cache
- **Status:** ✅ **RESOLVIDO**

### **🚀 Novas Funcionalidades de Deploy**

#### **1. Dashboard de Conformidade**
- **Interface:** Executiva com KPIs e métricas
- **Funcionalidades:** Oportunidades, avaliações, conformidade
- **Status:** ✅ **IMPLEMENTADO**

#### **2. Terminologia SST**
- **Termos:** Conforme, Não Conforme, Oportunidade de Melhoria
- **Métricas:** Índice de Conformidade, Avaliações, Lacunas
- **Status:** ✅ **IMPLEMENTADO**

#### **3. Empresas Profissionais**
- **Dados:** Construtora BR, Tech BR, Indústrias BR
- **Realismo:** CNPJs e informações corporativas
- **Status:** ✅ **IMPLEMENTADO**

#### **4. Correções Técnicas**
- **React:** Componentes e props corrigidos
- **Cache:** Sistema otimizado
- **Mapeamento:** Dados corretos
- **Status:** ✅ **IMPLEMENTADO**

### **🧪 Testes de Deploy**

#### **✅ Testes Aprovados:**
1. **Dashboard de Conformidade:** Funcionando
2. **Empresas:** Listagem e detalhes
3. **Terminologia SST:** Adequada
4. **Cache:** Otimizado
5. **Componentes React:** Sem erros

### **🎯 Próximos Passos de Deploy**

#### **1. Sistema de Alertas**
- Alertas básicos para conformidade
- Notificações de oportunidades

#### **2. Validação Zod**
- Schemas para APIs
- Validação robusta

#### **3. Testes Automatizados**
- Testes unitários
- Testes de integração

---

**Deploy Guide atualizado em:** 15 de setembro de 2025  
**Status:** 🚀 **Enterprise Deployment Guide + Dashboard de Conformidade + Terminologia SST Profissional**  
**Capacidade:** Deploy profissional com dashboard executivo, terminologia adequada e funcionalidades avançadas
