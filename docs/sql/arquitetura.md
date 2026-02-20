# SGN - Arquitetura Técnica

> Atualizado em: 2026-02-20 (sessão 26 - otimizações de performance web/mobile)

## Visão Geral

O SGN é um monolito Next.js (App Router) com banco local SQLite via Drizzle ORM e processamento de conformidade por IA (GROQ).

Princípios arquiteturais ativos:

1. Server Components para aquisição de dados.
2. Client Components para interatividade.
3. Estado compartilhável em query string via `nuqs`.
4. Persistência local simples e rastreável (SQLite).

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16.1.6 |
| Linguagem | TypeScript 5.9.2 (strict) |
| UI | React 19 + Tailwind + shadcn/ui |
| Estado em URL | nuqs |
| Banco | SQLite (`better-sqlite3`) + Drizzle ORM |
| IA | GROQ SDK (`meta-llama/llama-4-scout-17b-16e-instruct`) |
| Extração | `pdf-parse` v2 (PDF) + `mammoth` (DOCX) |
| Logging | Pino |
| Observabilidade | Sentry (server/edge/client) |
| Testes | Playwright (E2E) |

## Organização de Componentes

### Server Components

- `src/app/page.tsx`
- `src/app/normas/page.tsx`

Responsabilidade:
- buscar dados no servidor
- montar composição de página

### Client Components

- `src/features/analise/components/AnaliseCliente.tsx`
- `src/features/normas/components/ListaNormasDinamica.tsx`

Responsabilidade:
- estado de UI
- interações de usuário
- busca dinâmica e sincronização com URL

## Domínio e Dados

### Fonte normativa

- `src/lib/data/normas.ts`
- 38 NRs (36 ativas, 2 revogadas)
- Links oficiais e anexos mapeados

### Tabelas SQLite

| Tabela | Finalidade |
|--------|------------|
| `documentos` | metadados dos arquivos enviados |
| `analise_jobs` | rastreamento da execução |
| `analise_resultados` | resultado agregado da análise |
| `conformidade_gaps` | gaps por severidade e recomendação |

## Fluxo Técnico Principal

1. Usuário envia documento e escolhe NRs.
2. `POST /api/extrair-texto` converte arquivo para texto.
3. `POST /api/ia/analisar-conformidade` chama GROQ e persiste resultado.
4. UI renderiza score, gaps e plano de ação.

### Confiabilidade no fluxo

1. Chamadas críticas usam retry com timeout e backoff controlado.
2. Endpoint de análise suporta idempotência por `Idempotency-Key`.
3. Persistência de análise usa transação para manter consistência de dados.
4. Histórico e exportação usam filtros determinísticos (período, busca, ordenação).
5. Fluxo incremental opcional por chunks com validação por evidência em cada etapa.
6. CSP de produção alinhada com hidratação do App Router para evitar loading infinito na página raiz.
7. Seção de histórico sob demanda e otimizações de animação para reduzir custo em dispositivos móveis.

## APIs Ativas

| Rota | Método | Objetivo |
|------|--------|----------|
| `/api/health` | GET | status da aplicação |
| `/api/normas` | GET | catálogo e estatísticas |
| `/api/normas/[id]` | GET | detalhe de norma |
| `/api/search` | GET | busca inteligente |
| `/api/extrair-texto` | POST | extração de texto |
| `/api/ia/analisar-conformidade` | POST | análise de conformidade |
| `/api/ia/analisar-conformidade` | GET | histórico paginado |
| `/api/nr6/analisar` | POST | análise NR-6 |
| `/api/export` | GET | exportação CSV/JSON |

## Limites Operacionais

| Item | Limite |
|------|--------|
| Upload | 100MB |
| Texto extraído (validação) | 2.000.000 caracteres |
| Texto enviado para IA (modo completo) | 500.000 caracteres |
| Texto enviado para IA (modo incremental) | chunks com overlap e consolidação |
| Contexto do modelo | 10M tokens |

## Estado Atual

### Consolidado

1. Fluxo principal de análise estável.
2. Catálogo de normas estável com busca dinâmica e URL state.
3. UI dark mode padronizada com Canvas Background.
4. Persistência e histórico funcionando no SQLite.
5. Observabilidade com Sentry e error boundaries de rota.
6. Qualidade validada com lint/build e suíte E2E estável.
7. Histórico otimizado sem N+1 com ordenação/paginação em SQL.
8. Análise incremental processada com concorrência limitada por chunk.

### Débito técnico aberto

1. Worker assíncrono real para processamento.
2. Testes unitários e integração para APIs críticas.
3. Evoluir base normativa local para cobertura completa e atualização automatizada contínua.
