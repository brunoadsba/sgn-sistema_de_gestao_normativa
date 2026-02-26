# SGN - Sistema de Gestao Normativa

Plataforma local para analise de conformidade em SST (Seguranca e Saude no Trabalho) com apoio de IA.

## Snapshot Atual

- Atualizado em: `2026-02-26`
- Versao documental: `2.2.15`
- Modelo operacional: `local-only`, single-user
- Branch principal: `master`
- CI oficial: `.github/workflows/ci.yml`

## Estado Real do Repositorio

- Arquitetura: monolito Next.js (App Router) com TypeScript.
- Persistencia: SQLite/LibSQL via Drizzle.
- Provedores IA: `groq`, `zai`, `ollama` (selecionados por `AI_PROVIDER`).
- Fluxo de analise: assíncrono no endpoint (`202 Accepted`) com processamento em background no runtime da API.
- Idempotencia: persistencia em banco (`idempotency_cache`) com fallback seguro para memoria quando schema estiver defasado.
- Observabilidade: Pino + Sentry.

 Qualidade observada em `2026-02-26`:

- `npx tsc --noEmit`: passou.
- `npm run lint`: passou.
- `npm run build`: passou (`next build --webpack`) após migracao para fonte local/self-hosted.
- `npm run test:ci`: passou.
- `npm run test:e2e`: passou (`33/33`).
- Referencia atual de suites E2E no repositorio: 5 suites em `e2e/*.spec.ts` (33 cenarios).

## Capacidades Principais

1. Analise de conformidade com upload de `PDF`, `DOCX`, `TXT`.
2. Catalogo de NRs com busca e pagina de detalhe.
3. Analise dedicada para NR-6.
4. Assistente NEX contextual ao documento.
5. Exportacao de dados em `CSV/JSON`.
6. Health check em `GET /api/health`.

## Endpoints API Ativos

- `POST /api/extrair-texto`
- `POST /api/ia/analisar-conformidade`
- `POST /api/ia/sugerir-nrs`
- `POST /api/nr6/analisar`
- `GET /api/health`
- `GET /api/normas`
- `GET /api/normas/[id]`
- `GET /api/normas/stats`
- `GET /api/search`
- `POST /api/chat-documento`
- `GET /api/export`

## Quick Start

### Pre-requisitos

- Node.js 20+
- `npm install`
- `.env.local` criado a partir de `.env.example`

### Execucao local (dev)

```bash
npm run dev
```

Aplicacao: `http://localhost:3001`

### Execucao com Docker

```bash
npm run docker:start
```

## Comandos Essenciais

```bash
# desenvolvimento
npm run dev
npm run lint
npx tsc --noEmit
npm run build

# testes
npm run test
npm run test:ci
npm run test:e2e

# banco
npm run db:push
npm run db:studio
npm run db:backup
npm run db:restore -- ./backups/arquivo.db.gz

# docker
npm run docker:start
npm run docker:status
npm run docker:logs
npm run docker:stop
```

## Documentacao

- `docs/README.md` - indice oficial e mapa de documentos ativos
- `docs/architecture/arquitetura-tecnica.md` - arquitetura real do repositorio
- `docs/operations/operacao-local.md` - runbook de operacao local
- `docs/operations/pop-analise-conformidade-sst.md` - POP de uso operacional
- `docs/governance/documentacao.md` - padrao de documentacao
- `docs/governance/5s-documentacao.md` - matriz 5S documental
- `docs/memory.md` - memoria operacional consolidada
- `CHANGELOG.md` - historico de mudancas
- `SECURITY.md` - postura atual de seguranca
- `CONTRIBUTING.md` - fluxo de contribuicao
