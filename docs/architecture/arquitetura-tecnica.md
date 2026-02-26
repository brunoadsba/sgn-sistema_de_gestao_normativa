# SGN - Arquitetura Tecnica

> Atualizado em: 2026-02-26

## 1. Resumo

O SGN e um monolito Next.js (App Router) voltado para analise de conformidade SST com IA.
O modelo operacional previsto e local-only/single-user.

## 2. Stack Atual

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 |
| Linguagem | TypeScript (strict no tsconfig) |
| UI | React 19 + Tailwind + shadcn/ui |
| Estado em URL | nuqs |
| Banco | Drizzle ORM + SQLite/LibSQL |
| IA | Groq, Z.AI, Ollama |
| Observabilidade | Pino + Sentry |
| Testes | Jest + Playwright |

## 3. Componentes Principais

### Frontend

- `src/app/page.tsx`: entrada da analise.
- `src/features/analise/components/AnaliseCliente.tsx`: upload, configuracao e fluxo de analise.
- `src/features/normas/components/ListaNormasDinamica.tsx`: catalogo de normas com busca.
- `src/features/chat-documento/components/ChatInterface.tsx`: NEX contextual.

### Backend API

- `POST /api/extrair-texto`
- `POST /api/ia/analisar-conformidade`
- `POST /api/ia/sugerir-nrs`
- `POST /api/nr6/analisar`
- `POST /api/chat-documento`
- `GET /api/health`
- `GET /api/normas`
- `GET /api/normas/[id]`
- `GET /api/normas/stats`
- `GET /api/search`
- `GET /api/export`

### Dados

Tabelas declaradas em `src/lib/db/schema.ts`:

1. `documentos`
2. `analise_jobs`
3. `analise_resultados`
4. `conformidade_gaps`

## 4. Fluxo de Analise (estado atual)

1. Cliente envia documento + NRs.
2. API valida payload com Zod.
3. `POST /api/ia/analisar-conformidade` cria `job` e retorna `202 Accepted`.
4. Processamento roda em background no proprio runtime da rota (promise/waitUntil fallback).
5. Resultado e gaps sao persistidos no banco.

## 5. Limites Operacionais Relevantes

| Item | Valor |
|---|---|
| Upload de arquivo | ate 100MB (UI) |
| Timeout da rota de analise | `maxDuration = 300s` |
| Estrategia incremental | chunking com consolidacao |
| Porta padrao | 3001 |

## 6. Confiabilidade e Seguranca (implementado)

1. Validacao de entrada com Zod.
2. Estrutura de erro/sucesso padronizada nas APIs.
3. Logs estruturados com Pino.
4. Health endpoint com status de API, DB e LLM (Groq check).
5. Headers de seguranca em `next.config.js`.
6. Rate limiting in-memory nas rotas de alto custo (`/api/ia/analisar-conformidade`, `/api/extrair-texto`, `/api/chat-documento`, `/api/ia/jobs/[id]`).

## 7. Observacoes de Drift Tecnico

1. Historicos antigos citam arquitetura com worker dedicado externo; no estado atual o contrato canônico e processamento no runtime da rota de analise.
2. Historicos antigos citam ausencia do polling, mas a rota `GET /api/ia/jobs/[id]` esta ativa no codigo atual.
3. Artefatos legados de deploy/producao foram reduzidos com remocao de `harbor-tasks/**`; permanecem referencias historicas apenas em `docs/archive`.

## 8. Qualidade Atual (2026-02-26)

1. `npx tsc --noEmit`: passou.
2. `npm run lint`: passou.
3. `npm run build`: passou com `next build --webpack` apos migracao de fonte para self-host.
4. `npm run test:ci`: passou.
5. `npm run test:e2e`: passou (`33/33`).

## 9. Debito Tecnico Priorizado

1. Executar validacao manual de impressao no Microsoft Edge e registrar evidencias operacionais.
2. Expandir cobertura de testes para rotas críticas ainda sem suíte dedicada.
3. Manter revisão periódica de segurança para limites/rate-limit em cenários de carga real.

## 10. Documentos Relacionados

- `docs/operations/operacao-local.md`
- `docs/operations/pop-analise-conformidade-sst.md`
- `docs/governance/documentacao.md`
- `docs/memory.md`
