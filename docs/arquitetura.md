# SGN - Arquitetura Enterprise

## Visão Geral

**Stack Enterprise:**
- **Frontend:** Next.js 15 (app directory), TypeScript, shadcn/ui, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage), API Routes Enterprise
- **Automação:** N8N (coleta normativa automatizada)
- **Arquitetura:** Multi-tenant com Row Level Security (RLS)

## Arquitetura Multi-tenant Enterprise

### Sistema de Isolamento de Dados
- **RLS (Row Level Security)** implementado em todas as tabelas corporativas
- **Políticas de acesso** por tenant configuradas
- **Isolamento completo** entre empresas clientes
- **Escalabilidade** enterprise para múltiplos clientes

## Banco de Dados Enterprise

### Tabelas MVP (Base)
- `normas` - 38 Normas Regulamentadoras coletadas automaticamente
- `versoes` - Versionamento de normas
- `mudancas` - Histórico de alterações

### Tabelas Multi-tenant
- `empresas` - Gestão de clientes corporativos
- `documentos_empresa` - Documentos por empresa com storage
- `analises_conformidade` - Análises básicas por norma

### Tabelas Sistema de Conformidade Enterprise ✨ **NOVO**
- `analise_jobs` - Sistema de jobs assíncronos enterprise
- `analise_resultados` - Resultados detalhados das análises
- `conformidade_gaps` - Gaps identificados com severidade e ações

### Configurações de Storage
- **Bucket:** `documentos-empresa` (privado)
- **Policies:** Acesso controlado por empresa
- **Versionamento:** Automático para documentos empresariais

## APIs Enterprise

### APIs MVP (Base)
- `GET /api/normas` - Listagem de normas com filtros avançados
- `GET /api/normas/[id]` - Detalhes de norma específica
- `GET /api/normas/stats` - Estatísticas do sistema
- `GET /api/search` - Busca inteligente com ranking
- `GET /api/export` - Exportação de dados (CSV/JSON)
- `GET /api/rate-limit` - Proteção contra abuso

### APIs Multi-tenant
- `GET/POST /api/empresas` - Gestão de empresas clientes
- `GET/POST /api/empresas/[id]/documentos` - Upload e gestão documental

### APIs de Conformidade Enterprise ✨ **NOVO**
- `POST /api/conformidade/analisar` - Iniciar análise de conformidade
- `GET /api/conformidade/analisar` - Listar jobs por empresa
- `GET /api/conformidade/jobs/[id]` - Status detalhado do job
- `PUT /api/conformidade/jobs/[id]` - Atualizar progresso (workers)
- `DELETE /api/conformidade/jobs/[id]` - Cancelar job
- `GET /api/conformidade/dashboard/[empresaId]` - Dashboard executivo
- `GET /api/conformidade/relatorios/[empresaId]` - Relatórios customizados
- `POST /api/conformidade/relatorios/[empresaId]` - Relatórios personalizados

## Sistema de Jobs Enterprise

### Arquitetura de Processamento
```typescript
// Fluxo de Análise Enterprise
1. POST /api/conformidade/analisar → Criar job
2. Job salvo com status 'pending' → Queue system
3. Worker processa análise → Atualiza progresso
4. Resultado salvo → Status 'completed'
5. Dashboard atualizado → Métricas em tempo real
```

### Estados do Job
- `pending` - Aguardando processamento
- `running` - Em processamento
- `completed` - Concluído com sucesso
- `failed` - Falhou (com detalhes do erro)
- `cancelled` - Cancelado pelo usuário

### Prioridades
- **1-3:** Baixa prioridade
- **4-6:** Prioridade média (padrão)
- **7-10:** Alta prioridade (empresas premium)

## Padrões de Desenvolvimento Enterprise

### Estrutura de Tipos TypeScript
```typescript
// Localização: /frontend/src/types/conformidade.ts
- Empresa, DocumentoEmpresa, AnaliseConformidade (base)
- AnaliseJob, AnaliseResult, AnaliseDetalhada (enterprise)
- Gap, TrechoAnalise, Recomendacao, PlanoAcao (análise)
- ApiResponseEmpresas, ApiResponseAnaliseJob (responses)
```

### Padrões de API
```typescript
// Response padrão para todas as APIs
{
  success: boolean,
  data: T | T[],
  pagination?: { page, limit, total, totalPages },
  error?: string
}
```

### Tratamento de Erros Enterprise
- **Graceful degradation** - Sistema nunca quebra completamente
- **Logging adequado** - console.warn para monitoramento
- **Fallbacks defensivos** - Queries resilientes
- **Validação robusta** - Entrada e saída validadas

## Configurações de Ambiente

### Arquivo .env.local (Frontend)
```env
# Supabase - Configuração
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica
SUPABASE_SERVICE_ROLE_KEY=sua_chave_privada

# N8N - Automação (opcional)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/sgn
N8N_API_KEY=sua_chave_n8n
```

### Segurança Enterprise
- **Service Role Key** - Nunca expor no frontend
- **RLS Policies** - Isolamento por tenant
- **CORS** - Configurado adequadamente
- **Rate Limiting** - Proteção contra abuso

## Estrutura de Diretórios

```
/home/brunoadsba/sgn/
├── frontend/src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── normas/           # APIs MVP
│   │   │   ├── empresas/         # APIs Multi-tenant
│   │   │   └── conformidade/     # APIs Enterprise ✨
│   │   ├── empresas/
│   │   │   └── [id]/conformidade/page.tsx  # UI Executiva ✨
│   │   └── normas/               # Interface MVP
│   ├── components/
│   │   ├── ui/
│   │   │   └── progress.tsx      # Componente Progress acessível ✨
│   │   └── conformidade/         # Componentes Enterprise ✨
│   │       ├── Kpis.tsx          # KPIs executivos
│   │       ├── GapsTable.tsx     # Tabela de gaps
│   │       └── JobsList.tsx      # Lista de jobs
│   ├── types/
│   │   └── conformidade.ts       # Tipos Enterprise ✨
│   └── lib/
│       └── supabase.ts           # Cliente configurado
├── docs/                         # Documentação completa
└── scripts/                      # Scripts de deploy
```

## 🎉 **DOCUMENTAÇÃO COMPLETAMENTE ATUALIZADA!**

**Todos os arquivos atualizados com sucesso:**
- ✅ `status-implementacao.md` - Progresso real 95%
- ✅ `docs/roadmap.md` - Metas alcançadas
- ✅ `docs/melhorias.md` - Engine implementada
- ✅ `docs/plano-de-acao.md` - Transformação concluída
- ✅ `docs/pendente.md` - Conquistas documentadas
- ✅ `docs/arquitetura.md` - Arquitetura enterprise completa

**O projeto SGN agora tem documentação 100% atualizada refletindo a transformação de MVP para plataforma enterprise de conformidade automatizada!** 🚀

## Performance e Escala

### Otimizações Implementadas
- **Queries defensivas** - Evitam falhas em cenários edge
- **Índices estratégicos** - Performance para volume corporativo
- **Cache apropriado** - revalidate configurado por endpoint
- **Paginação** - Controle de carga em todas as listagens

### Otimizações de Performance Enterprise ✨ **NOVO - 1º de setembro de 2025**
- **Server Components (RSC)** - Renderização otimizada no servidor
- **Streaming SSR** - Carregamento progressivo com Suspense
- **Cache agressivo** - `unstable_cache` para dados estáticos
- **PWA** - Service Worker para cache offline
- **Build otimizado** - Bundle splitting e compressão
- **TypeScript limpo** - Zero warnings, tipos específicos

### Monitoramento Enterprise
- **Logs estruturados** - Para análise de performance
- **Métricas de jobs** - Tempo de processamento
- **Dashboard de health** - Status do sistema
- **Alertas defensivos** - Degradação graceful

## Deploy e Infraestrutura

### Ambientes
- **Desenvolvimento:** localhost:3001 + Supabase
- **Staging:** Vercel + Supabase (preview)
- **Produção:** Vercel + Supabase (main)

### Monitoramento
- **Vercel Analytics** - Performance do frontend
- **Supabase Metrics** - Performance do backend
- **N8N Monitoring** - Status da automação

### Correções de Erros Críticos ✨ **NOVO - 1º de setembro de 2025**
- **Next.js 15 compatibility** - `searchParams` com `await`
- **Service Worker** - URLs validadas, cache funcional
- **Build process** - 100% limpo, zero warnings
- **TypeScript** - Tipos específicos, sem `any`

---

**Arquitetura atualizada em:** 1º de setembro de 2025  
**Status:** 🏆 **Enterprise-grade Multi-tenant Compliance Platform + Performance Otimizada**  
**Capacidade:** Suporte para múltiplas empresas com isolamento completo e performance enterprise