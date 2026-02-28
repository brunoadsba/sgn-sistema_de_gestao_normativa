# Contributing

> Atualizado em: 2026-02-28

Fluxo oficial de contribuicao para o SGN.

## 1. Estrategia de Branch

1. Nao desenvolver direto em `master`.
2. Usar prefixos:
   - `feat/<tema>`
   - `fix/<tema>`
   - `docs/<tema>`
   - `chore/<tema>`
3. Uma branch por objetivo tecnico.

## 2. Padrao de Commit

Formato:

```text
tipo(scope): descricao
```

Exemplos:

- `feat(analise): adicionar validacao de payload`
- `fix(api): corrigir timeout de extracao`
- `docs(governance): aplicar 5s na documentacao`

## 3. Pull Request

### Requisitos Minimos

1. Objetivo e impacto claros.
2. Evidencia de validacao local.
3. Atualizacao documental quando aplicavel.

### Checklist Pre-PR

1. Qualidade estatica:
   ```bash
   npx tsc --noEmit
   npm run lint
   ```
2. Build:
   ```bash
   npm run build
   ```
3. Testes:
   ```bash
   npm run test:ci
   npm run test:e2e
   ```
4. Revisar docs afetadas:
   - `README.md`
   - `docs/architecture/arquitetura-tecnica.md`
   - `docs/operations/operacao-local.md`
   - `docs/memory.md`
   - `CHANGELOG.md`
   - `SECURITY.md` (se houver impacto de risco)
5. Verificar segredos:
   ```bash
   git grep -i "api_key\|password\|secret\|token"
   ```

## 4. Convencoes de Engenharia

1. TypeScript strict mode.
2. Zod para validacao de entrada.
3. Logs via `@/lib/logger`.
4. Server Components por padrao; `use client` apenas quando necessario.
5. Dark mode deve ter suporte visual completo nos componentes de UI.

## 5. Criticos para Merge

1. Nao quebrar rotas principais (`/`, `/normas`, `/normas/[id]`, `/nr6`).
2. Nao quebrar APIs criticas (`/api/extrair-texto`, `/api/ia/analisar-conformidade`).
3. Atualizar `CHANGELOG.md` para mudanca relevante.
4. Atualizar documentacao no mesmo PR (politica 5S).

## 6. Observacao Operacional

Baseline atual em `2026-02-26`:

1. `npx tsc --noEmit`: passou.
2. `npm run lint`: passou.
3. `npm run build`: passou.
4. `npm run test:ci`: passou.
5. `npm run test:e2e`: passou (`33/33`).
