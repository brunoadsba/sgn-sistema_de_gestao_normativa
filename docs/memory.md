# SGN - Memória do Projeto

> Documento de contexto para qualquer LLM que acesse este projeto.
> Atualizado em: 2026-02-20 (sessão 27: identidade mobile PWA e splash web por sessão)

---

## O que é o SGN

SGN (Sistema de Gestão Normativa) é uma plataforma local de análise de conformidade com IA para normas regulamentadoras brasileiras de SST (Segurança e Saúde no Trabalho).

**Foco principal:** o usuário sobe documentos de SST e a IA analisa conformidade contra as NRs, gerando relatórios executivos.

Projeto single-user, executado localmente. Única dependência externa: API do GROQ (LLM gratuito, open-source).

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.1.6 |
| Linguagem | TypeScript (strict mode) | 5.9.2 |
| UI | React + Tailwind CSS + shadcn/ui | React 19.1.0 |
| URL State | nuqs (query string state) | latest |
| Banco de dados | SQLite (better-sqlite3) + Drizzle ORM | 0.45.1 |
| IA | GROQ SDK (Llama 4 Scout 17B) | 0.32.0 |
| Validação | Zod | 4.1.5 |
| Animações | Framer Motion | 12.23.12 |
| Extração PDF | pdf-parse v2 (PDFParse class) | 2.4.5 |
| Testes E2E | Playwright | instalado (sessão 15) |
| Deploy | Docker (self-hosted) | - |
| Logging | Pino | 10.1.0 |

**Arquitetura simplificada:** Next.js + SQLite local (Drizzle ORM) + GROQ. Sem Redis, sem Supabase, sem React Query, sem autenticação. NRs armazenadas em arquivo TypeScript local (`src/lib/data/normas.ts`). Deploy via Docker com volume persistente para dados.

**Padrão de componentes (sessão 21):** Server Components buscam dados → Client Components recebem via props e gerenciam interatividade. Features organizadas em `src/features/[nome]/components/`. URL state gerenciado com `nuqs` (query strings, sem useState para estados compartilháveis).

---

## Interface e Design (sessão 20-21)

- **Dark mode forçado por padrão**: `<html className="dark">` em `layout.tsx`. Tailwind usa `darkMode: ["class"]`.
- **Canvas Background animado**: `src/components/ui/CanvasBackground.tsx` — partículas índigo interligadas por linhas, fundo `#0d1117 → #0f1525`.
- **Identidade PWA SGN**: ícones gerados em `src/app/icon.tsx` e `src/app/apple-icon.tsx` com tema escuro no manifest.
- **Abertura web padronizada**: splash visual exibida apenas no primeiro acesso da sessão via `SessionSplashGate`; loading interno em navegação usa skeleton leve.
- **Glassmorphism**: header com `backdrop-blur-md`, cards com `bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl`.
- **CSS Variables dark**: background `225 25% 7%` (~`#0d1117`), card `225 25% 10%`, border `225 20% 18%`.
- Todos os componentes possuem variantes `dark:` completas (Upload, SeletorNormas, ResultadoAnalise, páginas de normas).
- **Títulos com `bg-clip-text`**: usar `leading-normal` e `pb-2`+ para evitar corte de descendentes (g, j, p). Gradiente dark: `dark:from-gray-100 dark:via-indigo-300 dark:to-gray-100` para visibilidade.
- **NuqsAdapter** global em `layout.tsx`: obrigatório para `nuqs` funcionar com App Router.
- **Busca dinâmica** no catálogo de normas: client-side com debounce 300ms, estado na URL (`?search=`).

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
│   │   │   ├── health/             # Health check (database + api + llm)
│   │   │   ├── ia/                 # Análise de conformidade com IA
│   │   │   ├── normas/             # CRUD normas + stats
│   │   │   ├── nr6/                # Análise específica NR-6
│   │   │   └── search/             # Busca inteligente
│   │   ├── normas/                 # Páginas de normas (lista + [id]) — Server Component
│   │   ├── nr6/                    # Página análise NR-6
│   │   ├── layout.tsx              # Root layout — nav, CanvasBackground, dark mode, NuqsAdapter, SessionSplashGate
│   │   ├── icon.tsx                # Icone PWA SGN (512x512)
│   │   ├── apple-icon.tsx          # Icone PWA SGN para iOS (180x180)
│   │   ├── manifest.ts             # Manifest com tema escuro e icones de marca
│   │   ├── page.tsx                # Server Component: busca normas e renderiza AnaliseCliente
│   │   └── sitemap.ts              # Sitemap
│   ├── features/                   # Feature modules (sessão 21+)
│   │   ├── analise/components/     # AnaliseCliente.tsx (Client Component — upload, análise, resultado)
│   │   └── normas/components/      # ListaNormasDinamica.tsx (Client Component — busca com nuqs)
│   ├── components/
│   │   ├── analise/                # UploadDocumento, SeletorNormas, ResultadoAnalise
│   │   ├── dynamic/                # Lazy loading (DynamicComponents)
│   │   ├── loading/                # LoadingSpinner, AppOpeningScreen, SessionSplashGate
│   │   └── ui/                     # shadcn/ui (16 componentes) + CanvasBackground.tsx
│   ├── hooks/                      # use-toast
│   ├── lib/
│   │   ├── constants/              # tipos-documento.ts (60+ tipos SST)
│   │   ├── data/                   # normas.ts (38 NRs locais + helpers + urlOficial + urlAnexos)
│   │   ├── db/                     # schema.ts (Drizzle) + index.ts (cliente SQLite)
│   │   ├── ia/                     # groq.ts, analisador-nr6.ts, persistencia-analise.ts, analise-mappers.ts
│   │   ├── logger/                 # Pino logger
│   │   ├── env.ts                  # Validação de env com Zod
│   │   ├── errors.ts               # Classes de erro + handler centralizado
│   │   └── utils.ts                # cn() helper
│   ├── middlewares/                # security, validation
│   ├── schemas/                    # Zod schemas (norma, analise) — documento.max = 2M chars
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
- Campo `urlOficial`: link direto confirmado para o PDF no MTE em todas as 38 NRs
- Campo `urlAnexos?: { label: string; url: string }[]`: 17 anexos mapeados (NR-11: 1, NR-15: 15, NR-17: 2)
- Funções helper: `getNormas()`, `getNormaById()`, `searchNormas()`, `getNormasStats()`
- Constantes de URL: `URL_BASE_PDF`, `URL_BASE_ARQUIVOS`, `URL_BASE_PORTARIAS`

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

1. **Página principal de análise com IA** (Server Component + Client Component)
   - Upload de documento com drag-and-drop (PDF, DOCX, TXT) — até 100MB
   - Seletor de NRs: grid 2 colunas com filtro, chips de selecionadas, ações em lote
   - Análise de conformidade via GROQ + Llama 4 Scout (~1.2s)
   - Resultado: score circular SVG animado, gaps ordenados por severidade, pontos positivos/atenção, próximos passos em grid
2. **Catálogo de normas com busca dinâmica** (filtro client-side instantâneo com `nuqs`, estado na URL `?search=`)
3. Análise especializada NR-6 (EPIs)
4. Persistência de análises no SQLite (documentos, jobs, resultados, gaps)
5. Busca inteligente com ranking
6. Exportação de dados (CSV/JSON)
7. API de health check
8. Logging estruturado com Pino
9. CI/CD com GitHub Actions (3 workflows: ci, deploy, release)
10. Docker multi-stage build
11. Validação de env com Zod
12. Schemas Zod para APIs (camelCase) — limite de documento: 2M chars
13. **Testes E2E com Playwright** (5 suites: api, navegacao, normas, nr6, pagina-inicial)
14. **Interface dark mode** forçada por padrão com Canvas Background animado
15. **Arquitetura Server/Client Components** com data fetching server-side e interatividade isolada em Client Components
16. **Observabilidade e resiliência**: Sentry integrado + retry/timeout + idempotência
17. **Histórico avançado de uso**: filtros, ordenação, busca, paginação e exportação CSV com horário de Brasília
18. **Estratégia incremental para arquivos grandes**: chunking com overlap, orquestração por chunk, consolidação final e persistência de metadados de processamento
19. **Deploy Vercel estabilizado**: correções de `vercel.json`, `GROQ_API_KEY` em todos ambientes, upgrade para Next.js 16.1.6 e correção de CSP para destravar hidratação da home
20. **Performance web/mobile otimizada**: Canvas com perfil de baixo consumo no mobile, histórico sob demanda, remoção de N+1 em histórico, paginação/ordenação em SQL, paralelismo controlado no incremental e cache de leitura da KB local
21. **Abertura e branding modernizados**: ícones PWA de marca SGN, splash nativa escura no mobile, abertura web full-screen somente no primeiro acesso da sessão e loading interno substituído por skeleton leve

---

## O que NÃO funciona / está incompleto

### Prioridade Alta
- Worker assíncrono real não existe (processamento é síncrono)

### Prioridade Média
- Testes unitários: cobertura inicial criada para processamento incremental; ampliar para APIs críticas
- Monitoramento ainda básico (Sentry ativo; falta telemetria de negócio e alertas operacionais)
- Virtualização de listas para grandes volumes de normas

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
| 14 | 2026-02-15 | Limite de documento para IA aumentado de 50k para 500k caracteres em `src/lib/ia/groq.ts`. |
| 15 | 2026-02-18 | Removidos `@tanstack/react-query`, `bcryptjs`. Corrigido fetch em Server Components. Testes E2E com Playwright (5 suites). Melhorias UX/UI: SeletorNormas (chips, grid), ResultadoAnalise (score circular, gaps por severidade). Corrigida `/normas/[id]`. Campo `urlOficial` em `NormaLocal`. |
| 16 | 2026-02-18 | Corrigido 404 nos links das NRs. NR-1 com link direto do PDF. Constante `URL_BASE_PDF`. |
| 17 | 2026-02-19 | Links diretos de todas as 38 NRs confirmados. Campo `urlAnexos` com 17 anexos mapeados (NR-11, NR-15, NR-17). Removida `URL_LISTAGEM_MTE`. |
| 18 | 2026-02-19 | Corrigida extração de PDF (500 no `/api/extrair-texto`). Substituído `pdfjs-dist` por `pdf-parse` v2. `mammoth` e `pdf-parse` em `serverExternalPackages`. |
| 19 | 2026-02-19 | Suporte a documentos grandes: limite Zod `documento.max` → 2M chars. Upload frontend → 100MB. |
| 20 | 2026-02-19 | Redesign UX/UI completo: Canvas Background animado (partículas índigo em fundo escuro), glassmorphism nos cards e header, dark mode forçado por padrão (`<html class="dark">`), variáveis CSS dark refinadas, `dark:` variants em todos os componentes. Badge "Atualizado em tempo real" removido (informação inexistente). Aviso Next.js sobre `scroll-behavior: smooth` corrigido com `data-scroll-behavior="smooth"`. |
| 21 | 2026-02-19 | Refatoração Server/Client Components: `page.tsx` (análise) e `normas/page.tsx` convertidos para Server Components. Criados `AnaliseCliente.tsx` e `ListaNormasDinamica.tsx` como Client Components em `src/features/`. Adicionado `nuqs` para estado de busca via URL. `NuqsAdapter` global no layout. Corrigido título "Análise de Conformidade" apagado em dark mode. Corrigido corte da letra 'g' em títulos com `bg-clip-text`. Botão "Analisar" restaurado para gradiente vivo. |
| 22 | 2026-02-19 | Padronização de documentação: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `docs/Guia-Vercel.md` e `docs/sql/arquitetura.md` reorganizados em formato operacional e de engenharia. |
| 23 | 2026-02-20 | Confiabilidade operacional: retry/timeout em chamadas críticas, idempotência em análise IA, health check ampliado (db/api/llm), Sentry integrado (server/edge/client), error boundaries por rota e global. Histórico evoluído com filtros/paginação/ordenação/busca/export CSV em horário de Brasília e persistência em URL (`nuqs`). Qualidade validada com `lint`, `build` e E2E (29/29). |
| 24 | 2026-02-20 | Estratégia para documentos grandes: adicionados contratos backward-compatible (`estrategiaProcessamento`), chunking com overlap, orquestração incremental no endpoint de análise, consolidação/deduplicação de gaps com score ponderado, persistência de metadados por chunk e testes unitários específicos. |
| 25 | 2026-02-20 | Investigação forense de deploy e runtime em produção: removida configuração inválida no `vercel.json`, configurada `GROQ_API_KEY` em todos ambientes Vercel, upgrade para Next.js 16.1.6 por bloqueio de segurança no provider, ajuste de `eslint.config.mjs`/`next.config.js` para compatibilidade e correção de CSP que bloqueava scripts de hidratação (home presa em "Carregando SGN..."). |
| 26 | 2026-02-20 | Implementação do plano de performance web/mobile: CanvasBackground otimizado para mobile/reduced-motion e lazy-load via shell, AnaliseCliente refatorado com histórico sob demanda e `dynamic import` de resultado, otimização de bundle para `lucide-react`, remoção de N+1 no histórico com paginação/ordenação em SQL, criação de índices SQLite (`analise_resultados.created_at`, `analise_resultados.score_geral`, `conformidade_gaps.analise_resultado_id`), paralelização do incremental com limite de concorrência e cache em memória para leitura da base normativa por `mtime`. |
| 27 | 2026-02-20 | Modernização da abertura mobile/web: criação de ícones PWA de marca (`/icon`, `/apple-icon`), tema nativo escuro no manifest (`background_color/theme_color`), nova abertura visual com canvas (`AppOpeningScreen`), gate de splash somente no primeiro acesso da sessão (`SessionSplashGate`, 1100ms), loading global substituído por skeleton leve para navegação interna, ajustes responsivos adicionais em `/normas/[id]` (overflow/chips/CTA/botões) e teste unitário dedicado (`session-splash-gate.test.tsx`). |

---

## Próximos passos para o LLM

> Ordem de prioridade. Cada item é uma tarefa independente que pode ser executada em uma sessão.

### Fase 5 - Qualidade

- **Implementar testes unitários para APIs críticas**
  - Prioridade: `/api/ia/analisar-conformidade`, `/api/normas`, `/api/health`
  - Usar Jest (já configurado no projeto)
  - Testar com banco SQLite in-memory para isolamento

### Fase 6 - Produção

- **Evoluir observabilidade além de erro**
  - Definir alertas operacionais (falha de API, timeout IA, fila de processamento)
  - Adicionar métricas de negócio e dashboards

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
- **Dark mode**: forçado via `class="dark"` no `<html>`. Sempre adicionar variantes `dark:` ao criar novos componentes.

## Fluxo Principal da Aplicação

```
Página inicial (/) — Server Component
  └── AnaliseCliente (Client Component, recebe normas via props)
      ├── 1. Upload documento (drag-and-drop: PDF, DOCX, TXT — até 100MB)
      ├── 2. Selecionar NRs aplicáveis (grid 2 colunas com filtro e chips)
      ├── 3. Clicar "Analisar Conformidade com IA"
      │     ├── POST /api/extrair-texto (extrai texto do arquivo via pdf-parse/mammoth)
      │     └── POST /api/ia/analisar-conformidade (GROQ + Llama 4 Scout 17B, trunca em 500k chars)
      └── 4. Ver resultado (score circular SVG, gaps por severidade, pontos positivos/atenção, plano de ação)

Página de normas (/normas) — Server Component
  └── ListaNormasDinamica (Client Component, recebe normas via props)
      ├── Busca instantânea client-side com debounce 300ms
      ├── Estado persistido na URL via nuqs (?search=)
      └── Grid de cards com detalhes e navegação
```

**Componentes do fluxo:**
- `src/app/page.tsx` — Server Component: busca normas, renderiza AnaliseCliente
- `src/features/analise/components/AnaliseCliente.tsx` — Client Component: upload, seleção, análise, resultado
- `src/features/normas/components/ListaNormasDinamica.tsx` — Client Component: busca dinâmica com nuqs
- `src/components/analise/UploadDocumento.tsx` — drag-and-drop com validação (100MB max)
- `src/components/analise/SeletorNormas.tsx` — grid de NRs com filtro, chips e ações em lote
- `src/components/analise/ResultadoAnalise.tsx` — exibição completa do resultado com dark mode
- `src/components/ui/CanvasBackground.tsx` — background animado com canvas (partículas índigo)
