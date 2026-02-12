# SGN - Memória do Projeto

> Documento de contexto para qualquer LLM que acesse este projeto.
> Atualizado em: 2026-02-12 (sessão 10: limpeza técnica, CI/CD e validação final)

---

## O que é o SGN

SGN (Sistema de Gestão Normativa) é uma plataforma de análise de conformidade com IA para normas regulamentadoras brasileiras de SST (Segurança e Saúde no Trabalho).

**Foco principal:** o usuário sobe documentos de SST e a IA analisa conformidade contra as NRs, gerando relatórios executivos.

Projeto de uso privado. Apenas o proprietário utiliza.

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 15.5.2 |
| Linguagem | TypeScript (strict mode) | 5.9.2 |
| UI | React + Tailwind CSS + shadcn/ui | React 19.1.0 |
| Banco de dados | SQLite (better-sqlite3) + Drizzle ORM | 0.45.1 |
| Cache | Redis (ioredis) | 5.8.2 |
| IA | GROQ SDK (Llama 3.1 8B) | 0.32.0 |
| Validação | Zod | 4.1.5 |
| State | React Query (TanStack) | 5.90.5 |
| Animações | Framer Motion | 12.23.12 |
| Testes | Jest + React Testing Library | 30.2.0 |
| Deploy | Docker (self-hosted) | - |
| Logging | Pino | 10.1.0 |

**Arquitetura simplificada:** Next.js + SQLite local (Drizzle ORM) + GROQ. Sem dependência externa de banco de dados. NRs armazenadas em arquivo TypeScript local (`src/lib/data/normas.ts`). Deploy via Docker com volume persistente para dados.

---

## Estrutura de Pastas

```
/                                   # Raiz do projeto
├── .github/workflows/              # CI/CD (ci, deploy, release, test)
├── docker/                         # nginx.conf + .env.example
├── docs/                           # memory.md + sql/
├── obsoleto/                       # Código/docs removidos (ignorado pelo git e tsconfig)
├── public/                         # sw.js
├── scripts/                        # 8 scripts utilitários (bash, js)
├── src/
│   ├── __tests__/                  # Setup e testes base
│   ├── app/
│   │   ├── api/                    # 27 rotas de API
│   │   │   ├── alertas/            # CRUD alertas conformidade
│   │   │   ├── cache/              # Gerenciamento de cache Redis
│   │   │   ├── conformidade/       # Análise, dashboard, jobs, relatórios
│   │   │   ├── demo/               # Endpoints de demo (bloqueados em prod)
│   │   │   ├── empresas/           # CRUD empresas + documentos
│   │   │   ├── export/             # Exportação CSV/JSON
│   │   │   ├── extrair-texto/      # Extração de texto PDF/DOCX
│   │   │   ├── health/             # Health check
│   │   │   ├── ia/                 # Análise de conformidade com IA
│   │   │   ├── normas/             # CRUD normas + stats
│   │   │   ├── nr6/               # Análise específica NR-6
│   │   │   ├── rate-limit/         # Rate limiting
│   │   │   ├── search/             # Busca inteligente
│   │   │   └── security/           # Config, stats, reset rate-limit
│   │   ├── empresas/               # Páginas de empresas e conformidade
│   │   ├── normas/                 # Páginas de normas
│   │   ├── nr6/                    # Página análise NR-6
│   │   ├── performance/            # Página descontinuada (informativa)
│   │   ├── security/               # Página descontinuada (informativa)
│   │   ├── layout.tsx              # Root layout (nav simplificada)
│   │   └── page.tsx                # Página principal: análise de conformidade
│   ├── components/
│   │   ├── analise/                # UploadDocumento, SeletorNormas, ResultadoAnalise
│   │   ├── conformidade/           # AlertasList, StatusGeral, Kpis, etc (7)
│   │   ├── dashboard/              # (descontinuado no fluxo principal)
│   │   ├── dynamic/                # Lazy loading (DynamicComponents)
│   │   ├── ia/                     # ModalAnaliseIASimples (legado)
│   │   ├── loading/                # LoadingSpinner
│   │   └── ui/                     # shadcn/ui (16 componentes)
│   ├── hooks/                      # use-toast, useApi
│   ├── lib/
│   │   ├── cache/                  # Redis + React Query provider
│   │   ├── constants/              # tipos-documento.ts (60+ tipos SST)
│   │   ├── ia/                     # groq.ts, analisador-nr6.ts
│   │   ├── logger/                 # Pino logger + correlation IDs
│   │   ├── data/                   # normas.ts (38 NRs locais + helpers)
│   │   ├── db/                     # schema.ts (Drizzle) + index.ts (cliente SQLite)
│   │   ├── env.ts                  # Validação de env com Zod
│   │   ├── errors.ts               # Classes de erro + handler centralizado
│   │   └── utils.ts                # cn() helper
│   ├── middlewares/                 # cache, rate-limit, security, validation
│   ├── schemas/                    # Zod schemas (empresa, norma, analise)
│   └── types/                      # TypeScript types (ia.ts, conformidade.ts)
├── .env.example
├── Dockerfile
├── docker-compose.yml / .prod.yml
├── package.json / tsconfig.json
└── next.config.js / tailwind.config.ts
```

---

## Banco de Dados (SQLite local + Drizzle ORM)

### Dados Estáticos (TypeScript)

- 38 NRs armazenadas em `src/lib/data/normas.ts` (36 ativas, 2 revogadas)
- Funções helper: `getNormas()`, `getNormaById()`, `searchNormas()`, `getNormasStats()`

### Tabelas SQLite (Drizzle ORM)

| Tabela | Função |
|--------|--------|
| `empresas` | Empresas cadastradas |
| `documentos_empresa` | Documentos por empresa (PGR, PCMSO, LTCAT, etc) |
| `analise_jobs` | Jobs assíncronos (pending/running/completed/failed/cancelled) |
| `analise_resultados` | Resultados detalhados com scores |
| `conformidade_gaps` | Gaps identificados (severidade: baixa/media/alta/critica) |
| `alertas_conformidade` | Alertas (tipo: oportunidade/risco/prazo/conformidade) |

### Armazenamento

- Banco SQLite: `./data/sgn.db` (volume Docker persistente)
- Uploads de documentos: `./data/uploads/` (filesystem local)
- Schema: `src/lib/db/schema.ts`, Config: `drizzle.config.ts`
- Migrations: `drizzle/` (geradas com `npm run db:generate`)

---

## O que funciona (implementado)

1. **Página principal de análise com IA** (redesign Fase 1 aplicado)
   - Upload de documento com drag-and-drop (PDF, DOCX, TXT)
   - Seleção de NRs aplicáveis (grid multi-select com filtro)
   - Análise de conformidade via GROQ + Llama 3.1 (~1.2s)
   - Exibição de resultado: score, risco, gaps, recomendações, próximos passos
2. CRUD completo de normas e empresas
3. Upload e gestão de documentos SST
4. Dashboard executivo de conformidade por empresa
5. Sistema de alertas de conformidade
6. Busca inteligente com ranking
7. Exportação de dados (CSV/JSON)
8. Geração de relatórios em PDF
9. API de health check
10. Rate limiting básico (middleware)
11. Logging estruturado com Pino
12. CI/CD com GitHub Actions (4 workflows)
13. Docker multi-stage build
14. Validação de env com Zod
15. Schemas Zod para APIs principais (camelCase)
16. Persistência de análise IA em SQLite (`documentos_empresa`, `analise_jobs`, `analise_resultados`, `conformidade_gaps`)
17. CI/CD atualizado para stack sem Supabase (GROQ + SQLite)

---

## O que NÃO funciona / está incompleto

### Prioridade Alta
- Nenhuma rota de API possui autenticação (projeto privado, mas sem proteção)
- Testes automatizados: zero testes unitários/integração/E2E
- Rate limiting existe como middleware mas não é usado nas rotas
- Worker assíncrono real não existe (processamento de conformidade é síncrono)
- Branch `feat/sqlite-migration` precisa ser mergeada na `master`

### Prioridade Média
- React Query não está integrado em todas as páginas
- Monitoramento de produção inexistente (sem Sentry, sem métricas)
- Cache Redis configurado mas pouco utilizado
- Virtualização de listas para grandes volumes
- Gráficos de evolução de conformidade ao longo do tempo

### Prioridade Baixa
- Timeline de análises realizadas
- Comparações side-by-side de documentos

---

## Auditoria realizada em 2026-02-11

### Correções aplicadas (sessão 1 - segurança e código)

| Item | O que foi feito |
|------|----------------|
| Dependências | Removidas 8 dependências Express desnecessárias (cors, helmet, express-brute, etc). 95 pacotes limpos |
| XSS | Deletado `ultra-performance.ts` (usava `innerHTML` direto) |
| Código duplicado | Deletados `utils/errors.ts` e `lib/performance.ts`. Consolidado `utils/logger.ts` como re-export |
| Bug AlertTriangle | Corrigido import ausente em `empresas/[id]/conformidade/page.tsx` |
| Redis KEYS | `deletePattern()` agora usa SCAN com cursor em vez de KEYS bloqueante |
| CSP nonce | Substituído `Date.now()` previsível por `crypto.randomBytes(16)` em `next.config.js` |
| TypeScript errors | `ignoreBuildErrors` agora sempre `false` |
| Tipos any | 14+ ocorrências de `any` substituídas por `unknown`, `Record<string, unknown>`, etc |
| Prompt injection | Adicionada `sanitizeInput()` em `groq.ts` e `analisador-nr6.ts` |
| Demo endpoints | 3 rotas `/api/demo/*` bloqueadas em produção (403) |
| Validação Zod | `POST /api/empresas` agora usa `CreateEmpresaSchema` |
| Imports mortos | Limpos imports comentados e não usados em 5 arquivos |
| Código morto | 4 funções mortas removidas de `ia/analisar-conformidade/route.ts` |
| Constantes | Array de 60+ tipos de documento extraído para `lib/constants/tipos-documento.ts` |
| Supabase direto | Endpoint `criar-alertas-exemplo` migrado de `createClient` direto para `lib/supabase.ts` |

### Reorganização estrutural (sessão 2 - padrão indústria)

| Item | O que foi feito |
|------|----------------|
| Docs na raiz | 13 markdowns movidos da raiz para `docs/` |
| Env files | 4 arquivos de env movidos para `docker/` |
| .env.example | Criado `.env.example` consolidado na raiz |
| netlify.toml | Deletado (plataforma não utilizada) |
| render.yaml | Movido para `docker/` |
| Logger duplicado | Deletado `src/lib/logger.ts` (ambíguo com `src/lib/logger/index.ts`) |
| errorHandler morto | Deletado `src/middlewares/errorHandler.ts` |
| utils/ eliminado | Imports migrados para `@/lib/logger`. Diretório `src/utils/` deletado |
| .gitignore | Reescrito com padrão indústria |
| tsconfig.json | Simplificado paths: apenas `@/*` → `./src/*` |
| tailwind.config.ts | Removido comentário stale de monorepo antigo |

### Simplificação N8N (sessão 3 - remoção de automação)

| Item | O que foi feito |
|------|----------------|
| N8N removido | N8N eliminado do projeto (NRs mudam ~1x/ano, coleta manual suficiente) |
| Scripts | Deletados `generate-n8n-password-reset.js` e `reset-n8n-password.js` |
| Env files | Deletados `docker/.env-n8n.example` e `docker/render.yaml` |
| env.ts | Removidas variáveis `N8N_WEBHOOK_URL` e `N8N_WEBHOOK_TOKEN` do schema Zod |
| Types | Removidas interfaces `WebhookAnalise` e `IntegracaoExterna` de `types/ia.ts` |
| conformidade.ts | Removidos campos `webhook_enabled` e `webhook_url` de `NotificationConfig` |
| docker-compose | Removida env `N8N_WEBHOOK_URL`. Removidos serviços Prometheus e Grafana (não configurados) |
| .env.example | Ambos (raiz e docker/) limpos de referências N8N |
| cleanup.sh | Removido `pkill n8n` |

### 5S - Limpeza geral (sessão 4)

Tudo que não é usado foi movido para `obsoleto/` (ignorado pelo git):

| Categoria | Itens movidos | Motivo |
|-----------|--------------|--------|
| Código morto (src/) | `design-tokens.ts`, `env-init.ts`, `prompts.ts`, `logging.ts`, `ModalAnaliseIA.tsx`, `AnaliseConformidade.tsx` | Não importados por nenhum arquivo |
| Páginas teste | `app/teste/`, `app/teste-ia/` | Não linkadas na navegação |
| Docs históricos | 40+ arquivos e 3 subpastas (Atividades, piloto, runbooks) | Planejamento/implementação concluídos |
| Assets padrão | 5 SVGs do Next.js (file, globe, next, vercel, window) | Nunca referenciados |
| Configs mortos | `docker/ci-cd.env`, `docker/performance.env` | Não referenciados por nenhum workflow |
| Script obsoleto | `atualizar_datas.py` | Referenciava arquivos inexistentes |

**Resultado:** `docs/` ficou com 2 itens (memory.md + sql/). `public/` ficou com 1 item (sw.js). `src/` sem código morto.

### Redesign frontend (sessão 5 - Fase 1)

| Item | O que foi feito |
|------|----------------|
| Página principal | Reescrita de dashboard de normas para página de análise com IA |
| Fluxo principal | Upload (drag-and-drop) > selecionar NRs (grid multi-select) > analisar > ver resultado |
| Navegação | Simplificada: 3 links (Analisar, Empresas, Normas). Removidos Performance e Segurança do nav |
| Footer | Removido (desnecessário para app privado) |
| `UploadDocumento` | Novo componente com drag-and-drop, validação de tipo/tamanho, preview do arquivo |
| `SeletorNormas` | Novo componente: grid de checkboxes, filtro por texto, botões Todas/Limpar, contador |
| `ResultadoAnalise` | Novo componente: score visual, badge de risco, gaps com severidade, próximos passos |
| API normas | Removido `.limit(3)` debug, agora retorna todas as 38 NRs ordenadas |
| Schema Zod | `AnaliseConformidadeSchema` migrado para camelCase (alinhado com interfaces TS) |
| `empresaId` | Tornado opcional no schema e interfaces (IA não usa, era só metadata) |
| `GapConformidade` | Campos `impacto` e `normasRelacionadas` tornados opcionais (IA não retorna sempre) |
| tsconfig.json | Adicionado `obsoleto/` ao exclude |
| TS6133 fixes | ~30 erros de unused params/imports corrigidos em rotas de API e componentes |
| Bugs corrigidos | Import quebrado em `security/rate-limit/reset`, scoping de variável em `normas/page.tsx`, operador lógico em `conformidade/page.tsx` |

### Correções TypeScript strict mode (sessão 6)

| Arquivo | Erros | O que foi corrigido |
|---------|-------|--------------------|
| `src/lib/logger/index.ts` | 1 | Pino `transport` condicional separado (evita `undefined` em `exactOptionalPropertyTypes`) |
| `src/lib/logger/correlation.ts` | 0 | `Record<string, any>` → `Record<string, unknown>` |
| `src/lib/env.ts` | 2 | ZodError `.errors` → `.issues` (Zod v4), removida tipagem inline redundante |
| `src/lib/errors.ts` | 5 | `ApiError` com `undefined` explícito em props opcionais; `withErrorHandler` com type guard para headers |
| `src/lib/cache/redis.ts` | 1 | `password` condicional via spread (evita `string \| undefined` em `RedisOptions`) |
| `src/lib/cache/query-client.tsx` | 1 | `position` → `buttonPosition` (React Query Devtools v5 API) |
| `src/middlewares/rate-limit.ts` | 4 | Removido unused `_correlationId`; `cacheManager` tipado como `CacheManager \| null`; `logRateLimitAttempt` público; `get<number[]>()` genérico; `Function` → `ApiHandler`; `getRateLimitStats` simplificado sem acesso privado |
| `src/middlewares/security.ts` | 5 | `CorsConfig` interface com `readonly string[]`; `Function` → `SecurityApiHandler`; `any[]` → `unknown[]`; cast para comparação de length |
| `src/middlewares/validation.ts` | 2 | ZodError `.errors` → `.issues`; `details?: any` → `details?: unknown` |
| `src/middlewares/cache.ts` | 0 | `Function` → `CacheApiHandler`; `any` → `unknown`; `CacheConfig` com `undefined` explícito |
| `src/schemas/index.ts` | 2 | `.default()` movido antes de `.transform()` no `QueryParamsSchema` |
| `src/hooks/use-toast.ts` | 1 | `toastId` condicional via spread (evita `undefined` em `exactOptionalPropertyTypes`) |
| `src/hooks/useApi.ts` | 2 | Guard para `empresaId` opcional; removido acesso a `data.id` inexistente |
| `src/components/dashboard/PerformanceDashboard.tsx` | 2 | Removida interface `HealthData` não usada; removidos destructured elements não usados |
| `tsconfig.json` | 11 | `src/__tests__` adicionado ao exclude (setup.ts não é arquivo de teste) |

**Resultado:** `npx tsc --noEmit` e `npm run build` passando com 0 erros.

### Migração Supabase → SQLite local (sessão 7)

| Item | O que foi feito |
|------|----------------|
| Dependências | Instalado `drizzle-orm`, `better-sqlite3`, `drizzle-kit`; removido `@supabase/supabase-js` |
| Schema Drizzle | 6 tabelas em `src/lib/db/schema.ts` (empresas, documentos_empresa, analise_jobs, analise_resultados, conformidade_gaps, alertas_conformidade) |
| Cliente SQLite | `src/lib/db/index.ts` com singleton, WAL mode, foreign keys |
| Config Drizzle | `drizzle.config.ts` na raiz, migration gerada em `drizzle/` |
| NRs locais | 38 NRs em `src/lib/data/normas.ts` com 5 funções helper |
| Rotas migradas | 18 rotas de API + 1 página SSR convertidas de Supabase para Drizzle/dados locais |
| Storage local | Upload de documentos migrado para `./data/uploads/` (filesystem) |
| `supabase.ts` | Deletado (zero referências remanescentes) |
| `env.ts` | Removidas variáveis Supabase, adicionado `DATABASE_PATH` |
| Docker | Volume `./data:/app/data` adicionado; env Supabase removidas |
| Dockerfile | Diretório `data/` criado; migrations copiadas |
| `next.config.js` | Domínio Supabase removido; `serverExternalPackages: ['better-sqlite3']` adicionado |
| `.gitignore` | `data/` adicionado |
| Seed | `scripts/seed.ts` criado e executado com sucesso |
| Scripts npm | Adicionados `db:generate`, `db:push`, `db:studio`, `db:seed` |
| Build | `npm run build` com 0 erros (29 rotas geradas) |
| Branch | `feat/sqlite-migration` (pendente merge na master) |

### Persistência IA e testes manuais (sessão 9)

| Item | O que foi feito |
|------|----------------|
| Persistência IA | `POST /api/ia/analisar-conformidade` agora persiste documento, job, resultado e gaps no SQLite quando `empresaId` é informado |
| Listagem de análises | `GET /api/ia/analisar-conformidade` implementado com paginação e filtro opcional por `empresaId` |
| Refatoração | Lógica extraída para `src/lib/ia/persistencia-analise.ts` e `src/lib/ia/analise-mappers.ts` |
| Testes manuais | Executados com app local em `:3001`: POST com/sem `empresaId`, GET paginado, GET por `empresaId` |
| Resultado dos testes | Todos os cenários principais retornando HTTP 200 e dados consistentes |

### Limpeza técnica e validação final (sessão 10)

| Item | O que foi feito |
|------|----------------|
| Segredos legados | Arquivo local `.env-n8n` removido (continha credenciais obsoletas) |
| Higiene Git | `.next/` e `coverage/` removidos do versionamento (`git rm --cached`) |
| CI/CD | Workflows `deploy.yml` e `release.yml` alinhados para GROQ + SQLite; referências Supabase removidas |
| Env Docker | `docker/.env.example` reescrito para variáveis reais do projeto |
| Superfícies sem uso | Dashboards antigos de `performance/security` removidos; páginas mantidas como descontinuadas |
| Validação técnica | `npx tsc --noEmit` e `npm run build` com sucesso |
| E2E básico | Fluxo API (`health`, `empresas`, `ia/analisar-conformidade`, histórico) executado com PASS |

---

## Histórico de fases concluídas

| Fase | Sessão | Status |
|------|--------|--------|
| Fase 1 - Frontend redesign | Sessão 5 | CONCLUÍDA |
| Fase 1.1 - TS strict mode fixes | Sessão 6 | CONCLUÍDA |
| Fase 2 - Migração Supabase → SQLite + Drizzle ORM | Sessão 7 | CONCLUÍDA |

### Fase 2 - Migração (sessão 7, CONCLUÍDA)

O plano foi discutido e aprovado na sessão 7, executado na branch `feat/sqlite-migration`. Etapas:

1. Setup: `drizzle-orm` + `better-sqlite3` instalados; `@supabase/supabase-js` removido
2. Schema Drizzle: 6 tabelas em `src/lib/db/schema.ts`, cliente em `src/lib/db/index.ts`, config em `drizzle.config.ts`
3. NRs locais: 38 normas em `src/lib/data/normas.ts` com funções helper
4. Migração de 18 rotas de API + 1 página SSR (de Supabase para Drizzle/dados locais)
5. Storage local: uploads migrados para `./data/uploads/` (filesystem)
6. Limpeza: `supabase.ts` deletado, env.ts/docker/Dockerfile atualizados
7. Seed: `scripts/seed.ts` criado e executado, build com 0 erros

---

## Próximos passos para o LLM

> Ordem de prioridade. Cada item é uma tarefa independente que pode ser executada em uma sessão.

### Fase 3 - Pós-migração (imediato)

1. **Merge da branch `feat/sqlite-migration` na `master`**
   - Revisar diff completo, criar PR ou merge direto
   - Confirmar se a branch padrão é `master` ou `main` antes do merge

2. **Executar limpeza final do working tree**
   - Consolidar alterações úteis e descartar artefatos/ruído remanescente
   - Garantir `git status` rastreável para revisão e PR

### Fase 4 - Qualidade

4. **Implementar testes unitários para APIs críticas**
   - Prioridade: `/api/empresas`, `/api/alertas`, `/api/conformidade/analisar`
   - Usar Jest (já configurado no projeto)
   - Testar com banco SQLite in-memory para isolamento

5. **Aplicar rate limiting nas rotas de API**
   - Middleware já existe em `src/middlewares/rate-limit.ts`
   - Aplicar nas rotas públicas: `/api/ia/*`, `/api/empresas`, `/api/alertas`

6. **Adicionar Error Boundaries nas páginas**
   - `src/app/empresas/error.tsx`, `src/app/normas/error.tsx`
   - Componente reutilizável com retry

### Fase 5 - Produção

7. **Configurar Sentry para error tracking**
   - Instalar `@sentry/nextjs`, configurar DSN
   - Capturar erros de API e client-side

8. **Otimizar Docker para produção**
   - Testar `docker-compose.prod.yml` end-to-end
   - Verificar healthcheck, volume persistente, limites de memória
   - Configurar backup do SQLite (cron job que copia `./data/sgn.db`)

9. **Integrar React Query em todas as páginas**
   - Páginas de empresas e conformidade ainda fazem fetch direto
   - Provider já existe em `src/lib/cache/query-client.tsx`

### Fase 6 - Evolução (quando demandado)

10. **Gráficos de evolução de conformidade** (tendência de score ao longo do tempo)
11. **Timeline de análises realizadas** por empresa
12. **Comparações side-by-side de documentos**

---

## Variáveis de Ambiente Necessárias

Copie `.env.example` para `.env.local` e configure:

```
GROQ_API_KEY=                   # Chave da API GROQ para IA (obrigatório)
```

Opcionais:
```
DATABASE_PATH=./data/sgn.db      # Caminho do banco SQLite (default: ./data/sgn.db)
REDIS_HOST=localhost              # Cache Redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

---

## Comandos Essenciais

```bash
# Desenvolvimento
npm run dev          # Inicia dev server em localhost:3001
npm run build        # Build de produção
npm test             # Executa testes
npm run lint         # Verifica linting
npm run health       # Health check da API

# Banco de dados (Drizzle)
npm run db:generate  # Gera migration SQL a partir do schema
npm run db:push      # Aplica schema diretamente no banco (dev)
npm run db:studio    # UI visual para inspecionar o banco
npm run db:seed      # Popula banco com dados de exemplo

# Docker
npm run docker:start # Inicia via Docker
npm run docker:stop  # Para containers
```

---

## Convenções do Projeto

- Idioma do código: português brasileiro (nomes de variáveis, comentários, UI)
- Commits: semânticos `tipo(feature): descrição`
- Arquivos: máximo 200 linhas (quebrar em componentes menores)
- Server Components por padrão, "use client" apenas quando necessário
- Validação: Zod para inputs, schemas em `src/schemas/` (camelCase)
- Erros: retornar `{ success: boolean, error?: string, data?: T }`
- Logs: usar Pino via `@/lib/logger` (não console.log)

## Fluxo Principal da Aplicação

```
Página inicial (/)
  ├── 1. Upload documento (drag-and-drop: PDF, DOCX, TXT)
  ├── 2. Selecionar NRs aplicáveis (grid multi-select)
  ├── 3. Clicar "Analisar Conformidade com IA"
  │     ├── POST /api/extrair-texto (extrai texto do arquivo)
  │     └── POST /api/ia/analisar-conformidade (GROQ + Llama 3.1)
  └── 4. Ver resultado (score, risco, gaps, recomendações)
```

**Componentes do fluxo:**
- `src/components/analise/UploadDocumento.tsx` — drag-and-drop com validação
- `src/components/analise/SeletorNormas.tsx` — grid de NRs com filtro
- `src/components/analise/ResultadoAnalise.tsx` — exibição completa do resultado
- `src/app/page.tsx` — orquestra o fluxo completo
