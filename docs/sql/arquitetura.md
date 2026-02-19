# SGN - Arquitetura Técnica Atual

> Atualizado em: 2026-02-19 (sessão 20)

## Resumo arquitetural

O SGN opera em arquitetura monolítica com Next.js App Router, banco local SQLite e Drizzle ORM. As NRs são mantidas localmente em TypeScript. A análise de conformidade é executada via GROQ. Sem autenticação, sem Redis, sem multi-tenancy — aplicação single-user local.

## Stack

- Next.js 15.5.2 (App Router)
- TypeScript 5.9.2 (strict)
- SQLite (`better-sqlite3`) + Drizzle ORM
- GROQ SDK — modelo: `meta-llama/llama-4-scout-17b-16e-instruct` (17B ativos, MoE)
- pdf-parse v2 (extração de texto PDF) + mammoth (DOCX)
- Zod para validação de entrada
- Pino para logging estruturado
- Tailwind CSS + shadcn/ui (dark mode forçado via `class="dark"`)

## Estrutura de dados

### Fontes de dados

1. NRs locais em `src/lib/data/normas.ts` (38 NRs, links diretos MTE + 17 anexos)
2. Banco relacional SQLite em `./data/sgn.db`

### Tabelas ativas (Drizzle ORM)

| Tabela | Descrição |
|--------|-----------|
| `documentos` | Documentos enviados pelo usuário (PGR, PCMSO, LTCAT, etc.) |
| `analise_jobs` | Jobs de análise (pending / processing / completed / failed / cancelled) |
| `analise_resultados` | Resultados detalhados com score de conformidade |
| `conformidade_gaps` | Gaps identificados (severidade: baixa / media / alta / critica) |

> Tabelas removidas na sessão 13: `empresas`, `documentos_empresa`, `alertas_conformidade`.

## Fluxo de análise IA

1. Usuário envia documento (PDF, DOCX, TXT — até 100MB) e seleciona NRs no frontend
2. `POST /api/extrair-texto` — extrai texto via pdf-parse v2 (PDF) ou mammoth (DOCX)
3. `POST /api/ia/analisar-conformidade` — envia texto (truncado em 500K chars) ao GROQ + persiste resultado no SQLite:
   - cria registro em `documentos`
   - cria `analise_jobs` com status `completed`
   - cria `analise_resultados`
   - cria itens em `conformidade_gaps`
4. `GET /api/ia/analisar-conformidade` — lista histórico com paginação

## APIs ativas

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/health` | GET | Status do banco e da API |
| `/api/normas` | GET | Lista todas as NRs com stats |
| `/api/normas/[id]` | GET | Detalhes de uma NR |
| `/api/search` | GET | Busca inteligente por normas |
| `/api/extrair-texto` | POST | Extração de texto de PDF/DOCX/TXT |
| `/api/ia/analisar-conformidade` | POST | Análise de conformidade com IA |
| `/api/ia/analisar-conformidade` | GET | Histórico de análises (paginado) |
| `/api/nr6/analisar` | POST | Análise específica NR-6 (EPIs) |
| `/api/export` | GET | Exportação de dados (CSV/JSON) |

> APIs removidas na sessão 13: `/api/empresas`, `/api/alertas`, `/api/conformidade/*`, `/api/rate-limit`, `/api/security`, `/api/demo`.

## Persistência e armazenamento

- Banco: `./data/sgn.db` (volume Docker persistente)
- Uploads: `./data/uploads/`
- Migrations: `drizzle/`
- Configuração Drizzle: `drizzle.config.ts`
- Schema: `src/lib/db/schema.ts`

## Limites técnicos relevantes

| Parâmetro | Valor |
|-----------|-------|
| Tamanho máximo de upload | 100MB |
| Limite de caracteres extraídos (Zod) | 2.000.000 |
| Caracteres enviados à IA (truncamento) | 500.000 |
| Contexto do modelo GROQ | 10M tokens |
| Rate limit GROQ (free tier) | 1000 req/dia + 30K TPM |

## Estado atual

Implementado:
- Migração completa de Supabase para SQLite
- Persistência do resultado de análise IA
- Listagem histórica de análises com paginação
- Validação de payload com Zod (schemas em `src/schemas/`)
- Build TypeScript strict sem erros
- Interface dark mode com Canvas Background animado

Pendente:
- Worker assíncrono real para jobs (hoje processamento é síncrono)
- Testes unitários de APIs críticas
- Monitoramento de erros (Sentry ausente)
