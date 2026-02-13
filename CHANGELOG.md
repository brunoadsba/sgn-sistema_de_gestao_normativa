# Changelog

Todas as mudanças relevantes do SGN são documentadas neste arquivo.

## [2026-02-13] - Refatoração single-user (Sessão 13)

### Removido

- **Feature empresas completa**: páginas, API routes (`/api/empresas`, `/api/conformidade/*`, `/api/alertas/*`, `/api/demo/*`, `/api/security/*`, `/api/rate-limit`), schemas, componentes e tipos
- **Redis**: dependência `ioredis` removida, `src/lib/cache/redis.ts` deletado, variáveis de ambiente Redis removidas
- **Middlewares obsoletos**: `cache.ts` (Redis), `rate-limit.ts` (Redis)
- **Dependências**: `ioredis`, `@types/ioredis`, `pino-pretty`
- **Tabelas DB**: `empresas`, `documentos_empresa`, `alertas_conformidade` removidas do schema Drizzle
- **Campo `empresaId`**: removido de todas interfaces, schemas, APIs e componentes
- **Páginas descontinuadas**: `/performance`, `/security`
- **Script seed**: `scripts/seed.ts` (criava dados com empresas)
- **Diretório `obsoleto/`**: removido completamente

### Alterado

- **DB schema**: 4 tabelas restantes (`documentos`, `analise_jobs`, `analise_resultados`, `conformidade_gaps`), sem FKs de empresa
- **Health check**: simplificado, verifica apenas database + api (sem Redis)
- **env.ts**: apenas `GROQ_API_KEY`, `DATABASE_PATH`, `NODE_ENV`, `PORT`, `LOG_LEVEL`
- **Navegação**: 2 links (Analisar, Normas)
- **Sitemap**: removida entrada `/empresas`
- **Persistência IA**: `persistirAnaliseConformidade` e `listarAnalisesConformidade` sem filtro por empresa
- **Página NR-6**: removido campo empresaId do formulário
- **DynamicComponents**: removidos imports de componentes de conformidade
- **query-client.tsx**: removido `empresaId` das query keys
- **types/conformidade.ts**: reescrito sem interfaces de empresa
- **types/ia.ts**: simplificado, removidos tipos não usados

### Modelo de IA

- **Modelo trocado**: `llama-3.1-8b-instant` (8B) → `meta-llama/llama-4-scout-17b-16e-instruct` (17B ativos, 109B total, MoE 16 experts)
- **max_tokens aumentado**: conformidade 2000→4000, NR-6 1500→3000
- **Capacidades**: contexto 10M tokens, 460 tok/s, free tier 1000 req/dia + 30K TPM
- **Metadado `modeloUsado`** atualizado nas rotas `/api/ia/analisar-conformidade` e `/api/nr6/analisar`

### Validado

- `npx tsc --noEmit` — 0 erros
- Dev server em `localhost:3001` — status: ok
- Health check retornando `{ status: "ok" }`

## [2026-02-12] - Pós-migração SQLite (Sessões 8 e 9)

### Adicionado

- Persistência de análises IA no SQLite em `POST /api/ia/analisar-conformidade`
- Módulo de persistência em `src/lib/ia/persistencia-analise.ts`
- Mapeadores de análise em `src/lib/ia/analise-mappers.ts`
- Listagem de análises em `GET /api/ia/analisar-conformidade` com paginação

### Alterado

- `src/app/api/ia/analisar-conformidade/route.ts` atualizado para persistir resultados e usar respostas padronizadas

## [2026-02-12] - Migração Supabase -> SQLite (Sessão 7)

### Alterado

- Migração de dados e APIs para SQLite + Drizzle
- Remoção de dependências e referências a Supabase
- Introdução de dados normativos locais (`src/lib/data/normas.ts`)

### Infra

- Scripts Drizzle adicionados: `db:generate`, `db:push`, `db:studio`
- Volume de dados local configurado para Docker

## [2025-08-31] - Base do MVP

### Adicionado

- Next.js 15 + TypeScript strict
- APIs de normas e conformidade
- Upload e gestão documental
- Estrutura inicial de dashboard e busca
