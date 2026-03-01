# SGN - Sistema de Gestao Normativa

Plataforma local para analise de conformidade em SST (Seguranca e Saude no Trabalho) com apoio de IA.

## Snapshot Atual

- Atualizado em: `2026-03-01`
- Versao documental: `2.3.3`
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
- Governança legal do laudo: emissão automática como `pre_laudo_pendente` + revisão humana obrigatória para `laudo_aprovado`/`laudo_rejeitado`.
- Agente especialista: perfis SST (`sst-generalista`, `sst-portuario`) com seleção automática por contexto e integração em análise/sugestão/chat.
- Relatório técnico: engine híbrida de PDF (`dom print` + `react-pdf` opcional via `NEXT_PUBLIC_PDF_ENGINE=react-pdf`), com endpoint server-side dedicado.
- Matriz de gaps (UI): tabela técnica com colunas estruturadas (`Severidade`, `Categoria`, `Norma`, `Status`, `Descrição`, `Recomendação`), badges semânticos e melhorias de legibilidade.
- Ordenação normativa: sugestão e seleção de NRs em ordem crescente numérica de forma determinística.
- Determinismo de IA: providers configurados com `temperature=0`, `top_p=1` e `seed=42` para scores reprodutíveis.

 Qualidade observada em `2026-03-01`:

- `npx tsc --noEmit`: passou.
- `npm run lint`: passou.
- `npm run build`: passou (`next build --webpack`) após migracao para fonte local/self-hosted.
- `npm run test:ci`: passou (`54/54`).
- Referencia atual de suites E2E no repositorio: 8 suites em `e2e/*.spec.ts` (45 cenarios globais, 45 passados e consolidados da UI).

## Capacidades Principais

1. Analise de conformidade com upload de `PDF`, `DOCX`, `TXT`.
2. Catalogo de NRs com busca e pagina de detalhe.
3. Analise dedicada para NR-6.
4. Assistente NEX com modo livre (SST geral) e grounded (restrito ao documento).
5. Exportacao de dados em `CSV/JSON`.
6. Health check em `GET /api/health`.
7. Testes E2E com Playwright (45 cenarios, 45 passados).

## Endpoints API Ativos

- `POST /api/extrair-texto`
- `POST /api/ia/analisar-conformidade`
- `POST /api/ia/sugerir-nrs`
- `POST /api/ia/agente/especialista`
- `POST /api/ia/analisar-conformidade/[id]/revisao/aprovar`
- `POST /api/ia/analisar-conformidade/[id]/revisao/rejeitar`
- `GET /api/ia/analisar-conformidade/[id]/revisao`
- `POST /api/nr6/analisar`
- `GET /api/health`
- `GET /api/normas`
- `GET /api/normas/[id]`
- `GET /api/normas/stats`
- `GET /api/search`
- `GET /api/ia/jobs/[id]`
- `POST /api/chat-documento`
- `POST /api/reports/generate`
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

### Sincronizacao de schema (obrigatorio apos mudancas de banco)

```bash
npm run db:push
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

Variáveis relevantes para PDF:

```bash
# padrão atual
NEXT_PUBLIC_PDF_ENGINE=dom
# opcional para engine programática
# NEXT_PUBLIC_PDF_ENGINE=react-pdf
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
