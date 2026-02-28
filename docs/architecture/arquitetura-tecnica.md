# SGN - Arquitetura Tecnica

> Atualizado em: 2026-02-28

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
- `src/features/analise/components/ResultadoAnalise.tsx`: dashboard final + matriz de gaps tabular (UI).
- `src/components/report/ReportDocument.tsx`: template técnico PDF programático.
- `src/components/report/ReportPreview.tsx`: preview/toolbar de exportação PDF.

### Backend API

- `POST /api/extrair-texto`
- `POST /api/ia/analisar-conformidade`
- `POST /api/ia/sugerir-nrs`
- `POST /api/ia/agente/especialista`
- `POST /api/ia/analisar-conformidade/[id]/revisao/aprovar`
- `POST /api/ia/analisar-conformidade/[id]/revisao/rejeitar`
- `GET /api/ia/analisar-conformidade/[id]/revisao`
- `POST /api/nr6/analisar`
- `POST /api/chat-documento`
- `POST /api/reports/generate`
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
5. `analise_revisoes`

## 4. Fluxo de Analise (estado atual)

1. Cliente envia documento + NRs (ou usa sugestão automática).
2. API valida payload com Zod.
3. `POST /api/ia/analisar-conformidade` cria `job` e retorna `202 Accepted`.
4. Processamento roda em background no proprio runtime da rota (promise/waitUntil fallback).
5. Agente especialista SST é selecionado por contexto (`sst-generalista` ou `sst-portuario`) e aplicado aos prompts.
6. Resultado é persistido com confiança composta (`confidenceScore`) e status legal inicial `pre_laudo_pendente`.
7. Revisão humana aprova/rejeita laudo e gera trilha de auditoria em `analise_revisoes`.
8. Exportação PDF pode seguir:
   - `dom print` (browser), ou
   - `react-pdf` server-side (`POST /api/reports/generate`) quando `NEXT_PUBLIC_PDF_ENGINE=react-pdf`.

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
7. Rate limiting padronizado em todas as rotas de API.
8. Modelos de IA configuraveis via variaveis de ambiente (`GROQ_MODEL`, `GROQ_MODEL_NR6`).
9. Persistencia de analise decomposta em modulos (`jobs`, `consultas`, `revisao`, `export`).

## 7. Observacoes de Drift Tecnico

1. Historicos antigos citam arquitetura com worker dedicado externo; no estado atual o contrato canônico e processamento no runtime da rota de analise.
2. Historicos antigos citam ausencia do polling, mas a rota `GET /api/ia/jobs/[id]` esta ativa no codigo atual.
3. Artefatos legados de deploy/producao foram reduzidos com remocao de `harbor-tasks/**`; permanecem referencias historicas apenas em `docs/archive`.

## 8. Qualidade Atual (2026-02-28)

1. `npx tsc --noEmit`: passou.
2. `npm run lint`: passou.
3. `npm run build`: passou com `next build --webpack` apos migracao de fonte para self-host.
4. `npm run test:ci`: passou (`54/54`).
5. `npm run test:e2e`: passou (`27` cenarios).

## 9. Debito Tecnico Priorizado

1. Validar chat NEX modo livre com Z.AI em cenario de rede estavel.
2. Expandir testes E2E para fluxos de analise completa com IA.
3. Manter revisao periodica de seguranca para limites/rate-limit em cenarios de carga real.

## 10. Documentos Relacionados

- `docs/operations/operacao-local.md`
- `docs/operations/pop-analise-conformidade-sst.md`
- `docs/governance/documentacao.md`
- `docs/memory.md`
