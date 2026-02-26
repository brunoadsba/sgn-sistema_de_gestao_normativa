# SGN - Memoria Operacional

> Atualizado em: 2026-02-26

## 1. Snapshot

- Versao atual (documental): `2.2.15`
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
- `POST /api/nr6/analisar`
- `POST /api/chat-documento`
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

## 4. Capacidades em uso

1. Upload e extracao de texto (`PDF`, `DOCX`, `TXT`).
2. Analise com IA e persistencia de jobs/resultados.
3. Catalogo de normas com busca e detalhe por NR.
4. Fluxo dedicado NR-6.
5. Assistente NEX contextual.
6. Exportacao em `CSV/JSON`.

## 5. Divergencias Tecnicas Relevantes

1. Historicos antigos descrevem worker externo dedicado; no estado atual o processamento principal roda no runtime da rota de analise.
2. Historicos antigos citam ausencia de polling; no estado atual a rota `GET /api/ia/jobs/[id]` esta ativa.
3. Idempotencia atual foi normalizada para persistencia em banco (`idempotency_cache`), com fallback em memoria apenas para compatibilidade quando schema ainda nao foi sincronizado.
4. Existem artefatos legados de deploy/producao coexistindo com o direcionamento local-only.

## 6. Qualidade Atual (medicao em 2026-02-26)

1. `npx tsc --noEmit`: passou.
2. `npm run lint`: passou.
3. `npm run build`: passou (`next build --webpack`) apos migracao para fonte local/self-host.
4. `npm run test:ci`: passou.
5. `npm run test:e2e`: passou (`33/33`).

## 7. Prioridades Imediatas

1. Executar validacao manual de impressao no Microsoft Edge e registrar evidencias.
2. Executar limpeza de legado documental historico que ainda referencia arquitetura de worker externo.
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

## 9. Arquivo Historico Completo

O historico expandido anterior foi preservado em:

- `docs/archive/memory-legacy-2026-02-25.md`
