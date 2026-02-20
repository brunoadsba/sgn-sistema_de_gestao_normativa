# Changelog

Todas as mudanças relevantes do SGN são documentadas neste arquivo.

## [2026-02-20] - Redesign premium da tela de abertura (web/mobile)

### Alterado

- **`AppOpeningScreen`** (`src/components/loading/AppOpeningScreen.tsx`) refeito para seguir layout premium:
  - fundo escuro institucional com iluminação e textura geométrica
  - card central com identidade SGN e subtítulo SST
  - CTA primário `Acessar Plataforma` com microinteração de seta
  - rodapé institucional `© 2026 - SGN: Sistema de Gestão Normativa`
- **`SessionSplashGate`** (`src/components/loading/SessionSplashGate.tsx`):
  - títulos adaptados para a nova identidade visual (`Sistema de Gestão Normativa` / `Saúde e Segurança do Trabalho`)
  - comportamento de gate one-time por dispositivo preservado

### Validado

- `npm test -- session-splash-gate.test.tsx` sem falhas
- `npm run build` sem erros

## [2026-02-20] - Identidade mobile PWA e abertura web por dispositivo

### Adicionado

- **Ícones de marca SGN para PWA**: `src/app/icon.tsx` (512x512) e `src/app/apple-icon.tsx` (180x180)
- **Tela de abertura premium com canvas** em `src/components/loading/AppOpeningScreen.tsx`
- **Gate de abertura por dispositivo** em `src/components/loading/SessionSplashGate.tsx`:
  - abertura bloqueia interface até ação explícita do usuário
  - persistência em `localStorage` para exibição única por dispositivo
- **Teste unitário de comportamento da abertura** em `src/__tests__/session-splash-gate.test.tsx`

### Alterado

- **Manifest PWA** (`src/app/manifest.ts`):
  - `background_color` e `theme_color` ajustados para escuro (`#050b1b`)
  - troca de `favicon.ico` para ícones SGN (`/icon`, `/apple-icon`)
- **Metadata global** (`src/app/layout.tsx`):
  - manifest declarado explicitamente
  - `icons` e `appleWebApp` configurados
  - aplicação (header + conteúdo) envolvida com `SessionSplashGate` para bloqueio completo até o CTA
- **Tela de abertura** (`src/components/loading/AppOpeningScreen.tsx`):
  - substituída barra de progresso automática por CTA profissional `Acessar Plataforma`
  - ajuste para cobertura full-screen real (`min-h-screen`)
- **Loading global** (`src/app/loading.tsx`):
  - removida splash full-screen recorrente
  - adotado skeleton leve por seção para navegação interna
- **Página de detalhe da norma responsiva**:
  - `src/app/normas/[id]/page.tsx`: correções de overflow horizontal e wrapping em chips/CTA
  - `src/app/normas/[id]/components/BotoesSeguranca.tsx`: botões empilhados no mobile e full width
- **Jest config** (`jest.config.js`): ignorado `/.next/standalone/` para evitar colisão de módulo em testes direcionados

### Validado

- `npm test -- session-splash-gate.test.tsx` sem falhas
- `npm run build` sem erros
- Deploy em produção Vercel concluído com alias principal atualizado

## [2026-02-20] - Performance web/mobile (fase 1-4)

### Adicionado

- **Componente de histórico desacoplado** em `src/features/analise/components/HistoricoAnalisesCard.tsx` para reduzir re-render da tela principal
- **Shell lazy para canvas** em `src/components/ui/CanvasBackgroundShell.tsx`
- **Migration de índices de performance** em `drizzle/0001_perf_historico_indices.sql`

### Alterado

- **Canvas background otimizado** (`src/components/ui/CanvasBackground.tsx`):
  - redução de partículas para mobile/perfis de baixo consumo
  - pausa automática quando a aba perde foco (`visibilitychange`)
  - redução do custo de conexão entre partículas
- **Home mais leve** (`src/app/layout.tsx` + `src/features/analise/components/AnaliseCliente.tsx`):
  - canvas carregado via lazy shell client-side
  - resultado carregado via `dynamic import`
  - histórico movido para exibição sob demanda (`Mostrar Histórico`)
- **Bundle optimization** (`next.config.js`):
  - `optimizePackageImports` ampliado para `lucide-react`
- **Histórico mais eficiente** (`src/lib/ia/persistencia-analise.ts`):
  - remoção de padrão N+1 para gaps
  - ordenação/paginação movidas para SQL (`orderBy + limit + offset`)
- **Análise incremental paralelizada** (`src/app/api/ia/analisar-conformidade/route.ts`):
  - processamento concorrente de chunks com limite (`INCREMENTAL_CONCURRENCY`)
- **Cache de KB local** (`src/lib/normas/kb.ts`):
  - cache em memória com invalidação por `mtime`

### Validado

- `npm run lint` sem erros
- `npm run build` sem erros
- `npm run test:e2e` com **29/29 testes passando**
- Deploy de produção concluído com alias atualizado

### Métricas (produção, mesma janela de teste)

- **JS total home**: `916.554 bytes` -> `903.780 bytes` (~`-1,39%`)
- **Latência histórico (página 1, média 5 amostras)**: `498,4ms` -> `448,4ms` (~`-10,0%`)
- **Latência histórico (página 2, média 5 amostras)**: `267,6ms` -> `259,8ms` (~`-2,9%`)

## [2026-02-20] - Estabilização de deploy Vercel e correção forense de loading infinito

### Corrigido

- **Deploy bloqueado por configuração inválida na Vercel**: removida combinação incompatível de `builds` + `functions` em `vercel.json`
- **Falha de build por variável obrigatória ausente**: `GROQ_API_KEY` configurada nos ambientes `production`, `preview` e `development`
- **Bloqueio de deploy por vulnerabilidade**: atualização de `next` para `16.1.6` e `eslint-config-next` para `16.1.6` (mitigação de bloqueio por CVE no provider)
- **Tela inicial travada em "Carregando SGN..."**: correção de CSP em `next.config.js` para permitir scripts inline de hidratação do App Router em produção

### Alterado

- **`eslint.config.mjs`**: migração para configuração flat compatível com `eslint-config-next` mais recente
- **`next.config.js`**: removido bloco `eslint` depreciado para compatibilidade com Next.js 16
- **`vercel.json`**: simplificado para preset Next.js moderno e remoção de configuração que gerava warning de `manifest.webmanifest/route`

### Validado

- `npm run lint` sem erros
- `npm run build` sem erros
- `vercel build --prod` sem warning de mapeamento de `functions` para `manifest.webmanifest/route`
- Deploy de produção concluído com status `Ready` e alias principal atualizado

## [2026-02-20] - Confiabilidade operacional, observabilidade e estabilidade E2E

## [2026-02-20] - Estratégia incremental para documentos grandes

### Adicionado

- **Processamento incremental opcional** no contrato de análise (`estrategiaProcessamento: completo|incremental`) para manter backward compatibility da API
- **Chunking com overlap** em `src/lib/ia/chunking.ts` com metadados de rastreabilidade (`chunkId`, offsets, índice e total)
- **Consolidação de resultados por chunk** em `src/lib/ia/consolidacao-incremental.ts` com deduplicação de gaps e score ponderado
- **Testes unitários direcionados** para chunking/overlap e consolidação em `src/lib/ia/__tests__/processamento-incremental.test.ts`

### Alterado

- **Endpoint `/api/ia/analisar-conformidade`** com orquestração incremental por chunk, validação por evidência local e guardrail de custo (limite de chunks por requisição)
- **Persistência de análise** com metadados de processamento incremental para auditoria em `analise_resultados.metadata`
- **Documentação operacional e arquitetural** atualizada para refletir o novo fluxo para arquivos grandes

### Validado

- `npm run lint` sem erros
- `npm run build` sem erros
- `npm run test:e2e` com **29/29 testes passando**
- `npm test -- --runInBand src/lib/ia/__tests__/processamento-incremental.test.ts` com suíte verde

## [2026-02-20] - Confiabilidade operacional, observabilidade e estabilidade E2E

### Adicionado

- **Observabilidade com Sentry**: instrumentação server, edge e client com hooks oficiais (`onRequestError`, `onRouterTransitionStart`) e `global-error` para captura de erros de renderização no App Router
- **Error boundaries e loading states por rota**: cobertura para `/normas`, `/normas/[id]` e `/nr6` com fallback de erro e carregamento
- **Resiliência de chamadas HTTP**: utilitário `fetch-with-retry` com timeout e backoff para chamadas críticas
- **Idempotência em análise IA**: suporte a `Idempotency-Key` para evitar reprocessamento de requisições repetidas
- **Base de conhecimento local de normas (anti-alucinação)**: retrieval local com evidências normativas e script de sincronização (`npm run kb:sync`)
- **Rotina operacional de backup/restore**: scripts `db:backup` e `db:restore` para SQLite
- **ESLint v9 flat config**: migração para `eslint.config.mjs`

### Alterado

- **Histórico de análises**: filtros por período, ordenação por score/data, busca por nome, paginação visual e persistência em URL (`nuqs`)
- **Exportação CSV do histórico**: horário de Brasília e colunas extras (`tempoProcessamento`, `modeloUsado`)
- **Health check**: ampliado para status de `database`, `api` e `llm`
- **Configuração Sentry no Next.js**: opções deprecadas removidas e substituídas pelas chaves atuais de `webpack`
- **Páginas de análise e normas**: ajustes de estabilidade e separação Server/Client Components com foco em previsibilidade

### Validado

- `npm run lint` sem erros
- `npm run build` sem erros
- `npm run test:e2e` com **29/29 testes passando**
- `npm run kb:sync` concluído com **38/38 NRs** em `data/normas`
- `KB_STRICT_MODE=true` validado em cenário de lacuna de base (erro controlado)

### Operação portuária

- POP atualizado com checklist específico para fiscalização portuária (NR-29/NR-30 e correlatas)
- Critério de prontidão formalizado com gate **GO/NO-GO**

## [2026-02-19] - Padronização de documentação (Sessão 22)

### Alterado

- **`README.md`**: reestruturado em formato operacional (status, capacidades, stack, quick start, limites, comandos, troubleshooting e mapa de documentação)
- **`CONTRIBUTING.md`**: atualizado para padrão de engenharia (branch strategy, requisitos de PR, quality gates, critérios de aceite e convenções arquiteturais)
- **`SECURITY.md`**: reformulado com modelo de ameaça, riscos aceitos, hardening para ambiente público, gestão de secrets e política de divulgação de vulnerabilidades
- **`docs/sql/arquitetura.md`**: consolidado com padrão Server/Client Components, uso de `nuqs`, limites operacionais e débito técnico atual
- **`docs/Guia-Vercel.md`**: conteúdo genérico removido e substituído por guia de deploy do SGN (pré/pós-deploy, variáveis e limitações do SQLite em serverless)

### Notas

- Documentação alinhada ao estado atual até sessão 21 e organizada para manutenção contínua em padrão de projeto de produto.

---

## [2026-02-19] - Refatoração Server/Client Components + Filtro dinâmico com nuqs (Sessão 21)

### Adicionado

- **`nuqs`**: novo pacote para gerenciamento de estado via URL (query strings) — busca dinâmica sem reload
- **`NuqsAdapter`** em `src/app/layout.tsx`: provider global obrigatório para o nuqs funcionar com Next.js 15 App Router
- **`src/features/analise/components/AnaliseCliente.tsx`**: Client Component que encapsula toda a lógica interativa da página de análise (upload, seleção de normas, progresso, resultado). Recebe `normasIniciais` como prop do Server Component pai
- **`src/features/normas/components/ListaNormasDinamica.tsx`**: Client Component que implementa busca instantânea (client-side) no catálogo de normas com debounce de 300ms e estado persistido na URL via `nuqs` (`?search=`)

### Alterado

- **`src/app/page.tsx`**: refatorado de Client Component para **Server Component**. Data fetching das normas agora é server-side via `getNormas()`. Componente renderiza `AnaliseCliente` passando normas como prop
- **`src/app/normas/page.tsx`**: refatorado de busca server-side (via `searchParams`) para busca client-side dinâmica via `ListaNormasDinamica`. Título `h1` corrigido com `leading-normal pb-4` para evitar corte da letra 'g' em `bg-clip-text`. Envolvido com `Suspense` para compatibilidade com nuqs
- **`src/app/layout.tsx`**: adicionado `NuqsAdapter` envolvendo todo o conteúdo do body (header + main)
- **Título "Análise de Conformidade"** em `AnaliseCliente.tsx`: gradiente dark corrigido de `dark:from-gray-100 dark:to-gray-400` (apagado) para `dark:from-gray-100 dark:via-indigo-300 dark:to-gray-100` (brilhante e legível)
- **Botão "Analisar Conformidade com IA"**: restaurado para design com gradiente vivo (`from-blue-600 to-indigo-600`), shadow e hover animado. Versão flat `#263673` descartada por parecer permanentemente desabilitada

### Arquitetura

- Padrão estabelecido: **Server Component busca dados → Client Component recebe via props e gerencia interatividade**
- Features organizadas em `src/features/[nome]/components/` conforme regra do projeto

---

## [2026-02-19] - Redesign UX/UI completo e dark mode (Sessão 20)

### Adicionado

- **`src/components/ui/CanvasBackground.tsx`**: componente de fundo animado com Canvas API — partículas índigo interligadas por linhas em fundo escuro (`#0d1117 → #0f1525`), renderizado como Server Component via `'use client'`
- **Dark mode forçado**: `className="dark"` adicionado ao `<html>` em `layout.tsx`. Tailwind configurado com `darkMode: ["class"]`
- **`data-scroll-behavior="smooth"`**: atributo adicionado ao `<html>` para suprimir aviso do Next.js sobre transições de rota futuras

### Alterado

- **`src/app/globals.css`**: variáveis CSS do tema dark refinadas — background `225 25% 7%` (~`#0d1117`), card `225 25% 10%`, border `225 20% 18%`, primary `213 90% 60%`
- **`src/app/layout.tsx`**: header com glassmorphism (`backdrop-blur-md`), `dark:bg-gray-950/80`, `dark:border-gray-800/80`. `CanvasBackground` adicionado ao body
- **`src/app/page.tsx`**: títulos com gradiente `dark:from-gray-100`, cards `dark:bg-gray-900/60 backdrop-blur-xl`, progresso e erros com variantes dark
- **`src/app/normas/page.tsx`**: grid de cards com `dark:bg-gray-900/70`, títulos dark, input de busca dark. Badge "Atualizado em tempo real" **removido** (informação inexistente no projeto)
- **`src/app/normas/[id]/page.tsx`**: cabeçalho, seções e botões com variantes dark
- **`src/components/analise/UploadDocumento.tsx`**: drop zone, arquivo selecionado e badges de formato com variantes dark
- **`src/components/analise/SeletorNormas.tsx`**: input, botões, chips de NRs e lista de itens com variantes dark
- **`src/components/analise/ResultadoAnalise.tsx`**: `CONFIG_RISCO` e `CONFIG_SEVERIDADE` atualizados com classes dark, score, cards de gaps, pontos positivos/atenção e próximos passos com variantes dark

### Removido

- **Badge "Atualizado em tempo real"** em `src/app/normas/page.tsx`: funcionalidade inexistente no projeto removida da UI
- **Import `RefreshCw`** em `src/app/normas/page.tsx`: ícone sem uso removido

---

## [2026-02-19] - Suporte a documentos grandes (Sessão 19)

### Corrigido

- **`src/schemas/index.ts`**: limite `documento.max` aumentado de 50.000 para 2.000.000 caracteres — eliminado o erro 400 "Documento muito grande" para PDFs extensos

### Alterado

- **`src/components/analise/UploadDocumento.tsx`**: `TAMANHO_MAXIMO` aumentado de 10MB para 100MB; mensagem e texto da UI atualizados

### Notas

- `groq.ts` já trunca o documento em 500k chars antes de enviar à IA (proteção contra timeout na GROQ free tier, 30K TPM). Sem alteração necessária.

---

## [2026-02-19] - Extração de PDF corrigida (Sessão 18)

### Corrigido

- **`src/app/api/extrair-texto/route.ts`**: erro 500 ao processar PDFs. Causa: `pdfjs-dist` bundlado pelo webpack causava `TypeError: Object.defineProperty called on non-object`. Solução: substituído por `pdf-parse` v2 com classe `PDFParse`; worker configurado com `file://` URL para `pdf.worker.mjs`

### Adicionado

- **`pdf-parse@2.4.5`**: nova dependência para extração de texto de PDFs no server-side

### Alterado

- **`next.config.js`**: adicionados `mammoth` e `pdf-parse` a `serverExternalPackages` (evita bundling por webpack); removido `pdfjs-dist` (não mais utilizado diretamente)

---

## [2026-02-19] - Links de todas as NRs e anexos (Sessão 17)

### Adicionado

- **Campo `urlAnexos`** na interface `NormaLocal` (`src/lib/data/normas.ts`): array opcional de `{ label: string; url: string }` para mapear anexos individuais de cada NR
- **17 anexos mapeados**:
  - NR-11: Anexo I (transporte de sacas)
  - NR-15: Anexos I a XIV + XIII-A (15 anexos, incluindo 2 que apontam para Portaria MTP nº 426/2021)
  - NR-17: Anexo I (checkout) e Anexo II (teleatendimento)
- **Constante `URL_BASE_ARQUIVOS`**: segundo caminho base para PDFs no domínio do MTE (`arquivos/normas-regulamentadoras/`)
- **Constante `URL_BASE_PORTARIAS`**: caminho base para portarias SST de 2021
- **Seção de anexos na página `/normas/[id]`**: lista de links para todos os anexos quando existirem

### Alterado

- **`src/lib/data/normas.ts`**: `urlOficial` de todas as 38 NRs substituído por links diretos confirmados. NR-2 e NR-27 (revogadas) também receberam links diretos para seus PDFs históricos
- **`src/app/normas/[id]/page.tsx`**: adicionada seção "Anexos" abaixo do link oficial

### Removido

- **Constante `URL_LISTAGEM_MTE`**: removida de `normas.ts` pois todas as NRs agora têm link direto confirmado

---

## [2026-02-18] - Links diretos NRs e documentação (Sessão 16)

### Adicionado

- **`URL_BASE_PDF`** em `src/lib/data/normas.ts`: constante com o domínio base dos PDFs diretos do MTE (acesso-a-informacao / CTPP)
- **NR-1 com link direto confirmado**: `urlOficial` da NR-1 atualizado para o PDF específico `nr-01-atualizada-2025-i-3.pdf`

### Alterado

- **`src/lib/data/normas.ts`**: comentários atualizados explicando o status de cada URL (confirmada vs. fallback)
- **`docs/memory.md`**: atualização completa — stack (React Query removido, Playwright adicionado), histórico de sessões (15 e 16), estrutura de pastas (e2e/, remoção de lib/cache/), seção de próximos passos com tabela de status dos links por NR
- **`CHANGELOG.md`**: entradas de sessões 15 e 16

### Próximo passo documentado

- Bruno vai fornecer os links diretos individuais para NR-2 a NR-38 (exceto NR-2 e NR-27, revogadas)

---

## [2026-02-18] - Testes E2E, UX/UI e correções críticas (Sessão 15)

### Adicionado

- **Playwright E2E**: instalado e configurado (`playwright.config.ts`). 5 suites de testes em `e2e/`:
  - `api.spec.ts` — smoke tests de todas as rotas de API
  - `navegacao.spec.ts` — navegação global (header, links)
  - `normas.spec.ts` — catálogo de normas (busca, lista, detalhes)
  - `nr6.spec.ts` — página de análise NR-6 (formulário, validação)
  - `pagina-inicial.spec.ts` — fluxo principal (upload, seletor, validação)
- **Scripts de teste** em `package.json`: `test:e2e`, `test:e2e:ui`, `test:e2e:report`
- **Campo `urlOficial`** na interface `NormaLocal` em `src/lib/data/normas.ts`
- **`export const runtime = 'nodejs'`** e **`export const maxDuration = 120`** em `src/app/api/ia/analisar-conformidade/route.ts`

### Corrigido

- **Server Components com fetch relativo**: `src/app/normas/page.tsx` e `src/app/normas/[id]/page.tsx` usavam `fetch('/api/...')` (URL relativa), que falha silenciosamente em Server Components. Corrigido para import direto de `getNormasData()` e `getNormaById()` de `src/lib/data/normas.ts`
- **Página `/normas/[id]`**: substituída lógica frágil baseada em `titulo.includes("REVOGADA")` por `norma.status === 'revogada'`. Link "Acessar texto oficial" agora usa `norma.urlOficial`
- **404 nos links das NRs**: URLs estimadas com padrão `nr-XX-atualizada-YYYY.pdf` (inexistentes) substituídas por `URL_LISTAGEM_MTE` (confirmada pelo usuário)

### Removido

- **`@tanstack/react-query`** e **`@tanstack/react-query-devtools`**: dependências sem uso removidas
- **`bcryptjs`** e **`@types/bcryptjs`**: dependências sem uso removidas
- **`src/lib/cache/query-client.tsx`**: arquivo do provider React Query deletado
- **Import de `QueryProvider`** em `src/app/layout.tsx`

### UX/UI — `SeletorNormas.tsx`

- Grid alterado de 3 para 2 colunas (títulos completos sem truncamento)
- Removida classe `truncate` dos títulos das NRs
- Adicionada seção de chips acima da lista (NRs selecionadas com botão de remoção individual)
- Botão "Limpar" desativado quando nenhuma NR selecionada
- Placeholder do filtro atualizado

### UX/UI — `ResultadoAnalise.tsx`

- Score exibido como indicador circular SVG animado (substituiu exibição simples)
- Gaps ordenados por severidade (crítica > alta > média > baixa)
- Borda colorida esquerda (`border-l-4`) por severidade nos cards de gaps
- Adicionada seção de pontos de atenção (`pontosAtencao`) — estava ausente
- Contagem de gaps por severidade no cabeçalho (ex: "2 críticos, 3 altos")
- Numeração visual dos itens de "Próximos Passos"

---

## [2026-02-13] - Refatoração single-user (Sessão 13)

### Removido

- **Feature empresas completa**: páginas, API routes (`/api/empresas`, `/api/conformidade/*`, `/api/alertas/*`, `/api/demo/*`, `/api/security/*`, `/api/rate-limit`), schemas, componentes e tipos
- **Redis**: dependência `ioredis` removida, `src/lib/cache/redis.ts` deletado, variáveis de ambiente Redis removidas
- **Middlewares obsoletos**: `cache.ts` (Redis), `rate-limit.ts` (Redis)
- **Dependências**: `ioredis`, `@types/ioredis`, `pino-pretty`
- **Tabelas DB**: `empresas`, `documentos_empresa`, `alertas_conformidade` removidas do schema Drizzle
- **Campo `empresaId`**: removido de todas interfaces, schemas, APIs e componentes
- **Páginas descontinuadas**: `/performance`, `/security`
- **Script seed**: `scripts/seed.ts` (criava dados com empresas)
- **Diretório `obsoleto/`**: removido completamente

### Alterado

- **DB schema**: 4 tabelas restantes (`documentos`, `analise_jobs`, `analise_resultados`, `conformidade_gaps`), sem FKs de empresa
- **Health check**: simplificado, verifica apenas database + api (sem Redis)
- **env.ts**: apenas `GROQ_API_KEY`, `DATABASE_PATH`, `NODE_ENV`, `PORT`, `LOG_LEVEL`
- **Navegação**: 2 links (Analisar, Normas)
- **Sitemap**: removida entrada `/empresas`
- **Persistência IA**: `persistirAnaliseConformidade` e `listarAnalisesConformidade` sem filtro por empresa
- **Página NR-6**: removido campo empresaId do formulário
- **DynamicComponents**: removidos imports de componentes de conformidade
- **query-client.tsx**: removido `empresaId` das query keys
- **types/conformidade.ts**: reescrito sem interfaces de empresa
- **types/ia.ts**: simplificado, removidos tipos não usados

### Modelo de IA

- **Modelo trocado**: `llama-3.1-8b-instant` (8B) → `meta-llama/llama-4-scout-17b-16e-instruct` (17B ativos, 109B total, MoE 16 experts)
- **max_tokens aumentado**: conformidade 2000→4000, NR-6 1500→3000
- **Capacidades**: contexto 10M tokens, 460 tok/s, free tier 1000 req/dia + 30K TPM
- **Metadado `modeloUsado`** atualizado nas rotas `/api/ia/analisar-conformidade` e `/api/nr6/analisar`

### Validado

- `npx tsc --noEmit` — 0 erros
- Dev server em `localhost:3001` — status: ok
- Health check retornando `{ status: "ok" }`

## [2026-02-12] - Pós-migração SQLite (Sessões 8 e 9)

### Adicionado

- Persistência de análises IA no SQLite em `POST /api/ia/analisar-conformidade`
- Módulo de persistência em `src/lib/ia/persistencia-analise.ts`
- Mapeadores de análise em `src/lib/ia/analise-mappers.ts`
- Listagem de análises em `GET /api/ia/analisar-conformidade` com paginação

### Alterado

- `src/app/api/ia/analisar-conformidade/route.ts` atualizado para persistir resultados e usar respostas padronizadas

## [2026-02-12] - Migração Supabase -> SQLite (Sessão 7)

### Alterado

- Migração de dados e APIs para SQLite + Drizzle
- Remoção de dependências e referências a Supabase
- Introdução de dados normativos locais (`src/lib/data/normas.ts`)

### Infra

- Scripts Drizzle adicionados: `db:generate`, `db:push`, `db:studio`
- Volume de dados local configurado para Docker

## [2025-08-31] - Base do MVP

### Adicionado

- Next.js 15 + TypeScript strict
- APIs de normas e conformidade
- Upload e gestão documental
- Estrutura inicial de dashboard e busca
