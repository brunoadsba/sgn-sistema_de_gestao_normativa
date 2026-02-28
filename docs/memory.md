# SGN - Memoria Operacional

> Atualizado em: 2026-02-28

## 1. Snapshot

- Versao atual (documental): `2.3.1`
- Modelo operacional: `local-only`, single-user
- Branch principal: `master`
- Pipeline oficial: `.github/workflows/ci.yml`

## 2. O que e o SGN

Plataforma para analise de conformidade SST usando IA sobre documentos tecnicos (PGR, PCMSO, LTCAT e correlatos), com cruzamento contra NRs e apresentacao de gaps/acoes.

## 3. Estado Real do Codigo

### Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind + shadcn/ui
- Drizzle + SQLite/LibSQL
- Provedores IA: Groq, Z.AI, Ollama
- Observabilidade: Pino + Sentry

### Endpoints ativos

- `POST /api/extrair-texto`
- `POST /api/ia/analisar-conformidade`
- `POST /api/ia/sugerir-nrs`
- `POST /api/ia/agente/especialista`
- `POST /api/ia/analisar-conformidade/[id]/revisao/aprovar`
- `POST /api/ia/analisar-conformidade/[id]/revisao/rejeitar`
- `GET /api/ia/analisar-conformidade/[id]/revisao`
- `POST /api/nr6/analisar`
- `POST /api/chat-documento`
- `GET /api/ia/jobs/[id]`
- `GET /api/health`
- `GET /api/normas`
- `GET /api/normas/[id]`
- `GET /api/normas/stats`
- `GET /api/search`
- `GET /api/export`

### Persistencia

Tabelas principais em `src/lib/db/schema.ts`:

1. `documentos`
2. `analise_jobs`
3. `analise_resultados`
4. `conformidade_gaps`
5. `analise_revisoes`

## 4. Capacidades em uso

1. Upload e extracao de texto (`PDF`, `DOCX`, `TXT`).
2. Analise com IA e persistencia de jobs/resultados.
3. Catalogo de normas com busca e detalhe por NR.
4. Fluxo dedicado NR-6.
5. Assistente NEX com dois modos: livre (SST geral) e grounded (restrito ao documento).
6. Exportacao em `CSV/JSON`.
7. Exportacao de relatório em PDF híbrido (`dom` e `react-pdf` via `/api/reports/generate`).
8. Matriz de gaps da UI em tabela técnica com rastreabilidade por norma/status.
9. Testes E2E com Playwright cobrindo navegacao, normas, upload, NR-6 e chat.

## 5. Divergencias Tecnicas Relevantes

1. Historicos antigos descrevem worker externo dedicado; no estado atual o processamento principal roda no runtime da rota de analise.
2. Historicos antigos citam ausencia de polling; no estado atual a rota `GET /api/ia/jobs/[id]` esta ativa.
3. Idempotencia atual foi normalizada para persistencia em banco (`idempotency_cache`), com fallback em memoria apenas para compatibilidade quando schema ainda nao foi sincronizado.
4. Existem artefatos legados de deploy/producao coexistindo com o direcionamento local-only.

## 6. Qualidade Atual (medicao em 2026-02-28)

1. `npx tsc --noEmit`: passou.
2. `npm run lint`: passou.
3. `npm run build`: passou (`next build --webpack`) apos migracao para fonte local/self-host.
4. `npm run test:ci`: passou (`54/54`).
5. `npm run test:e2e`: passou (47 cenarios, 45 passados, 2 pulados).

## 7. Prioridades Imediatas

1. Validar chat NEX modo livre com Z.AI em cenario de rede estavel.
2. Expandir testes E2E para fluxos de analise completa com IA.
3. Continuar 5S documental para evitar novo drift.

## 8. Historico de Marco (resumo)

| Sessao | Data | Marco |
|---|---|---|
| 1-12 | 2026-02-11 a 2026-02-12 | Estruturacao inicial, limpeza, CI e base operacional |
| 13-24 | 2026-02-13 a 2026-02-20 | Refatoracao local-only, UI/UX, Server/Client split, confiabilidade |
| 25-36 | 2026-02-20 a 2026-02-22 | Ajustes de infraestrutura, Harbor, performance e hardening |
| 37-42 | 2026-02-23 a 2026-02-24 | NEX, streaming, evolucao de fluxo de analise |
| 43-59 | 2026-02-24 a 2026-02-25 | Documentacao, padroes operacionais e incrementos de IA |
| 60 | 2026-02-26 | 5S documental completo e consolidacao do estado real do repositorio |
| 61 | 2026-02-26 | Recuperacao de baseline tecnico (`tsc`/`lint` verdes), tipagem reforcada em APIs e remocao de modulo worker orfao. |
| 62 | 2026-02-26 | Migracao de fonte para self-host (`next/font/local`) com build local validado em modo offline para fontes. |
| 63 | 2026-02-26 | Fechamento do gate de qualidade: `test:ci` estabilizado (Jest isolado em `src`), idempotencia da API de analise concluida (cache + conflito `409`) e rate limiting aplicado em rotas de alto custo (`/api/ia/analisar-conformidade`, `/api/extrair-texto`, `/api/chat-documento`). |
| 64 | 2026-02-26 | Idempotencia migrada para persistencia DB (`idempotency_cache`) com fallback em memoria para compatibilidade; contrato assíncrono da análise consolidado no runtime da rota e diretório legado de worker removido do código ativo. |
| 65 | 2026-02-26 | Drift de schema corrigido: colunas GUT de `conformidade_gaps` reintegradas ao schema/mapeadores, tabela legada `idempotency_keys` tipada para compatibilidade e `drizzle-kit push` normalizado sem prompt de rename/data-loss nesse fluxo. |
| 66 | 2026-02-26 | Pendencias finais reduzidas: warning de teardown do Jest eliminado via cleanup seguro de timeout em `/api/health`, limpeza de legado `harbor-tasks/**` concluida e validacao de impressao no Chrome registrada com evidencias (Edge permanece pendente por indisponibilidade no ambiente). |
| 67 | 2026-02-26 | Resiliencia de providers IA reforcada: classificacao de erro unificada (`error_class`), fallback Groq->Z.AI ampliado para timeout/network/5xx, timeout+retry configuraveis no Z.AI e deduplicacao de extracao de texto no cliente para reduzir chamadas repetidas em `/api/extrair-texto`. |
| 68 | 2026-02-26 | GLM/Z.AI ajustado para custo/latencia: chamadas passaram a enviar `thinking` desabilitado (`ZAI_DISABLE_THINKING=true` por default), reduzindo `reasoning_tokens` e mitigando respostas truncadas por `finish_reason=length` em fluxos de sugestao/chat/fallback. |
| 69 | 2026-02-26 | Fluxo legal endurecido sem bloquear operação: análise agora persiste `reportStatus=pre_laudo_pendente`, calcula confiança composta (`confidenceScore/class/signals`), adiciona heurística normativa na sugestão de NRs e expõe endpoints de revisão humana com trilha auditável (`analise_revisoes`). |
| 70 | 2026-02-26 | Agente especialista formalizado no SGN: perfis `sst-generalista` e `sst-portuario` com seleção automática por contexto, prompts unificados para análise/sugestão/chat, heurística portuária reforçada (NR-29/NR-30) e endpoint de apoio (`POST /api/ia/agente/especialista`). |
| 71 | 2026-02-26 | PDF híbrido implementado: contrato `ReportData`, mapeador técnico (`toReportData`), endpoint `POST /api/reports/generate` e engine opcional `NEXT_PUBLIC_PDF_ENGINE=react-pdf` com fallback seguro para `window.print`. |
| 72 | 2026-02-26 | Matriz de gaps da UI refatorada para tabela técnica com colunas estruturadas (`Severidade`, `Categoria`, `Norma`, `Status`, `Descrição`, `Recomendação`), badges semânticos, zebra/hover e bloqueio de hifenização automática; sugestão/seleção de NRs normalizada em ordem crescente. |
| 73 | 2026-02-27 | Estabilização de scores: determinismo absoluto em 3 providers (Groq/Z.AI/Ollama), recálculo de score pós-filtro de gaps, prompts reforçados com aderência estrita à KB normativa, fórmula determinística de score, sugestão de NRs determinística, fix do círculo SVG 100% e centralização do header do PDF. |
| 74 | 2026-02-27 | Endurecimento pericial do Chat NEX: parâmetros de sampling determinísticos (`temperature: 0`, `top_p: 1`, `seed: 42`) aplicados na rota de chat interativo. System prompt reenquadrado para perfil de "auditor forense", vetando respostas por inferência externa ou ausência de lastro. |
| 75 | 2026-02-28 | Backend Core Hardening: modelos IA configuraveis via env (`GROQ_MODEL`, `GROQ_MODEL_NR6`), rate limiting em todas as rotas desprotegidas, validacao Zod padronizada, formato de resposta unificado (`createSuccessResponse`/`createErrorResponse`), decomposicao de `persistencia-analise.ts` em modulos e logging estruturado com Pino. |
| 76 | 2026-02-28 | UX/UI Global Overhaul + Chat Refactoring: redesign de todas as paginas para consistencia visual, correcao de navegacao do chat mobile/desktop, fix de timeout em upload de documentos grandes. |
| 77 | 2026-02-28 | Testes E2E com Playwright: 47 cenarios (45 passados, 2 pulados) cobrindo health, navegacao, catalogo de normas, upload, extracao de texto, NR-6 e API do chat. |
| 78 | 2026-02-28 | Chat NEX modo livre: assistente acessivel sem documento para duvidas gerais de SST/NRs, com transicao automatica para modo grounded ao carregar documento. UI redesenhada seguindo padroes modernos de chatbot. |
| 79 | 2026-02-28 | Fix critico: frontend do chat e sugestao de NRs corrigidos para ler `data.data.*` apos padronizacao de respostas API (Phase 4 backend hardening). |
| 80 | 2026-02-28 | Documentacao completa atualizada: README, docs, arquitetura, memory, operacao-local, CONTRIBUTING, SECURITY, 5s. Versao documental 2.3.1. E2E: 47 cenarios (45 passados, 2 pulados). |

## 9. Arquivo Historico Completo

O historico expandido anterior foi preservado em:

- `docs/archive/memory-legacy-2026-02-25.md`
