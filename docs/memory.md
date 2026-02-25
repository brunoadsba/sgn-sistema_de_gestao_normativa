# SGN - Memória do Projeto

> Documento de contexto para qualquer LLM que acesse este projeto.
> Atualizado em: 2026-02-25

- **Versão Atual**: `2.2.10`
- **Última Atualização**: 2026-02-25

---

## O que é o SGN

SGN (Sistema de Gestão Normativa) é uma plataforma local de análise de conformidade com IA para normas regulamentadoras brasileiras de SST (Segurança e Saúde no Trabalho).

**Foco principal:** o usuário sobe documentos de SST e a IA analisa conformidade contra as NRs, gerando relatórios executivos.

Projeto single-user, executado localmente. Provedores de IA: GROQ (cloud), Z.AI (GLM-4.7), Ollama (local).

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.1.6 |
| Linguagem | TypeScript (strict mode) | 5.9.2 |
| UI | React + Tailwind CSS + shadcn/ui | React 19.2.4 |
| URL State | nuqs (query string state) | latest |
| Banco de dados | Turso DB (@libsql/client) + Drizzle | v1.8.0 |
| IA | GROQ (Llama 3.3 70B) + Z.AI (GLM-4.7) + Ollama + NEX RAG (Streaming) | 2.2.9 |
| Validação | Zod | 4.1.5 |
| Animações | Framer Motion | 12.23.12 |
| Extração PDF | pdf-parse v2 (PDFParse class) | 2.4.5 |
| Testes E2E | Playwright | instalado (sessão 15) |
| Operação | Local-only (Node.js/Docker local) | - |
| Logging | Pino | 10.1.0 |
| Agentes IA | Harbor (Aider, Oracle, Qwen-Coder) | 0.1.44 |

**Arquitetura simplificada:** Next.js + SQLite local (Drizzle ORM) + provider IA configuravel (`groq`, `zai`, `ollama`). Sem Redis, sem Supabase, sem React Query, sem autenticação. NRs armazenadas em arquivo TypeScript local (`src/lib/data/normas.ts`). Operacao local via Node.js ou Docker com volume persistente para dados.

**Padrão de componentes (sessão 21):** Server Components buscam dados → Client Components recebem via props e gerenciam interatividade. Features organizadas em `src/features/[nome]/components/`. URL state gerenciado com `nuqs` (query strings, sem useState para estados compartilháveis).

---

## Interface e Design (sessão 20-21)

- **Dark mode forçado por padrão**: `<html className="dark">` em `layout.tsx`. Tailwind usa `darkMode: ["class"]`.
- **Canvas Background animado**: `src/components/ui/CanvasBackground.tsx` — partículas índigo interligadas por linhas, fundo `#0d1117 → #0f1525`.
- **Identidade PWA SGN**: ícones gerados em `src/app/icon.tsx` e `src/app/apple-icon.tsx` com tema escuro no manifest.
- **Abertura web padronizada**: tela full-screen premium (card glass, iluminação difusa e textura geométrica) com CTA `Acessar Plataforma`, exibida uma única vez por dispositivo via `SessionSplashGate` (`localStorage`); loading interno em navegação usa skeleton leve.
- **Glassmorphism**: header com `backdrop-blur-md`, cards com `bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl`.
- **Studio UX atual**: fluxo linear (Documento Fonte -> Configuração de Auditoria -> Resultado) com NEX em drawer lateral sob demanda.
- **CSS Variables dark**: background `225 25% 7%` (~`#0d1117`), card `225 25% 10%`, border `225 20% 18%`.
- Todos os componentes possuem variantes `dark:` completas (Upload, SeletorNormas, ResultadoAnalise, páginas de normas).
- **Títulos com `bg-clip-text`**: usar `leading-normal` e `pb-2`+ para evitar corte de descendentes (g, j, p). Gradiente dark: `dark:from-gray-100 dark:via-indigo-300 dark:to-gray-100` para visibilidade.
- **NuqsAdapter** global em `layout.tsx`: obrigatório para `nuqs` funcionar com App Router.
- **Busca dinâmica** no catálogo de normas: client-side com debounce 300ms, estado na URL (`?search=`).

---

## Estrutura de Pastas

```
/                                   # Raiz do projeto
├── .github/workflows/              # CI principal (workflow `ci` ativo)
├── docker/                         # nginx.conf + .env.example
├── docs/                           # README.md, architecture/, operations/, reference/, governance/, harbor/, archive/, memory.md
├── e2e/                            # Testes Playwright (api, navegacao, normas, nr6, pagina-inicial)
├── harbor-tasks/                   # Tarefas Harbor (async-worker, unit-tests, docker-harden)
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
| `conformidade_gaps` | Gaps identificados (severidade, GUT: probabilidade, pontuacao_gut, classificacao, prazo_dias, plano 5W2H em metadata) |

### Armazenamento

- Banco SQLite: `./data/sgn.db` (volume Docker persistente)
- Uploads de documentos: `./data/uploads/` (filesystem local)
- Schema: `src/lib/db/schema.ts`, Config: `drizzle.config.ts`
- Migrations versionadas: `drizzle/` (baseline local-only alinhado e journal coerente)
- Fluxo canônico local de sincronização de schema: `npm run db:push`

---

## O que funciona (implementado)

1.  **Página principal de análise com IA** (Server Component + Client Component)
    - Upload de documento com drag-and-drop (PDF, DOCX, TXT) — até 100MB
    - Seletor de NRs: grid 2 colunas com filtro, chips de selecionadas, ações em lote
    - Análise de conformidade via GROQ/Z.AI/Ollama (conforme AI_PROVIDER)
    - Resultado: score circular SVG animado, gaps ordenados por severidade, pontos positivos/atenção, próximos passos em grid
2.  **Catálogo de normas com busca dinâmica** (filtro client-side instantâneo com `nuqs`, estado na URL `?search=`)
3.  Análise especializada NR-6 (EPIs)
4.  Persistência de análises no SQLite (documentos, jobs, resultados, gaps)
5.  Busca inteligente com ranking
6.  Exportação de dados (CSV/JSON)
7.  API de health check
8.  Logging estruturado com Pino
9.  CI com GitHub Actions para qualidade contínua (`ci`)
10. Docker multi-stage build
11. Validação de env com Zod
12. Schemas Zod para APIs (camelCase) — limite de documento: 2M chars
13. **Testes E2E com Playwright** (5 suites: api, navegacao, normas, nr6, pagina-inicial)
14. **Interface dark mode** forçada por padrão com Canvas Background animado
15. **Arquitetura Server/Client Components** com data fetching server-side e interatividade isolada em Client Components
16. **Observabilidade e resiliência**: Sentry integrado + retry/timeout + idempotência
17. **Histórico avançado de uso**: filtros, ordenação, busca, paginação e exportação CSV com horário de Brasília
18. **Estratégia incremental para arquivos grandes**: chunking com overlap, orquestração por chunk, consolidação final e persistência de metadados
19. **Operação local estabilizada**: execução local padronizada com Docker e volume persistente
20. **Performance web/mobile otimizada**: Canvas low-power, lazy-load e cache de KB
21. **Branding modernizado**: ícones PWA, splash nativa e abertura premium
22. **IA Híbrida consolidada**: seletor dinâmico entre Groq (cloud) e Ollama (local). Expansão para Z.AI (GLM-4.7) como provider principal do Harbor.
23. **RAG de Alta Precisão**: ranking híbrido e normalização inteligente com 100% de Recall em casos críticos (CIPA/EPI/Portos)
24. **Harbor Scorecard**: suíte de validação de acurácia técnica com Golden Dataset consolidada
25. **Infraestrutura LibSQL/Turso**: Migração para `@libsql/client` com suporte a persistência remota opcional sem alterar o domínio local.
26. **Job Tracking & UX**: Sistema de polling e stepper visual para feedback de progresso em tempo real das análises assíncronas.
27. **Worker dedicado resiliente (Frente G)**: API passou a apenas enfileirar (`pending`) e worker fora do ciclo HTTP consome a fila com retry/backoff, timeout por job, dead-letter lógico e recuperação de órfãos (`processing` antigo).
28. **Operação docker app+worker**: `docker-compose` atualizado para `sgn-app` + `sgn-worker`, sem Redis/nginx no stack local-only.
29. **Relatório técnico print-first**: fluxo em dois passos (`Visualizar para Impressão` → `Imprimir / Salvar PDF`), resumo sanitizado (sem “Análise consolidada…” ou “ID do Job”), nome padrão `Relatório_SGN_dd-mm-yyyy_HH-MM`, cabeçalho com Matriz de Gaps mantida ativa na mesma página e sem dados sensíveis expostos.
30. **Fluxo de Análise via NR**: Início de diagnóstico direto pela página de detalhes da norma com pré-seleção automática.
31. **Studio minimalista + NEX Drawer**: setup e análise em fluxo único, com chat contextual acionado sem sair da tela principal.
32. **Diagnóstico de divergências**: fingerprint persistido com `inputHash`/`resultHash`, detector registra divergência quando hashes divergem e novo endpoint técnico `GET /api/ia/diagnostico-divergencias` permite consultas históricas paginadas por fingerprint.
---

## O que NÃO funciona / está incompleto

### Prioridade Média
- Testes unitários: cobertura inicial criada para processamento incremental; ampliar para APIs críticas
- Monitoramento ainda básico (Sentry ativo; falta telemetria de negócio e alertas operacionais)
- Virtualização de listas para grandes volumes de normas

### Prioridade Baixa
- Timeline de análises realizadas
- Comparações side-by-side de documentos

- [x] Histórico de análises (Turso DB).
- [x] Auto-Sugestão de NRs baseada em IA.
- [x] Accordions para visualização de gaps mobile.
- [x] Pausa automática de animações (Page Visibility).

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
| 28 | 2026-02-20 | Evolução do gate de abertura: removido auto-fechamento por tempo; abertura passa a bloquear o app até clique explícito em CTA profissional (`Acessar Plataforma`), com persistência one-time por dispositivo em `localStorage` (`sgn.opening.seen.device`). `SessionSplashGate` passou a envolver header e conteúdo para experiência de entrada única e consistente em web/mobile. |
| 29 | 2026-02-20 | Redesign visual da abertura para padrão premium: `AppOpeningScreen` migrada para layout institucional escuro com iluminação de fundo, textura geométrica, card central de marca SGN, CTA principal com seta e rodapé institucional. `SessionSplashGate` recebeu textos finais da identidade e manteve comportamento one-time por dispositivo. |
| 30 | 2026-02-21 | Qualidade e Infra: Testes unitários de API/Helps, fix de Memory Leak no chunking, remoção de dependências inseguras e E2E Playwright. |
| 31 | 2026-02-21 | V1.7.0: Otimização de RAG (Recall 1.00), IA Híbrida (Groq/Ollama), suporte NR-29/30 e Harbour Scorecard. |
| 32 | 2026-02-21 | V1.8.0: Evolução de Infraestrutura (Turso DB), UX (Progress Polling) e Produto (PDF Export). |
| 33 | 2026-02-21 | Estabilização de Deploy: Ajuste de ignore rules, rotas dinâmicas async (Next 15) e conexão Lazy DB via Proxy. |
| 34 | 2026-02-21 | V1.9.0: UX/UI Mestre - Auto-Sugestão de NRs, Accordions para Gaps e otimização de Canvas. |
| 35 | 2026-02-21 | Manutenção: Atualização de pacotes principais (`Next 16`, `React 19`, `Sentry`) e auditoria de segurança das dependências. |
| 36 | 2026-02-22 | Integração Harbor & Infra: Concluído hardening de Docker de produção, expansão de testes unitários de IA e estabilização do script Harbor Scorecard. Implementado Ollama Proxy (11435) para monitoramento de modelos locais. Patches críticos no agente Aider para suportar indexação rápida (fast-indexing) e timeouts de 1h (necessário para processamento estrutural via CPU no hardware local). Iniciado Worker Assíncrono (pendente conclusão). Versão 1.9.2. |
| 37 | 2026-02-23 | Migração de Infra Harbor para Z.AI (GLM-4.7). |
| 38 | 2026-02-23 | Introdução do NEX [SGN.ai] e Grounding de Chat RAG. |
| 39 | 2026-02-23 | **V2.0.0**: Redesign Workspace Style (3 Colunas) inspirado no NotebookLM. Chat Central Nativo, descarte de SidePanels redundantes e estabilização de layout ultra-wide. |
| 40 | 2026-02-24 | **V2.2.0**: Oracular Streaming (NEX), Power Mode (50MB), NEX Drawer, extração proativa, botão "Analisar com IA". |
| 41 | 2026-02-24 | **Extração estruturada GUT + 5W2H**: Metodologia GUT (probabilidade×severidade) em gaps, classificacao (CRITICO|ALTO|MEDIO|BAIXO), prazoDias automático, plano de ação 5W2H (what, who, prazoDias, evidenciaConclusao, kpi). Novos campos em conformidade_gaps e metadata. |
| 42 | 2026-02-24 | **Otimização Z.AI e Chat NEX**: `thinking: { type: "disabled" }` no GLM-4.7 para evitar content vazio; max_tokens 16384 (análise) e 4096 (chat); timeout 55s no chat; headers de streaming aprimorados. |
| 43 | 2026-02-24 | **Padronização documental (industry-style)**: estrutura de docs reorganizada por domínio (`architecture/`, `operations/`, `reference/`, `governance/`, `archive/`), criação de `docs/README.md`, atualização de arquitetura/POP/runbook, e manutenção de ponteiros para caminhos antigos. |
| 44 | 2026-02-24 | **Hardening operacional (industry-style)**: health check passou a validar LLM conforme `AI_PROVIDER` (Groq/Z.AI/Ollama) e CI foi ativada para `push`/`pull_request` em `master` com `concurrency` para cancelamento de execuções redundantes. |
| 45 | 2026-02-24 | **Diretriz operacional local-only**: projeto formalmente definido para execução apenas local (sem deploy); documentação e plano ajustados para runbook local e governança sem Vercel. |
| 46 | 2026-02-24 | **Desativação definitiva de deploy/release**: workflows legados `.github/workflows/deploy.yml` e `.github/workflows/release.yml` removidos do repositório; `ci.yml` permanece como pipeline oficial. |
| 47 | 2026-02-25 | **Atualização geral de documentação**: alinhados `README.md`, `SECURITY.md`, `docs/README.md`, `docs/architecture/arquitetura-tecnica.md`, `docs/operations/*` e `CHANGELOG.md` ao estado real local-only/CI-only. Gate local validado naquela execução: `tsc`, `lint`, `build` e `test:e2e` (33/33). |
| 48 | 2026-02-25 | **Hardening P0/P1 executado**: health check passou a refletir indisponibilidade de LLM (`503`), idempotência persistente por DB (`Idempotency-Key -> jobId`), sanitização de logs sensíveis nas rotas críticas, hardening do chat NEX (bloqueio de role `system` vinda do cliente), CORS local configurável por `ALLOWED_ORIGINS` e remoção de resíduos de script/redirect remoto. |
| 49 | 2026-02-25 | **Frente G concluída**: API de análise virou enfileirador puro (`pending`), worker dedicado fora do ciclo HTTP implementado com retry/backoff, timeout por job, dead-letter lógico e recuperação de jobs órfãos. Docker e script operacional ajustados para stack `sgn-app` + `sgn-worker`. |
| 50 | 2026-02-25 | **Hardening pós-Frente G**: criado endpoint de liveness (`/api/live`) para healthchecks de container sem dependência de LLM; loop do worker tornou-se resiliente a falhas transitórias; heartbeat por job introduzido para reduzir falso positivo na recuperação de órfãos; adicionadas suítes de teste `api-live` e `worker-runner`. |
| 51 | 2026-02-25 | **Validação E2E completa pós-hardening**: suíte Playwright executada com sucesso (`34/34`), incluindo criação de job assíncrono com polling até estado terminal e fluxos de navegação/normas/NR-6. |
| 52 | 2026-02-25 | **UX/UI de relatorio PDF elevada (Sprints 1-3 tecnico)**: adotado fluxo `Visualizar para Impressao -> Imprimir / Salvar PDF`, pre-visualizacao A4 em tela, layout print-first com utilitarios globais (`no-print`, `only-print`, `avoid-break`), shell blindado no print e nova suite E2E `relatorio-print.spec.ts`. Validacao E2E consolidada em `35/35`; checklist manual Chrome/Edge documentado em `docs/operations/checklist-validacao-impressao-relatorio-pdf.md`. |
| 53 | 2026-02-25 | **Estabilização determinística da análise (P0)**: adicionado `ANALYSIS_STRICT_DETERMINISM` (default `true`), providers com `temperature=0/top_p=1` no modo estrito, bloqueio de fallback cross-provider em erro de Groq, score final recalculado no backend por fórmula fixa com deduplicação e idempotência automática no frontend via `idempotency-key` determinística. |
| 54 | 2026-02-25 | **Calibração inicial por provider iniciada**: decisão automática `completo` vs `incremental` passou a usar limiares por provider (`GROQ=60000`, `ZAI=120000`, `OLLAMA=50000`). Baseline medido com PDF real de 41 páginas (`107.892` chars) em `docs/operations/calibracao-baseline-plano-mestre-ilheus.md`; no perfil Z.AI o caso passa a `completo`, reduzindo variabilidade por consolidação multi-chunk. |
| 55 | 2026-02-25 | **Bateria de repetibilidade pré-LLM executada (5 rodadas)**: com `Plano-Mestre_Complexo-Portuario-de-Ilheus.pdf`, hash de texto, contagens de texto/chunks e idempotency key ficaram 100% estáveis. Resultado registrado em `docs/operations/calibracao-repetibilidade-plano-mestre-ilheus.md`. |
| 56 | 2026-02-25 | **Bateria completa com LLM (5 rodadas, Z.AI) executada**: mesmo texto de entrada gerou variabilidade no resultado final (`score`, `nivelRisco`, `gaps` e `resultHash` instáveis; uma rodada retornou `70/medio/2 gaps`, demais `100/baixo/0 gaps`). Conclusão operacional: variabilidade residual está na inferência LLM; priorizar Frente D/E (fingerprint auditável + observabilidade + reuso estrito). |
| 57 | 2026-02-25 | **Frentes D/E implementadas (parcial hardening)**: fingerprint auditável passou a ser persistida em metadata do resultado (`inputHash`, `documentHash`, `resultHash`, `provider`, `model`, `promptVersion`, `chunkingVersion`, `chunkCount`), endpoint de análise passou a reaproveitar resultado por hash de entrada (`ANALYSIS_STRICT_REUSE=true`) e fechamento do job ganhou detector de divergência para mesmo `inputHash`. |
| 58 | 2026-02-25 | **Diagnóstico histórico de divergência implementado**: novo endpoint técnico `GET /api/ia/diagnostico-divergencias` com paginação/filtros (`dias`, `inputHash`, `incluirNaoDivergentes`), retornando agrupamento por fingerprint, hashes distintos e execuções recentes para auditoria operacional. |
| 59 | 2026-02-25 | **Normalização de saída da IA**: camada pós-processamento adicionada para corrigir erros textuais recorrentes (ex.: “ouuições” → “atribuições”), higienizar espaços/linhas e aplicar antes de persistência e cálculo de hash, garantindo relatório e fingerprint consistentes. |

---

## Próximos passos para o LLM

> Ordem de prioridade. Cada item é uma tarefa independente que pode ser executada em uma sessão.

### Fase 5 - Operação Local & Multi-Contexto

- **Sprint 2026-W09: Multi-Fontes (Prioridade Crítica)**
  - Implementar suporte para múltiplos arquivos simultâneos na Coluna de Fontes.
  - Orquestrar contexto concatenado para análise cross-document.
  - UI de listagem e gerenciamento de repositório local.

- **Evoluir observabilidade além de erro**
  - Definir alertas operacionais (falha de API, timeout IA, fila de processamento)
  - Adicionar métricas de negócio e dashboards


- **Otimizar Docker para operação local contínua**
  - Testar ciclo start/stop/status/logs com `npm run docker:*`
  - Verificar healthcheck, volume persistente, limites de memória
  - Configurar backup do SQLite (cron job que copia `./data/sgn.db`)

- **Manter decisão local-only consolidada (sem deploy remoto)**
  - Manter documentação e runbooks orientados apenas para execução local
  - Garantir que apenas o workflow `ci` permaneça ativo na pasta `.github/workflows/`

### Fase 7 - Evolução (quando demandado)

- **Extração estruturada avançada**: ver `docs/reference/prompt-extracao-estruturada-sgn.md` — GUT e 5W2H implementados; pendente: score por pilares e NRs por CNAE
- **Gráficos de evolução de conformidade** (tendência de score ao longo do tempo)
- **Timeline de análises realizadas**
- **Comparações side-by-side de documentos**

---

## Variáveis de Ambiente Necessárias

Copie `.env.example` para `.env.local` e configure:

```
AI_PROVIDER=zai                 # groq | zai | ollama
ANALYSIS_STRICT_DETERMINISM=true # Reprodutibilidade estrita (recomendado local/single-user)
ANALYSIS_STRICT_REUSE=true       # Reaproveita resultado para mesma fingerprint de entrada
ANALYSIS_INCREMENTAL_THRESHOLD_GROQ=60000
ANALYSIS_INCREMENTAL_THRESHOLD_ZAI=120000
ANALYSIS_INCREMENTAL_THRESHOLD_OLLAMA=50000
GROQ_API_KEY=                   # Obrigatório se AI_PROVIDER=groq
ZAI_API_KEY=                    # Obrigatório se AI_PROVIDER=zai
```

Opcionais:
```
DATABASE_PATH=./data/sgn.db     # Caminho do banco SQLite (default: ./data/sgn.db)
PORT=3001                       # Porta do servidor (default: 3001)
ALLOWED_ORIGINS=http://localhost:3001  # Origem permitida para CORS da API (se necessário)
LOG_LEVEL=info                  # Nível de log: error, warn, info, debug
ZAI_BASE_URL=                   # Default: https://api.z.ai/v1
ZAI_MODEL=glm-4.7               # Modelo Z.AI
OLLAMA_BASE_URL=                # Se AI_PROVIDER=ollama
OLLAMA_MODEL=                   # Ex: llama3.2
WORKER_ENABLED=true             # Habilita worker fora do ciclo HTTP
WORKER_MAX_RETRIES=2            # Retentativas por job
WORKER_JOB_TIMEOUT_MS=300000    # Timeout por job (ms)
WORKER_IDEMPOTENCY_CLEANUP_INTERVAL_MS=300000  # Limpeza periódica da tabela idempotency_keys
```

---

## Comandos Essenciais

```bash
# Desenvolvimento
npm run dev          # Inicia dev server em localhost:3001
npx tsc --noEmit     # Tipagem estrita
npm run build        # Build local (webpack)
npm run lint         # Verifica linting

# Testes E2E
npm run test:e2e         # Roda todos os testes Playwright
npm run test:e2e:ui      # Abre UI interativa do Playwright
npm run test:e2e:report  # Abre relatório HTML da última execução

# Banco de dados (Drizzle)
npm run db:push      # Fluxo canônico local: sincroniza schema com o banco
npm run db:generate  # Uso de manutenção: gera migration SQL versionada quando necessário
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
      ├── 3. Clicar "Analisar com IA"
      │     ├── POST /api/extrair-texto (extrai texto do arquivo via pdf-parse/mammoth)
      │     └── POST /api/ia/analisar-conformidade (GROQ/Z.AI/Ollama conforme AI_PROVIDER, chunking até 2M chars)
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
### Sessão 37 (23/02/2026) — Estabilização de Infra IA & Worker Assíncrono
**Objetivo:** Resolver bloqueios de conectividade com Ollama e implementar fluxo assíncrono padrão indústria.

**Principais Ações:**
1. **Migração Estratégica**: Transição do Harbor para o provedor **Z.AI (GLM-4.7)** como motor principal de cloud, resolvendo problemas de rede entre Docker e Host.
2. **Fix de Autenticação**: Identificado e neutralizado conflito de `OPENAI_API_KEY` legado no `.bashrc` que impedia o funcionamento de agentes externos.
3. **Async Worker (Feature Complete)**:
    - `POST /api/ia/analisar-conformidade` refatorado para ser 100% assíncrono com retorno `202 Accepted`.
    - Implementação de polling em `/api/ia/jobs/[id]`.
    - Suporte a `mode=sync` em query params para retrocompatibilidade.
4. **Expansão de Testes**: Cobertura de testes unitários para o core do sistema (IA, persistência e APIs) expandida com sucesso via agentes autônomos.
5. **Memory.md Update**: Documentação técnica atualizada para refletir a nova stack de IA Híbrida.

**Status Final:** Infraestrutura estável e feature de worker performando em background com **UX Reativa (Canvas)** integrada. O sistema agora exibe feedback visual neural durante o processamento. Pronto para escalar.

### Sessão 38 (23/02/2026) — Integração do Assistente NEX (Consultoria Neural)
**Objetivo:** Elevar a robustez e o UX da plataforma através de um Assistente de Consultoria Interativo ligado diretamente ao contexto de análise de documentos.

**Principais Ações:**
1. **Chat UI/UX Premium Interface:** Desenvolvimento de Componentes de Chat interativos (`ChatFloatingBubble.tsx` e `ChatInterface.tsx`) baseados em design *Glassmorphism*, abrangendo 80vw da tela.
2. **Branding e Posicionamento Visual:** Criação da identidade do robô nomeado **NEX** [SGN.ai], proporcionando personificação da autoridade normativa de IA, focada em responder com zero alucinação por atrelar (Grounding Estrito) todo seu banco de respostas à base PDF submetida pelo cliente.
3. **Engine RAG de Background:** Rotina independente de leitura (`/api/extrair-texto`) injetada via useEffect no client, que faz o *parsing* textual completo silenciosamente em background sem atrapalhar a pipeline principal.
4. **Proteção Cognitiva RAG:** Novo endpoint de backend `api/chat-documento` estabelecido com System Prompt de blindagem. Ele força a IA a interagir usando apenas o contexto provido, em Língua Portuguesa padrão (BR).

### Sessão 40 (24/02/2026) — V2.2.0: Oracular Streaming & Power Mode
**Objetivo:** Suportar escala industrial com arquivos gigantes e feedback instantâneo no chat.

**Principais Ações:**
1. **Oracular Streaming (NEX)**: Refatoração do chat para suporte a `ReadableStream`. A resposta da IA agora flui em tempo real, reduzindo a latência percebida e eliminando o timeout em respostas longas.
2. **Power Mode Local (50MB)**: Destravamento do sistema para arquivos gigantes. Limite de payload aumentado de 10MB para **50MB** e timeout de extração expandido para **120s**.
3. **Studio UX Unificada**: Migração definitiva para o **NEX Drawer** (painel lateral opaco). O `ChatFloatingBubble` foi descontinuado para simplificar a interface e resolver conflitos de Z-index (sobreposição no header).
4. **Extração Proativa**: Otimização do fluxo onde o chat inicia a extração de texto em background imediatamente após o upload, garantindo que o NEX esteja pronto para perguntas antes mesmo da análise técnica terminar.
5. **Renomeação Estratégica**: Botão de ação principal alterado para **"Analisar com IA"** para melhor clareza funcional.
6. **Hardening de Contexto**: Ajuste dinâmico de chunks para **80.000 caracteres** em provedores premium (Z.AI/GLM-4.7), maximizando o grounding documental.

**Status Final:** Sistema estabilizado em "Power Mode", capaz de processar documentos de escala industrial com UX de ponta e feedback instantâneo.
