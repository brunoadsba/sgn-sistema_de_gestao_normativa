# SGN - Memória do Projeto

> Documento de contexto para qualquer LLM que acesse este projeto.
> Atualizado em: 2026-02-19 (sessão 19: suporte a documentos grandes + extração PDF corrigida)

---

## O que é o SGN

SGN (Sistema de Gestão Normativa) é uma plataforma local de análise de conformidade com IA para normas regulamentadoras brasileiras de SST (Segurança e Saúde no Trabalho).

**Foco principal:** o usuário sobe documentos de SST e a IA analisa conformidade contra as NRs, gerando relatórios executivos.

Projeto single-user, executado localmente. Única dependência externa: API do GROQ (LLM gratuito, open-source).

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 15.5.2 |
| Linguagem | TypeScript (strict mode) | 5.9.2 |
| UI | React + Tailwind CSS + shadcn/ui | React 19.1.0 |
| Banco de dados | SQLite (better-sqlite3) + Drizzle ORM | 0.45.1 |
| IA | GROQ SDK (Llama 4 Scout 17B) | 0.32.0 |
| Validação | Zod | 4.1.5 |
| Animações | Framer Motion | 12.23.12 |
| Extração PDF | pdf-parse v2 (PDFParse class) | 2.4.5 |
| Testes E2E | Playwright | instalado (sessão 15) |
| Deploy | Docker (self-hosted) | - |
| Logging | Pino | 10.1.0 |

**Arquitetura simplificada:** Next.js + SQLite local (Drizzle ORM) + GROQ. Sem Redis, sem Supabase, sem React Query, sem autenticação. NRs armazenadas em arquivo TypeScript local (`src/lib/data/normas.ts`). Deploy via Docker com volume persistente para dados.

---

## Estrutura de Pastas

```
/                                   # Raiz do projeto
├── .github/workflows/              # CI/CD (ci, deploy, release)
├── docker/                         # nginx.conf + .env.example
├── docs/                           # memory.md, Guia-Vercel.md
├── e2e/                            # Testes Playwright (api, navegacao, normas, nr6, pagina-inicial)
├── public/                         # sw.js
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── export/             # Exportação CSV/JSON
│   │   │   ├── extrair-texto/      # Extração de texto PDF/DOCX
│   │   │   ├── health/             # Health check (database + api)
│   │   │   ├── ia/                 # Análise de conformidade com IA
│   │   │   ├── normas/             # CRUD normas + stats
│   │   │   ├── nr6/               # Análise específica NR-6
│   │   │   └── search/             # Busca inteligente
│   │   ├── normas/                 # Páginas de normas (lista + [id])
│   │   ├── nr6/                    # Página análise NR-6
│   │   ├── layout.tsx              # Root layout (nav: Analisar, Normas)
│   │   ├── page.tsx                # Página principal: análise de conformidade
│   │   └── sitemap.ts              # Sitemap
│   ├── components/
│   │   ├── analise/                # UploadDocumento, SeletorNormas, ResultadoAnalise
│   │   ├── dynamic/                # Lazy loading (DynamicComponents)
│   │   ├── loading/                # LoadingSpinner
│   │   └── ui/                     # shadcn/ui (16 componentes)
│   ├── hooks/                      # use-toast
│   ├── lib/
│   │   ├── constants/              # tipos-documento.ts (60+ tipos SST)
│   │   ├── data/                   # normas.ts (38 NRs locais + helpers + urlOficial)
│   │   ├── db/                     # schema.ts (Drizzle) + index.ts (cliente SQLite)
│   │   ├── ia/                     # groq.ts, analisador-nr6.ts, persistencia-analise.ts, analise-mappers.ts
│   │   ├── logger/                 # Pino logger
│   │   ├── env.ts                  # Validação de env com Zod
│   │   ├── errors.ts               # Classes de erro + handler centralizado
│   │   └── utils.ts                # cn() helper
│   ├── middlewares/                 # security, validation
│   ├── schemas/                    # Zod schemas (norma, analise)
│   └── types/                      # TypeScript types (ia.ts, conformidade.ts)
├── .env.example
├── playwright.config.ts
├── Dockerfile
├── docker-compose.yml / .prod.yml
├── package.json / tsconfig.json
└── next.config.js / tailwind.config.ts
```

---

## Banco de Dados (SQLite local + Drizzle ORM)

### Dados Estáticos (TypeScript)

- 38 NRs armazenadas em `src/lib/data/normas.ts` (36 ativas, 2 revogadas)
- Campo `urlOficial` em cada NR: link direto para o PDF no MTE (quando confirmado) ou URL da listagem geral como fallback
- Funções helper: `getNormas()`, `getNormaById()`, `searchNormas()`, `getNormasStats()`

### Tabelas SQLite (Drizzle ORM)

| Tabela | Função |
|--------|--------|
| `documentos` | Documentos enviados pelo usuário (PGR, PCMSO, LTCAT, etc) |
| `analise_jobs` | Jobs de análise (pending/processing/completed/failed/cancelled) |
| `analise_resultados` | Resultados detalhados com scores |
| `conformidade_gaps` | Gaps identificados (severidade: baixa/media/alta/critica) |

### Armazenamento

- Banco SQLite: `./data/sgn.db` (volume Docker persistente)
- Uploads de documentos: `./data/uploads/` (filesystem local)
- Schema: `src/lib/db/schema.ts`, Config: `drizzle.config.ts`
- Migrations: `drizzle/` (geradas com `npm run db:generate`)

---

## O que funciona (implementado)

1. **Página principal de análise com IA**
   - Upload de documento com drag-and-drop (PDF, DOCX, TXT)
   - Seletor de NRs: grid 2 colunas, chips de selecionadas, filtro por nome
   - Análise de conformidade via GROQ + Llama 4 Scout (~1.2s)
   - Resultado: score circular animado, gaps ordenados por severidade com borda colorida, pontos de atenção, próximos passos numerados
2. Catálogo de normas com busca e detalhes (link direto para PDF no MTE)
3. Análise especializada NR-6 (EPIs)
4. Persistência de análises no SQLite (documentos, jobs, resultados, gaps)
5. Busca inteligente com ranking
6. Exportação de dados (CSV/JSON)
7. API de health check
8. Logging estruturado com Pino
9. CI/CD com GitHub Actions (3 workflows: ci, deploy, release)
10. Docker multi-stage build
11. Validação de env com Zod
12. Schemas Zod para APIs (camelCase)
13. **Testes E2E com Playwright** (5 suites: api, navegacao, normas, nr6, pagina-inicial)

---

## O que NÃO funciona / está incompleto

### Prioridade Alta
- **Links diretos das NRs**: apenas NR-1 tem URL específica confirmada. As demais (NR-2 a NR-38) usam a listagem geral como fallback. **Aguardando Bruno fornecer os links individuais** (ver "Próximos passos").
- Worker assíncrono real não existe (processamento é síncrono)

### Prioridade Média
- Testes unitários: zero cobertura de testes unitários/integração (E2E existe)
- Monitoramento de produção inexistente (sem Sentry, sem métricas)
- Virtualização de listas para grandes volumes

### Prioridade Baixa
- Timeline de análises realizadas
- Comparações side-by-side de documentos

---

## Histórico de sessões

| Sessão | Data | Resumo |
|--------|------|--------|
| 1 | 2026-02-11 | Auditoria de segurança e código (dependências, XSS, tipos) |
| 2 | 2026-02-11 | Reorganização estrutural (docs, configs, imports) |
| 3 | 2026-02-11 | Remoção N8N |
| 4 | 2026-02-11 | 5S - Limpeza geral (código morto → obsoleto/) |
| 5 | 2026-02-11 | Redesign frontend (página de análise com IA) |
| 6 | 2026-02-11 | Correções TypeScript strict mode |
| 7 | 2026-02-12 | Migração Supabase → SQLite + Drizzle ORM |
| 8-9 | 2026-02-12 | Persistência IA e testes manuais |
| 10 | 2026-02-12 | Limpeza técnica, CI/CD, merge master |
| 11 | 2026-02-12 | README reescrito como guia de uso |
| 12 | 2026-02-12 | Workflows e Guia-Vercel |
| 13 | 2026-02-13 | Refatoração single-user: removidos empresas, Redis, conformidade, alertas, rate-limit, security, demo, seed. Schema DB simplificado (4 tabelas). Modelo IA trocado para Llama 4 Scout 17B (MoE). 0 erros TS. |
| 14 | 2026-02-15 | Limite de documento para IA aumentado de 50k para 500k caracteres em `src/lib/ia/groq.ts`. Llama 4 Scout suporta 10M tokens (~150 páginas). |
| 15 | 2026-02-18 | Removidos `@tanstack/react-query`, `bcryptjs` (não usados). Corrigido fetch em Server Components (URL relativa → import direto). Adicionados testes E2E com Playwright (5 suites). Melhorias UX/UI: SeletorNormas (chips, grid 2 colunas, sem truncamento), ResultadoAnalise (score circular, gaps por severidade, borda colorida, pontos de atenção). Corrigida página de detalhes NR (`/normas/[id]`). Adicionado campo `urlOficial` em `NormaLocal`. |
| 16 | 2026-02-18 | Corrigido 404 nos links das NRs (URLs estimadas substituídas por listagem geral confirmada). NR-1 atualizada com link direto do PDF. Adicionada constante `URL_BASE_PDF`. Documentação completa atualizada (memory.md, CHANGELOG.md). |
| 17 | 2026-02-19 | Links diretos de todas as NRs (NR-2 a NR-38) confirmados e inseridos em `normas.ts`. Adicionado campo `urlAnexos` na interface `NormaLocal` com 17 anexos mapeados (NR-11: 1, NR-15: 15, NR-17: 2). Página `/normas/[id]` atualizada para exibir lista de anexos. Removida constante `URL_LISTAGEM_MTE` (não mais necessária). |
| 18 | 2026-02-19 | Corrigida extração de PDF (500 no `/api/extrair-texto`). Causa: `pdfjs-dist` sendo bundlado pelo webpack (`Object.defineProperty` em não-objeto) e worker sem configuração. Solução: `pdfjs-dist` + `mammoth` adicionados a `serverExternalPackages`; substituído `pdfjs-dist` por `pdf-parse` v2 com classe `PDFParse`; worker configurado via `file://` URL para `pdf.worker.mjs` (Node.js 18+ suporta workers com `file://` via `worker_threads`). |
| 19 | 2026-02-19 | Suporte a documentos grandes: limite Zod `documento.max` aumentado de 50k para 2M chars (era o causador do 400 "Documento muito grande"). Limite de upload no frontend aumentado de 10MB para 100MB. `groq.ts` já trunca em 500k chars antes de enviar à IA — sem mudança necessária. |

---

## Próximos passos para o LLM

> Ordem de prioridade. Cada item é uma tarefa independente que pode ser executada em uma sessão.

### Links diretos das NRs — CONCLUÍDO (Sessão 17)

Todas as 38 NRs têm `urlOficial` com link direto confirmado para o PDF no MTE.
NR-2 e NR-27 (revogadas) também têm links diretos para seus PDFs históricos.

Adicionado campo `urlAnexos?: { label: string; url: string }[]` na interface `NormaLocal`.
Anexos mapeados:
- **NR-11**: Anexo I (transporte de sacas)
- **NR-15**: 15 anexos (I ao XIV, incluindo XIII-A), com 2 apontando para Portaria MTP nº 426/2021
- **NR-17**: Anexos I (checkout) e II (teleatendimento)

Constantes de base utilizadas em `src/lib/data/normas.ts`:
- `URL_BASE_PDF` — caminho `normas-regulamentadoras-vigentes/`
- `URL_BASE_ARQUIVOS` — caminho `arquivos/normas-regulamentadoras/`
- `URL_BASE_PORTARIAS` — caminho `sst-portarias/2021/` (usado pelos Anexos III e VIII da NR-15)
- NR-37 usa URL completa própria (caminho `ctpp-nrs/`)

---

### Fase 5 - Qualidade

- **Implementar testes unitários para APIs críticas**
  - Prioridade: `/api/ia/analisar-conformidade`, `/api/normas`, `/api/health`
  - Usar Jest (já configurado no projeto)
  - Testar com banco SQLite in-memory para isolamento

- **Adicionar Error Boundaries nas páginas**
  - `src/app/normas/error.tsx`, `src/app/nr6/error.tsx`
  - Componente reutilizável com retry

### Fase 6 - Produção

- **Configurar Sentry para error tracking**
  - Instalar `@sentry/nextjs`, configurar DSN
  - Capturar erros de API e client-side

- **Otimizar Docker para produção**
  - Testar `docker-compose.prod.yml` end-to-end
  - Verificar healthcheck, volume persistente, limites de memória
  - Configurar backup do SQLite (cron job que copia `./data/sgn.db`)

### Fase 7 - Evolução (quando demandado)

- **Gráficos de evolução de conformidade** (tendência de score ao longo do tempo)
- **Timeline de análises realizadas**
- **Comparações side-by-side de documentos**

---

## Variáveis de Ambiente Necessárias

Copie `.env.example` para `.env.local` e configure:

```
GROQ_API_KEY=                   # Chave da API GROQ para IA (obrigatório)
```

Opcionais:
```
DATABASE_PATH=./data/sgn.db     # Caminho do banco SQLite (default: ./data/sgn.db)
PORT=3001                       # Porta do servidor (default: 3001)
LOG_LEVEL=info                  # Nível de log: error, warn, info, debug
```

---

## Comandos Essenciais

```bash
# Desenvolvimento
npm run dev          # Inicia dev server em localhost:3001
npm run build        # Build de produção
npm run lint         # Verifica linting

# Testes E2E
npm run test:e2e         # Roda todos os testes Playwright
npm run test:e2e:ui      # Abre UI interativa do Playwright
npm run test:e2e:report  # Abre relatório HTML da última execução

# Banco de dados (Drizzle)
npm run db:generate  # Gera migration SQL a partir do schema
npm run db:push      # Aplica schema diretamente no banco (dev)
npm run db:studio    # UI visual para inspecionar o banco

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
  ├── 2. Selecionar NRs aplicáveis (grid 2 colunas, chips de selecionadas)
  ├── 3. Clicar "Analisar Conformidade com IA"
  │     ├── POST /api/extrair-texto (extrai texto do arquivo)
  │     └── POST /api/ia/analisar-conformidade (GROQ + Llama 4 Scout)
  └── 4. Ver resultado (score circular, gaps por severidade, pontos de atenção, próximos passos)
```

**Componentes do fluxo:**
- `src/components/analise/UploadDocumento.tsx` — drag-and-drop com validação
- `src/components/analise/SeletorNormas.tsx` — grid de NRs com filtro e chips
- `src/components/analise/ResultadoAnalise.tsx` — exibição completa do resultado
- `src/app/page.tsx` — orquestra o fluxo completo
