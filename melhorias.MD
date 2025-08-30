# SGN — Melhorias Técnicas e Roadmap de Implementação

Status atual: MVP completo e operacional (frontend Next.js 15 + Supabase + N8N). Documento para acompanhar execução das melhorias até nível produção-empresa com foco em performance, escala, confiabilidade, a11y/SEO e DX.

## 1) Plano Prioritário (0–30 dias)
- [ ] Ordenação e paginação no banco (evitar sort pós-paginação)
  - [ ] Criar coluna `nr_num` (inteiro) derivada de `codigo` (ex.: "NR-17" → 17)
  - [ ] Popular `nr_num` para registros existentes
  - [ ] Criar índice btree em `nr_num` e `created_at`
  - [ ] Ajustar `GET /api/normas` para `.order("nr_num", { ascending: true })` antes de `.range()`
- [ ] Cache e fetch previsíveis
  - [ ] Usar URLs relativas no `Dashboard` (`/api/...`) e remover `no-store`
  - [ ] Definir revalidação curta (ex.: 60s) para stats/listagens
  - [ ] Ativar prefetch de links de navegação
- [ ] Rate limiting distribuído
  - [ ] Migrar de Map em memória para Redis (ou Supabase KV)
  - [ ] Chavear por `X-Forwarded-For` com fallback controlado
  - [ ] Aplicar em `search` e `export` com limites realistas
- [ ] Tipagem e validação
  - [ ] Criar tipos `Norma`, `NormaListResponse`, `StatsResponse`
  - [ ] Validar query params com Zod (page, limit, search, status)
- [ ] Modelo de dados mínimo
  - [ ] Adicionar coluna `status` (`ativa` | `revogada`) e parar de inferir por título

## 2) Base de Escala e Confiabilidade (30–90 dias)
- [ ] Busca escalável (Postgres FTS)
  - [ ] Criar coluna `search_vector = to_tsvector('portuguese', codigo || ' ' || titulo)`
  - [ ] Índice GIN em `search_vector`
  - [ ] Reescrever `GET /api/search` com `to_tsquery`/`plainto_tsquery` e `ts_rank_cd`
- [ ] Exportação robusta
  - [ ] CSV via streaming (resposta incremental) + BOM quando necessário
  - [ ] Sanitização forte (aspas, quebras de linha, separador)
  - [ ] Rate limit + paginação/cursor em exportações grandes
- [ ] Observabilidade e qualidade
  - [ ] Logger estruturado nas APIs (request_id, ip, latency, outcome)
  - [ ] Web Vitals em produção (LCP, INP, CLS) + alertas
  - [ ] Testes: API (contratos/validações) e UI (lista, filtros, paginação)

## 3) Experiência, Performance e “Mundo Aberto”
- [ ] Lista virtualizada de normas (renderizar somente viewport)
- [ ] Skeletons/Suspense em transições e carregamentos
- [ ] Lazy-load de componentes pesados e imagens com blur
- [ ] Prefetch preditivo (próximas páginas/rotas com maior probabilidade)
- [ ] PWA: Service Worker, cache de rotas/dados, background sync

## 4) SEO e Acessibilidade (a11y)
- [ ] `metadata` por rota (title/description/OG/Twitter) e OG Image
- [ ] Elementos com `aria-label` e estados não dependentes de cor
- [ ] Hierarquia semântica de cabeçalhos consistente

---

## Detalhamento por Tema (com referências de arquivos)

### A. Ordenação e Paginação
- Problema: ordenação numérica é aplicada após `.range()` (inconsistência entre páginas).
- Ações:
  1. Banco (Supabase/Postgres)
     - [ ] Coluna `nr_num int` derivada de `codigo`
     - [ ] `UPDATE normas SET nr_num = CAST(regexp_replace(codigo, '^NR-(\\d+).*$', '\\1') AS int);`
     - [ ] Índices: `CREATE INDEX ON normas(nr_num);` e `CREATE INDEX ON normas(created_at DESC);`
  2. API `frontend/src/app/api/normas/route.ts`
     - [ ] Substituir `.order("created_at", { ascending: false })` por `.order("nr_num")`
     - [ ] Remover ordenação no servidor após o fetch do range
  3. Testes:
     - [ ] Garantir estabilidade de paginação com >100 registros

### B. Cache, Revalidação e Fetch
- Ações:
  - [ ] `frontend/src/app/page.tsx`: usar `/api/...` (URL relativa) e remover `{ cache: "no-store" }`
  - [ ] Definir revalidação: `fetch(url, { next: { revalidate: 60 }})` ou `export const revalidate = 60` no handler
  - [ ] Habilitar `prefetch` padrão em `Link` e revisar navegação crítica

### C. Rate Limiting Distribuído
- Ações:
  - [ ] Introduzir Redis (`REDIS_URL`) e mover o controle para lá
  - [ ] Identificar IP real via `X-Forwarded-For` com validação
  - [ ] Aplicar nos endpoints: `search`, `export`, `normas` (se necessário)
  - [ ] Respostas padronizadas (429) com `resetAfter`
  - [ ] Monitorar contadores e acertos em logs

### D. Tipagem e Validação
- Ações:
  - [ ] Criar `frontend/src/types/norma.ts` com tipos para entidades e respostas
  - [ ] Zod para validar e normalizar query params (
        `page`, `limit`, `search`, `status`, `categoria`)
  - [ ] Tipar estados em `normas/page.tsx` e respostas em `page.tsx`

### E. Modelo de Dados e Índices
- Ações:
  - [ ] Coluna `status` (`ativa`|`revogada`) e backfill por heurística inicial
  - [ ] Corrigir filtros para usar `status` (não o título)
  - [ ] Índices: `status`, `codigo`, `created_at`

### F. Busca (FTS)
- Ações:
  - [ ] `search_vector` + índice GIN
  - [ ] `ts_rank_cd(search_vector, query)` para ranking
  - [ ] Prefix: `to_tsquery('portuguese', 'term:*')`
  - [ ] Debounce no client e cache curto no server

### G. Exportação
- Ações:
  - [ ] Streaming CSV (pipe) e limite de linhas por request
  - [ ] Sanitização: aspas, separador, linhas
  - [ ] BOM para compatibilidade Excel quando preciso
  - [ ] Paginação/cursor em exportações grandes

### H. UI/Performance
- Ações:
  - [ ] Virtualização de listas (ex.: `react-virtual`)
  - [ ] Skeletons e `Suspense` para transições
  - [ ] Lazy import de componentes pesados
  - [ ] Intersection Observer para prefetch sob demanda

### I. SEO e Acessibilidade
- Ações:
  - [ ] `metadata` por rota (`/`, `/normas`, `/normas/[id]`) com OG
  - [ ] `aria-*` nos botões e ícones sem texto
  - [ ] Estados com ícones/texto adicionais além de cor

### J. Observabilidade e Testes
- Ações:
  - [ ] Logger estruturado e `request_id` por request
  - [ ] Métricas de latência p50/p95 e taxa de erro por rota
  - [ ] Testes de API (contrato) e UI (paginação/filtros) com mocks

### K. PWA e "Mundo Aberto"
- Ações:
  - [ ] `next-pwa`/SW com estratégias por rota (stale-while-revalidate)
  - [ ] Cache de dados frequentes e background sync
  - [ ] Prefetch preditivo baseado em navegação

### L. Segurança
- Ações:
  - [ ] Headers de segurança (CSP, X-Frame-Options, etc.)
  - [ ] Limites de input e validação em todas as APIs
  - [ ] Revisão de RLS no Supabase e uso de chaves/roles

---

## Critérios de Aceite (KPIs)
- [ ] Lighthouse (mobile): Performance ≥ 95, Acessibilidade ≥ 95, SEO ≥ 95
- [ ] API p95 < 300 ms nas principais rotas
- [ ] Erros 5xx < 0,5% das requisições
- [ ] CLS < 0,1 | INP < 200ms | LCP < 1,2s (p75)

## Referências de Código
- `frontend/src/app/api/normas/route.ts`
- `frontend/src/app/api/search/route.ts`
- `frontend/src/app/api/export/route.ts`
- `frontend/src/app/api/rate-limit/route.ts`
- `frontend/src/app/page.tsx`
- `frontend/src/app/normas/page.tsx`
- `frontend/src/lib/supabase.ts`


